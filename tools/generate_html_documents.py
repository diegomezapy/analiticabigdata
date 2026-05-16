from __future__ import annotations

import html
import re
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

import fitz


ROOT = Path(__file__).resolve().parents[1]
PUBLIC_BASE = "https://diegomezapy.github.io/analiticabigdata/"
COURSE_NAME = "Analítica de Big Data"
COURSE_CONTEXT = {
    "Carrera": "Matemática Estadística",
    "Modalidad": "Virtual",
    "Año académico": "2026",
    "Periodo": "Primer período",
    "Institución": "FACEN · Universidad Nacional de Asunción",
}

UNIT_BRIEFS = {
    1: {
        "competencia": "Reconoce las características de Big Data y configura un entorno reproducible de trabajo con R/RStudio.",
        "ruta": [
            "Leer la orientación de la unidad y ubicar los conceptos de volumen, variedad y velocidad.",
            "Configurar el entorno de análisis y ejecutar operaciones básicas con datos tabulares.",
            "Elaborar una primera lectura exploratoria con tablas, resúmenes y gráficos simples.",
        ],
        "evidencia": "Bitácora breve con comandos utilizados, capturas de salida y reflexión sobre calidad de datos.",
    },
    2: {
        "competencia": "Aplica técnicas de preparación, visualización y análisis exploratorio para datos estructurados.",
        "ruta": [
            "Identificar variables, tipos de datos y valores faltantes.",
            "Construir visualizaciones que respondan preguntas analíticas concretas.",
            "Preparar variables mediante binarización, imputación, estandarización o escalado según corresponda.",
        ],
        "evidencia": "Reporte exploratorio con gráficos comentados y decisiones de preparación justificadas.",
    },
    3: {
        "competencia": "Implementa modelos predictivos básicos y compara resultados con criterios estadísticos.",
        "ruta": [
            "Definir variable objetivo, predictores y partición de datos.",
            "Entrenar modelos supervisados como KNN y regresión logística.",
            "Comparar desempeño e interpretar errores de clasificación.",
        ],
        "evidencia": "Cuaderno reproducible con modelo, matriz de confusión y discusión de resultados.",
    },
    4: {
        "competencia": "Interpreta modelos estadísticos y comunica hallazgos de forma pertinente para la toma de decisiones.",
        "ruta": [
            "Revisar métricas, supuestos y límites del modelo.",
            "Aplicar análisis discriminante lineal y contrastar resultados.",
            "Sintetizar conclusiones, riesgos y recomendaciones en un informe final.",
        ],
        "evidencia": "Informe final con problema, datos, metodología, resultados, limitaciones y recomendación.",
    },
}

ACTIVITY_BRIEFS = {
    1: {
        "tipo": "Actividad formativa",
        "proposito": "Asegurar lectura activa del material y preparación conceptual antes de las tareas aplicadas.",
        "producto": "Notas de lectura, respuestas guía y registro de dudas para tutoría.",
    },
    2: {
        "tipo": "Actividad interactiva",
        "proposito": "Contrastar ideas con el grupo mediante foro, caso o problema de aplicación.",
        "producto": "Intervención argumentada y réplica académica a un aporte de un compañero.",
    },
    3: {
        "tipo": "Actividad autónoma evaluable",
        "proposito": "Verificar comprensión individual mediante cuestionario o entrega breve.",
        "producto": "Cuestionario completado o evidencia de procedimiento según la consigna.",
    },
}


def unit_title(unit: int) -> str:
    return {
        1: "Introducción al manejo de datos en Big Data",
        2: "Visualización y exploración de datos",
        3: "Machine Learning",
        4: "Interpretación de resultados y modelos estadísticos",
    }[unit]


