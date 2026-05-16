# Analítica de Big Data — FACEN

Plataforma educativa online para la asignatura **Analítica de Big Data** de la carrera Matemática Estadística, FACEN - UNA.

🌐 **Repositorio**: [https://github.com/diegomezapy/analiticabigdata](https://github.com/diegomezapy/analiticabigdata)

🌐 **GitHub Pages esperado**: [https://diegomezapy.github.io/analiticabigdata/](https://diegomezapy.github.io/analiticabigdata/)

---

## Unidades del curso

| Unidad | Tema |
|--------|------|
| 1 | Introducción al manejo de datos en Big Data |
| 2 | Visualización y exploración de datos |
| 3 | Machine Learning |
| 4 | Interpretación de resultados y modelos estadísticos |

## Funcionalidades

- Primer acceso de estudiantes con cédula/cédula solo si la cédula fue autorizada por el profesor.
- Materiales, orientaciones, guía y actividades como páginas HTML insertables y PDF descargables.
- Documentos HTML con encabezado, pie e identidad visual FACEN EaD.
- Prácticas guiadas por fichas con código R y datos CSV alojados en la web.
- Laboratorio ejecutable en navegador para R con `data.table` y Python con sintaxis `polars`.
- Cuestionarios interactivos con temporizador y retroalimentación.
- Flashcards y actividad de emparejamiento de conceptos.
- Registro de calificaciones, eventos y progreso en Google Sheets.
- Calendario configurable, recordatorios locales PWA y función de correos por Apps Script.
- Pestaña Administración visible para el rol profesor.
- Sistema de puntos XP y logros.
- Diseño responsive, instalable como PWA en móviles.

## Estructura

```text
├── index.html             # Login
├── dashboard.html         # Plataforma principal
├── documentos.html        # Índice HTML de documentos insertables
├── apps-script/           # Web App que guarda datos en Google Sheets
├── css/styles.css         # Estilos
├── css/documentos.css     # Estilos de documentos HTML
├── data/                  # Usuarios, cuestionarios y datasets CSV
├── laboratorio/           # Ejecutor webR/Pyodide para R y Python
├── practicas/             # Laboratorios HTML insertables
├── guia_didactica/        # Guía académica/didáctica en HTML
└── unidades/              # Materiales, orientaciones y actividades HTML
```

## Rutas HTML insertables

- Guía: `https://diegomezapy.github.io/analiticabigdata/guia_didactica/`
- Índice de documentos: `https://diegomezapy.github.io/analiticabigdata/documentos.html`
- Prácticas guiadas: `https://diegomezapy.github.io/analiticabigdata/practicas/`
- Laboratorio R/Python: `https://diegomezapy.github.io/analiticabigdata/laboratorio/`
- Unidad 1: `https://diegomezapy.github.io/analiticabigdata/unidades/unidad1/orientaciones.html`
- Actividades: `https://diegomezapy.github.io/analiticabigdata/unidades/unidad1/actividad-1.html`
- Dataset ejemplo: `https://diegomezapy.github.io/analiticabigdata/data/datasets/clientes_compras.csv`

## Acceso local de prueba

Usuario: `user`

Contraseña: `123`

Profesor: `profesor`

Contraseña docente inicial: `profesor2026`

Para estudiantes nuevos, el primer acceso es el número de cédula como usuario y como contraseña, siempre que la cédula ya figure en `data/usuarios.json`, en la administración local o en la hoja `Estudiantes` sincronizada por Apps Script. Luego pueden cambiar la clave desde `Cuenta`.

## Google Sheets

El libro de calificaciones configurado es:

`https://docs.google.com/spreadsheets/d/1eU6Fh073qLIOQaPonRim5d0e6IuGE0Bq8hDZHmlHKzI/edit`

Ver detalles en `SETUP_SHEETS.md`.

---

Primer período 2026 — FACEN
