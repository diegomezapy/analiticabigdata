from __future__ import annotations

import html
import re
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

import fitz


ROOT = Path(__file__).resolve().parents[1]
PUBLIC_BASE = "https://diegomezapy.github.io/analiticabigdata/"


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
        "title": "Guía Académica y Didáctica",
        "subtitle": "Analítica de Big Data",
        "kind": "Guía del curso",
    },
    *[
        {
            "source": f"unidades/unidad{unit}/Orientaciones_Unidad_Unidad{unit}.pdf",
            "target": f"unidades/unidad{unit}/orientaciones.html",
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
        "title": "Material de Lectura",
        "subtitle": "Unidad 1: Introducción al manejo de datos en Big Data",
        "kind": "Material de lectura",
    },
    *[
        {
            "source": f"unidades/unidad{unit}/Material_Lectura_Unidad{unit}_Extendido.docx",
            "target": f"unidades/unidad{unit}/material-extendido.html",
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
    if index == 0:
        return f"<p>{escaped}</p>"
    if re.match(r"^(Página \d+|pág\. \d+|www\.virtual\.facen\.una\.py)", line, re.I):
        return f'<p class="doc-meta-line">{escaped}</p>'
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
    canonical = PUBLIC_BASE + target.replace("\\", "/")
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
</head>
<body>
  <main class="doc-shell">
    <header class="doc-header">
      <div class="doc-kicker">{html.escape(spec["kind"])}</div>
      <h1>{html.escape(spec["title"])}</h1>
      <p>{html.escape(spec["subtitle"])}</p>
      <a class="doc-home" href="{ '../' * depth }dashboard.html">Volver a la plataforma</a>
    </header>
    <article class="doc-content">
      {body}
    </article>
  </main>
</body>
</html>
"""


def render_index() -> str:
    items = "\n".join(
        f'<a href="{html.escape(spec["target"])}"><span>{html.escape(spec["kind"])}</span>{html.escape(spec["title"])} — {html.escape(spec["subtitle"])}</a>'
        for spec in DOCUMENTS
    )
    return f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Documentos HTML — Analítica de Big Data</title>
  <meta name="description" content="Índice de documentos HTML insertables de Analítica de Big Data FACEN.">
  <link rel="canonical" href="{PUBLIC_BASE}documentos.html">
  <link rel="stylesheet" href="css/documentos.css">
</head>
<body>
  <main class="doc-shell">
    <header class="doc-header">
      <div class="doc-kicker">Documentos HTML</div>
      <h1>Analítica de Big Data</h1>
      <p>Guía, orientaciones, actividades y materiales listos para abrir o insertar desde GitHub Pages.</p>
      <a class="doc-home" href="dashboard.html">Volver a la plataforma</a>
    </header>
    <nav class="doc-index">
      {items}
    </nav>
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
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(render_document(spec, lines), encoding="utf-8", newline="\n")
        print(f"generated {target.relative_to(ROOT)}")
    (ROOT / "documentos.html").write_text(render_index(), encoding="utf-8", newline="\n")
    print("generated documentos.html")


if __name__ == "__main__":
    main()