DOCUMENTS = [
    {
        "source": "guia_didactica/BigData_GuiaDid.pdf",
        "target": "guia_didactica/index.html",
        "download": "guia_didactica/BigData_GuiaDid.pdf",
        "title": "Guía Académica y Didáctica",
        "subtitle": "Analítica de Big Data",
        "kind": "Guía del curso",
    },
    *[
        {
            "source": f"unidades/unidad{unit}/Orientaciones_Unidad_Unidad{unit}.pdf",
            "target": f"unidades/unidad{unit}/orientaciones.html",
            "download": f"unidades/unidad{unit}/Orientaciones_Unidad_Unidad{unit}.pdf",
            "title": f"Orientaciones de la Unidad {unit}",
            "subtitle": unit_title(unit),
            "kind": "Orientaciones",
        }
        for unit in range(1, 5)
    ],
    *[
        {
            "source": f"unidades/unidad{unit}/Descripcion_Actividad_Unidad{unit}_Act{act}.pdf",
            "target": f"unidades/unidad{unit}/actividad-{act}.html",
            "download": f"unidades/unidad{unit}/Descripcion_Actividad_Unidad{unit}_Act{act}.pdf",
            "title": f"Descripción de Actividad {act}",
            "subtitle": f"Unidad {unit}: {unit_title(unit)}",
            "kind": "Actividad",
        }
        for unit in range(1, 5)
        for act in range(1, 4)
    ],
    {
        "source": "unidades/unidad1/Material_Lectura_Unidad1.pdf",
        "target": "unidades/unidad1/material-lectura.html",
        "download": "unidades/unidad1/Material_Lectura_Unidad1.pdf",
        "title": "Material de Lectura",
        "subtitle": "Unidad 1: Introducción al manejo de datos en Big Data",
        "kind": "Material de lectura",
    },
    *[
        {
            "source": f"unidades/unidad{unit}/Material_Lectura_Unidad{unit}_Extendido.docx",
            "target": f"unidades/unidad{unit}/material-extendido.html",
            "download": f"unidades/unidad{unit}/material-extendido.pdf",
            "title": "Material de Lectura Extendido",
            "subtitle": f"Unidad {unit}: {unit_title(unit)}",
            "kind": "Material extendido",
        }
        for unit in range(1, 5)
    ],
]


def extract_pdf(path: Path) -> list[str]:
    doc = fitz.open(path)
    lines: list[str] = []
    for page_index, page in enumerate(doc, start=1):
        if page_index > 1:
            lines.append(f"Página {page_index}")
        for block in page.get_text("blocks"):
            raw_lines = [normalize(raw) for raw in block[4].splitlines()]
            raw_lines = [line for line in raw_lines if line]
            if not raw_lines:
                continue
            if len(raw_lines) > 1 and all(is_heading_or_meta(line) for line in raw_lines):
                lines.extend(raw_lines)
            else:
                lines.append(normalize(" ".join(raw_lines)))
    return collapse_repeated(lines)


def extract_docx(path: Path) -> list[str]:
    ns = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
    lines: list[str] = []
    with zipfile.ZipFile(path) as docx:
        root = ET.fromstring(docx.read("word/document.xml"))
    body = root.find("w:body", ns)
    if body is None:
        return lines
    for element in body:
        tag = strip_ns(element.tag)
        if tag == "p":
            text = paragraph_text(element, ns)
            if text:
                lines.append(text)
        elif tag == "tbl":
            for row in element.findall(".//w:tr", ns):
                cells = []
                for cell in row.findall("./w:tc", ns):
                    text = " ".join(
                        paragraph_text(p, ns)
                        for p in cell.findall(".//w:p", ns)
                    ).strip()
                    if text:
                        cells.append(text)
                if cells:
                    lines.append(" | ".join(cells))
    return collapse_repeated(lines)


def paragraph_text(element: ET.Element, ns: dict[str, str]) -> str:
    parts = []
    for text_node in element.findall(".//w:t", ns):
        if text_node.text:
            parts.append(text_node.text)
    return normalize("".join(parts))


def strip_ns(tag: str) -> str:
    return tag.split("}", 1)[-1]


def normalize(value: str) -> str:
    value = re.sub(r"\s+", " ", value.replace("\xa0", " ")).strip()
    return value


def collapse_repeated(lines: list[str]) -> list[str]:
    collapsed: list[str] = []
    previous = None
    for line in lines:
        if line == previous:
            continue
        collapsed.append(line)
        previous = line
    return collapsed


def line_to_html(line: str, index: int) -> str:
    escaped = html.escape(line)
    if not line:
        return ""
    if index == 0:
        return f"<p>{escaped}</p>"
    if re.match(r"^(Página \d+|pág\. \d+|www\.virtual\.facen\.una\.py)", line, re.I):
        return f'<p class="doc-meta-line">{escaped}</p>'
    if re.match(r"^•\s+", line):
        return f'<p class="doc-bullet">{escaped}</p>'
    if " | " in line:
        cells = "".join(f"<td>{html.escape(cell.strip())}</td>" for cell in line.split(" | "))
        return f'<table class="doc-table"><tr>{cells}</tr></table>'
    if is_heading(line):
        return f"<h2>{escaped}</h2>"
    return f"<p>{escaped}</p>"


def is_heading_or_meta(line: str) -> bool:
    return bool(re.match(r"^(Página \d+|pág\. \d+|www\.virtual\.facen\.una\.py)", line, re.I)) or is_heading(line)


def is_heading(line: str) -> bool:
    heading_patterns = [
        r"^\d+(\.\d+)*\.?\s+\S",
        r"^Unidad\s+\d",
        r"^Departamento de Educación",
        r"^Analítica de Big Data$",
        r"^Guía Didáctica$",
        r"^Orientaciones$",
        r"^Material de Lectura",
        r"^Descripción de Actividad",
        r"^Datos generales",
        r"^Datos del profesor",
        r"^Objetivo",
        r"^Actividades",
        r"^Metodología",
        r"^Contenido",
        r"^Cronograma",
        r"^Evaluación",
        r"^Referencias",
        r"^Tabla\s+\d",
        r"^Figura\s+\d",
        r"^Ejemplo",
        r"^(Python|R) Code:$",
    ]
    return any(re.match(pattern, line, re.I) for pattern in heading_patterns)


def render_document(spec: dict[str, str], lines: list[str]) -> str:
    target = spec["target"]
    depth = len(Path(target).parts) - 1
    css_path = "../" * depth + "css/documentos.css"
    asset_path = "../" * depth + "assets/academic/"
    canonical = PUBLIC_BASE + target.replace("\\", "/")
    download = spec.get("download", "")
    download_link = ""
    if download:
        download_href = "../" * depth + download
        download_link = f'<a class="doc-download" href="{download_href}" download>Descargar PDF</a>'
    frontmatter = render_academic_frontmatter(spec, asset_path)
    body = "\n".join(line_to_html(line, i) for i, line in enumerate(lines))
    return f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{html.escape(spec["title"])} — Analítica de Big Data</title>
  <meta name="description" content="{html.escape(spec["kind"])} de Analítica de Big Data FACEN.">
  <link rel="canonical" href="{canonical}">
  <link rel="stylesheet" href="{css_path}">
  <link rel="manifest" href="{ '../' * depth }manifest.json">
  <meta name="theme-color" content="#f8fafc">
</head>
<body>
  <main class="doc-shell">
    <div class="doc-brand-strip">
      <img src="{asset_path}facen-header.png" alt="FACEN Universidad Nacional de Asunción">
    </div>
    <header class="doc-header">
      <div class="doc-header-copy">
        <div class="doc-kicker">{html.escape(spec["kind"])}</div>
        <h1>{html.escape(spec["title"])}</h1>
        <p>{html.escape(spec["subtitle"])}</p>
      </div>
      <div class="doc-actions">
        <a class="doc-home" href="{ '../' * depth }dashboard.html">Volver a la plataforma</a>
        {download_link}
      </div>
    </header>
    {frontmatter}
    <article class="doc-content">
      <h2>Contenido del documento fuente</h2>
      {body}
    </article>
    <footer class="doc-footer">
      <img src="{asset_path}facen-footer.png" alt="Educación a Distancia FACEN UNA">
      <div>www.virtual.facen.una.py · Dpto. de Educación a Distancia</div>
    </footer>
  </main>
</body>
</html>
"""


def spec_unit(spec: dict[str, str]) -> int | None:
    match = re.search(r"unidad(\d)", spec.get("target", ""), re.I)
    if match:
        return int(match.group(1))
    return None


def spec_activity(spec: dict[str, str]) -> int | None:
    match = re.search(r"actividad-(\d)", spec.get("target", ""), re.I)
    if match:
        return int(match.group(1))
    return None


def render_academic_frontmatter(spec: dict[str, str], asset_path: str) -> str:
    unit = spec_unit(spec)
    act = spec_activity(spec)
    meta = "".join(
        f"<div><span>{html.escape(key)}</span><strong>{html.escape(value)}</strong></div>"
        for key, value in COURSE_CONTEXT.items()
    )
    if spec["kind"] == "Guía del curso":
        return f"""
    <section class="doc-cover-card guide">
      <img src="{asset_path}facen-cover.jpg" alt="Portada institucional FACEN">
      <div class="doc-cover-text">
        <h2>Guía académica de la asignatura</h2>
        <p>Documento marco para comprender la organización pedagógica, los objetivos, la metodología, el cronograma y los criterios de evaluación de la asignatura.</p>
      </div>
    </section>
    <section class="doc-meta-grid">{meta}</section>
    <section class="doc-study-note">
      <h2>Uso recomendado</h2>
      <p>Revise esta guía antes de iniciar las unidades. Utilícela como contrato didáctico: allí se indican las expectativas de participación, la secuencia de actividades, los plazos y la forma en que se consolidan las evidencias de aprendizaje.</p>
    </section>
"""
    if unit:
        brief = UNIT_BRIEFS[unit]
        ruta = "".join(f"<li>{html.escape(item)}</li>" for item in brief["ruta"])
        image = f"{asset_path}miniatura_unidad{unit}.png"
        if spec["kind"] == "Material extendido":
            image = f"{asset_path}portada_unidad{unit}.png"
        activity_html = ""
        if act:
            activity = ACTIVITY_BRIEFS[act]
            activity_html = f"""
      <div class="doc-activity-brief">
        <h3>{html.escape(activity["tipo"])}</h3>
        <p><strong>Propósito:</strong> {html.escape(activity["proposito"])}</p>
        <p><strong>Producto esperado:</strong> {html.escape(activity["producto"])}</p>
      </div>
"""
        return f"""
    <section class="doc-unit-card">
      <img src="{image}" alt="Imagen académica Unidad {unit}">
      <div>
        <div class="doc-kicker">Unidad {unit}</div>
        <h2>{html.escape(unit_title(unit))}</h2>
        <p>{html.escape(brief["competencia"])}</p>
      </div>
    </section>
    <section class="doc-meta-grid">{meta}<div><span>Unidad</span><strong>{unit}</strong></div></section>
    <section class="doc-study-note">
      <h2>Ruta de trabajo sugerida</h2>
      <ol>{ruta}</ol>
      <p><strong>Evidencia de aprendizaje:</strong> {html.escape(brief["evidencia"])}</p>
      {activity_html}
    </section>
"""
    return f'<section class="doc-meta-grid">{meta}</section>'


def render_index() -> str:
    document_items = "\n".join(
        f'<a href="{html.escape(spec["target"])}"><span>{html.escape(spec["kind"])}</span>{html.escape(spec["title"])} — {html.escape(spec["subtitle"])}</a>'
        for spec in DOCUMENTS
    )
    resource_items = """
<a href="guia_didactica/BigData_GuiaDid.pdf" download><span>PDF descargable</span>Guía Académica y Didáctica — PDF</a>
<a href="practicas/index.html"><span>Prácticas</span>Laboratorios guiados con datos CSV y código R</a>
<a href="data/datasets/clientes_compras.csv" download><span>Datos CSV</span>Clientes y compras — práctica Unidad 1</a>
<a href="data/datasets/estudiantes_ead.csv" download><span>Datos CSV</span>Estudiantes EAD — práctica Unidad 2</a>
<a href="data/datasets/modelos_credito.csv" download><span>Datos CSV</span>Modelos de crédito — prácticas Unidades 3 y 4</a>
"""
    items = resource_items + document_items
    return f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Documentos HTML — Analítica de Big Data</title>
  <meta name="description" content="Índice de documentos HTML insertables de Analítica de Big Data FACEN.">
  <link rel="canonical" href="{PUBLIC_BASE}documentos.html">
  <link rel="stylesheet" href="css/documentos.css">
  <link rel="manifest" href="manifest.json">
  <meta name="theme-color" content="#f8fafc">
</head>
<body>
  <main class="doc-shell">
    <div class="doc-brand-strip">
      <img src="assets/academic/facen-header.png" alt="FACEN Universidad Nacional de Asunción">
    </div>
    <header class="doc-header">
      <div class="doc-kicker">Documentos HTML</div>
      <h1>Analítica de Big Data</h1>
      <p>Guía, orientaciones, actividades y materiales listos para abrir o insertar desde GitHub Pages.</p>
      <a class="doc-home" href="dashboard.html">Volver a la plataforma</a>
    </header>
    <section class="doc-meta-grid">
      {"".join(f"<div><span>{html.escape(key)}</span><strong>{html.escape(value)}</strong></div>" for key, value in COURSE_CONTEXT.items())}
    </section>
    <nav class="doc-index">
      {items}
    </nav>
    <footer class="doc-footer">
      <img src="assets/academic/facen-footer.png" alt="Educación a Distancia FACEN UNA">
      <div>www.virtual.facen.una.py · Dpto. de Educación a Distancia</div>
    </footer>
  </main>
</body>
</html>
"""


def main() -> None:
    for spec in DOCUMENTS:
        source = ROOT / spec["source"]
        target = ROOT / spec["target"]
        if source.suffix.lower() == ".pdf":
            lines = extract_pdf(source)
        elif source.suffix.lower() == ".docx":
            lines = extract_docx(source)
        else:
            raise ValueError(f"Unsupported source type: {source}")
        download = spec.get("download")
        if download and source.suffix.lower() == ".docx":
            write_simple_pdf(ROOT / download, spec, lines)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(render_document(spec, lines), encoding="utf-8", newline="\n")
        print(f"generated {target.relative_to(ROOT)}")
    (ROOT / "documentos.html").write_text(render_index(), encoding="utf-8", newline="\n")
    print("generated documentos.html")


def write_simple_pdf(target: Path, spec: dict[str, str], lines: list[str]) -> None:
    target.parent.mkdir(parents=True, exist_ok=True)
    doc = fitz.open()
    header_img = ROOT / "assets/academic/facen-header.png"
    footer_img = ROOT / "assets/academic/facen-footer.png"
    header_xref = 0
    footer_xref = 0

    def decorate(page: fitz.Page) -> None:
        nonlocal header_xref, footer_xref
        if header_img.exists():
            header_xref = page.insert_image(
                fitz.Rect(320, 0, 595, 67),
                filename=str(header_img) if header_xref == 0 else None,
                xref=header_xref,
                keep_proportion=True
            )
        if footer_img.exists():
            footer_xref = page.insert_image(
                fitz.Rect(0, 797, 595, 842),
                filename=str(footer_img) if footer_xref == 0 else None,
                xref=footer_xref,
                keep_proportion=False
            )
        page.insert_text((54, 812), "Educación a Distancia FACEN UNA", fontsize=9, fontname="helv", color=(1, 1, 1))

    page = doc.new_page(width=595, height=842)
    decorate(page)
    margin = 54
    y = 96

    def add_page() -> fitz.Page:
        new_page = doc.new_page(width=595, height=842)
        decorate(new_page)
        return new_page

    def put(text: str, size: int = 10, bold: bool = False) -> None:
        nonlocal page, y
        font = "helv"
        max_width = page.rect.width - margin * 2
        for chunk in wrap_text(text, max_chars=max(45, int(max_width / (size * 0.48)))):
            if y > page.rect.height - margin:
                page = add_page()
                y = 96
            page.insert_text((margin, y), chunk, fontsize=size, fontname=font, color=(0.08, 0.12, 0.2))
            y += size * (1.55 if bold else 1.45)
        y += 2

    put("FACEN · Universidad Nacional de Asunción", size=9)
    put(spec["title"], size=18, bold=True)
    put(spec["subtitle"], size=12)
    y += 8
    for line in lines:
        if not line:
            continue
        put(line, size=12 if is_heading(line) else 10, bold=is_heading(line))
    doc.save(target)
    doc.close()
    print(f"generated {target.relative_to(ROOT)}")


def wrap_text(text: str, max_chars: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current: list[str] = []
    length = 0
    for word in words:
        extra = len(word) + (1 if current else 0)
        if current and length + extra > max_chars:
            lines.append(" ".join(current))
            current = [word]
            length = len(word)
        else:
            current.append(word)
            length += extra
    if current:
        lines.append(" ".join(current))
    return lines or [text]


if __name__ == "__main__":
    main()
