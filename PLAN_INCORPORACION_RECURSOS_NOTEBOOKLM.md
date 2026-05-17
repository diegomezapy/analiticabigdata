# Plan de incorporacion de recursos NotebookLM

Curso: Analitica de Big Data - FACEN UNA 2026

Repositorio app: `G:\Mi unidad\FACEN_BIGDATA\BIGDATAapp\analiticabigdata`

Recursos fuente: `C:\Users\Diego\ABD_Recursos`

Fecha de diseno: 2026-05-16

## Estado de implementacion inicial

Implementado en esta primera incorporacion:

- `tools/import_notebooklm_resources.js` importa recursos livianos desde `C:\Users\Diego\ABD_Recursos`.
- `recursos/notebooklm/indice.json` queda como indice publico de la app.
- Se publican HTML/JSON/MD/TXT de los 12 subniveles y JSON de sintesis por unidad.
- La ruta secuencial de `dashboard.html` carga los 7 pasos de cada subnivel desde NotebookLM cuando el indice esta disponible.
- El panel "Necesito mas explicacion" carga mapa mental, flashcards y storyboard del subnivel.
- La evaluacion formal por subnivel se responde dentro del aula y se registra en Google Sheets.
- Los WAV se convierten a MP3 livianos y se publican junto con los MP4/PPTX de unidad en carga diferida.
- El service worker excluye MP3/MP4/PPTX/PDF del cache automatico para proteger la instalacion movil.

## 1. Diagnostico del material disponible

La carpeta de recursos contiene 233 archivos y 381,06 MB:

| Tipo | Cantidad | Uso recomendado |
| --- | ---: | --- |
| HTML | 73 | Contenido escrito embebible para la ruta secuencial |
| JSON | 94 | Evaluaciones, quizzes, flashcards, mapas mentales y enlaces |
| WAV | 7 | Podcasts de sintesis por unidad |
| PPTX | 8 | Presentaciones descargables por unidad |
| MP4 | 2 | Videos de vision macro para U3 y U4 |

Los 12 subniveles estan completos en contenido escrito, evaluacion base, flashcards y mapa mental NotebookLM. Hay 10 de 12 quizzes NotebookLM: faltan `u4_s2_comunicacion_resultados/quiz.json` y `u4_s3_etica_ia_bigdata/quiz.json`.

La app actual ya tiene una ruta secuencial por unidad, generada en `dashboard.html` desde `UNIT_SUBLEVELS`, con siete pasos por subnivel:

1. Inicio
2. Conceptos
3. Funciones
4. Procedimiento
5. Practica
6. Aplicacion
7. Evaluacion

El plan consiste en reemplazar el contenido sintetico escrito a mano por los recursos reales de NotebookLM, manteniendo la navegacion secuencial, el bloqueo progresivo, el registro de avance en Google Sheets, el laboratorio R/Python y los documentos FACEN oficiales como apoyo transversal.

## 2. Nueva ubicacion dentro de la app

Copiar los recursos a una estructura publica, estable y embebible:

```text
recursos/
  notebooklm/
    indice.json
    subniveles/
      u1_s1_que_es_bigdata/
        resumen.html
        microlectura.html
        funciones_r_python.html
        procedimiento.html
        practica_guiada.html
        aplicacion.html
        evaluacion.json
        quiz.json
        flashcards.json
        mapa_mental_nlm.json
        storyboard_video.md
        audio_microclase_url.txt
        audio_repaso_url.txt
        video_overview_url.txt
      ...
    unidades/
      u1_revolucion_bigdata/
        podcast_1.wav
        podcast_2.wav
        presentacion_1.pptx
        presentacion_2.pptx
        quiz_1.json
        quiz_2.json
        flashcards_1.json
        flashcards_2.json
        mapa_mental_1.json
        google_docs_links.json
      ...
```

El archivo `recursos/notebooklm/indice.json` debe ser el punto unico de lectura de la app. Debe mapear unidad, subnivel, slug, titulos, archivos disponibles, duracion sugerida, estado del quiz y recursos macro.

Ejemplo de registro:

```json
{
  "unidad": 3,
  "subnivel": 2,
  "codigo": "3.2",
  "slug": "u3_s2_regresion_logistica",
  "titulo": "Regresion Logistica",
  "tema": "sigmoide, log-odds, AUC-ROC, regularizacion",
  "archivos": {
    "resumen": "recursos/notebooklm/subniveles/u3_s2_regresion_logistica/resumen.html",
    "microlectura": "recursos/notebooklm/subniveles/u3_s2_regresion_logistica/microlectura.html",
    "funciones": "recursos/notebooklm/subniveles/u3_s2_regresion_logistica/funciones_r_python.html",
    "procedimiento": "recursos/notebooklm/subniveles/u3_s2_regresion_logistica/procedimiento.html",
    "practica": "recursos/notebooklm/subniveles/u3_s2_regresion_logistica/practica_guiada.html",
    "aplicacion": "recursos/notebooklm/subniveles/u3_s2_regresion_logistica/aplicacion.html",
    "evaluacion": "recursos/notebooklm/subniveles/u3_s2_regresion_logistica/evaluacion.json",
    "quiz": "recursos/notebooklm/subniveles/u3_s2_regresion_logistica/quiz.json",
    "flashcards": "recursos/notebooklm/subniveles/u3_s2_regresion_logistica/flashcards.json",
    "mapaMental": "recursos/notebooklm/subniveles/u3_s2_regresion_logistica/mapa_mental_nlm.json"
  }
}
```

## 3. Integracion pedagogica en la ruta secuencial

Cada subnivel debe convertirse en una mini-ruta cerrada de 7 pasos. La app debe cargar el recurso NotebookLM correspondiente en cada paso:

| Paso | Recurso NotebookLM | Funcion didactica |
| --- | --- | --- |
| Inicio | `resumen.html` + mapa mental resumido | Activar conocimientos previos y mostrar objetivo |
| Conceptos | `microlectura.html` | Estudiar teoria, errores comunes y ejemplos |
| Funciones | `funciones_r_python.html` | Comparar R/data.table y Python/Polars |
| Procedimiento | `procedimiento.html` | Seguir una receta reproducible |
| Practica | `practica_guiada.html` + laboratorio R/Python | Resolver fichas paso a paso |
| Aplicacion | `aplicacion.html` | Transferir a contexto paraguayo/latinoamericano |
| Evaluacion | `evaluacion.json` y, si existe, `quiz.json` | Evaluar el subnivel con retroalimentacion |

La guia didactica oficial y las orientaciones FACEN deben quedar como recursos transversales, disponibles desde el header y desde el panel lateral, pero no deben interrumpir el flujo del subnivel.

## 4. Cambios en `dashboard.html`

### 4.1 Separar datos de presentacion

Actualmente `UNIT_SUBLEVELS` contiene conceptos, formulas, codigo y evaluacion dentro del propio JS. Eso debe reemplazarse por un indice externo:

- Crear `NOTEBOOKLM_INDEX`.
- Cargar `recursos/notebooklm/indice.json` al iniciar la app.
- Mantener fallback local con los datos actuales por si falla la carga.

Funciones nuevas:

- `loadNotebookLmIndex()`
- `getNotebookSublevel(unitNum, sublevelIndex)`
- `resourceForStage(sublevel, stage)`
- `renderNotebookResourceFrame(resource)`
- `normalizeEvaluationJson(json)`
- `normalizeNotebookQuizJson(json)`
- `renderMindMapTree(json)`
- `renderNotebookFlashcards(json)`

### 4.2 Reescribir `buildSublevelSlides`

La funcion debe generar slides desde `indice.json`:

- `Inicio` apunta a `resumen.html`.
- `Conceptos` apunta a `microlectura.html`.
- `Funciones` apunta a `funciones_r_python.html`.
- `Procedimiento` apunta a `procedimiento.html`.
- `Practica` apunta a `practica_guiada.html`.
- `Aplicacion` apunta a `aplicacion.html`.
- `Evaluacion` apunta a `evaluacion.json` y `quiz.json` si existe.

Cada slide debe conservar:

- botones superiores `Necesito mas explicacion` y `Ya lei y comprendi`;
- bloqueo secuencial;
- progreso por subnivel;
- XP;
- registro en Google Sheets;
- enlace a PDF/descarga cuando exista.

### 4.3 Mejorar el panel "Necesito mas explicacion"

El panel debe dejar de ser generico. Debe usar:

- `mapa_mental_nlm.json` para mostrar ramas del tema;
- `flashcards.json` para repaso rapido;
- `storyboard_video.md` como guion explicativo si no hay video real;
- enlaces de audio/video cuando los `.txt` tengan URL valida.

El boton debe abrir un panel embebido, no una nueva pestana.

## 5. Evaluaciones y calificaciones

Hay dos fuentes por subnivel:

1. `evaluacion.json`: evaluacion formal, 5-7 preguntas, confiable para calificacion.
2. `quiz.json`: quiz NotebookLM complementario, 10 de 12 disponibles ahora.

Regla recomendada:

- La evaluacion del paso 7 usa siempre `evaluacion.json`.
- Si existe `quiz.json`, se muestra como "Practica de repaso adicional" y puede dar XP, pero no reemplaza la evaluacion formal.
- Los resultados enviados a Google Sheets deben incluir:
  - usuario;
  - cedula;
  - unidad;
  - subnivel;
  - slug;
  - tipo (`evaluacion_subnivel`, `quiz_repaso`, `flashcards`, `practica_guiada`);
  - puntaje;
  - correctas;
  - total;
  - respuestas;
  - tiempo;
  - fecha.

Esto permite que el profesor vea desempeno por partes, no solamente por unidad completa.

## 6. Recursos macro por unidad

Crear una vista "Recursos de unidad" dentro de cada unidad, no como pestaña nueva global.

Debe incluir:

- audio podcasts WAV en reproductor HTML5;
- PPTX como descarga;
- MP4 embebido para U3 y U4;
- quizzes y flashcards de unidad como repaso final;
- mapas mentales de unidad;
- reportes Google Docs como enlaces externos.

Para no hacer pesada la app:

- los WAV y MP4 no deben precargarse;
- usar `preload="metadata"`;
- no incluir estos archivos en cache offline del service worker;
- ofrecer descarga cuando el navegador no reproduzca bien.

## 7. Publicacion y peso del sitio

Los 381 MB caben dentro del limite publicado de GitHub Pages si se mantiene el sitio por debajo de 1 GB. La documentacion oficial de GitHub Pages indica que el sitio publicado no debe superar 1 GB y que el ancho de banda mensual tiene un limite blando de 100 GB.

Riesgos:

- Los WAV son grandes y consumen ancho de banda.
- Archivos cercanos o superiores a 50 MB pueden generar advertencias de GitHub al hacer push.
- El cache offline no debe guardar medios pesados.

Mitigacion:

- Fase 1: publicar todos los HTML/JSON, que pesan muy poco.
- Fase 2: convertir WAV a MP3/OGG antes de publicar o alojarlos como assets externos si se desea reducir peso.
- Fase 3: publicar PPTX/MP4 cuando la navegacion basica ya este validada.

## 8. Service worker y PWA

Actualizar `sw.js`:

- subir version de cache en cada cambio;
- cachear solo:
  - `dashboard.html`;
  - CSS;
  - JS/HTML pequenos;
  - JSON de indices/evaluaciones;
  - iconos.
- excluir:
  - `.wav`;
  - `.mp4`;
  - `.pptx`;
  - PDFs pesados;
  - Google Docs externos.

Esto evita que la PWA intente descargar cientos de MB al instalarse en el movil.

## 9. Plan por fases

### Fase 1 - Ingestion y publicacion ligera

1. Copiar `C:\Users\Diego\ABD_Recursos\subniveles` a `recursos/notebooklm/subniveles`.
2. Copiar solo JSON/HTML/MD/TXT, sin WAV/PPTX/MP4 todavia.
3. Generar `recursos/notebooklm/indice.json`.
4. Validar rutas desde GitHub Pages.

Resultado: los 12 subniveles quedan embebibles y navegables.

### Fase 2 - Ruta secuencial real

1. Cargar `indice.json` en `dashboard.html`.
2. Reemplazar los textos sinteticos por iframes o lectores embebidos de los HTML NotebookLM.
3. Integrar mapas mentales y flashcards en el panel de apoyo.
4. Agregar estado "recurso visto" por paso.

Resultado: cada paso de la ruta usa contenido real.

### Fase 3 - Evaluacion por subnivel

1. Crear motor de evaluacion para `evaluacion.json`.
2. Normalizar `quiz.json` NotebookLM para repaso adicional.
3. Registrar cada intento en Sheets.
4. Mostrar retroalimentacion pregunta por pregunta.

Resultado: el profesor puede medir aprendizaje por subnivel.

### Fase 4 - Biblioteca macro de unidad

1. Copiar recursos de unidad pequenos: mapas, quizzes, flashcards y enlaces Google Docs.
2. Crear bloque "Sintesis de unidad" dentro de cada unidad.
3. Incluir podcasts, videos y PPTX en carga diferida.
4. Decidir si WAV se convierten a MP3 antes de publicar.

Resultado: cada unidad tiene recursos ampliados sin romper la ruta secuencial.

### Fase 5 - Experiencia avanzada

1. Agregar buscador interno por subnivel y tipo de recurso.
2. Agregar "modo repaso antes del examen" que mezcle flashcards, mapa mental y preguntas falladas.
3. Agregar dashboard docente por subnivel: avance, puntajes, preguntas mas falladas.
4. Agregar recomendaciones automaticas:
   - si falla conceptos, sugerir microlectura;
   - si falla codigo, sugerir funciones R/Python;
   - si falla aplicacion, sugerir caso paraguayo.

## 10. Orden recomendado de implementacion

1. Generador de indice y copia ligera de recursos.
2. Carga del indice en la app.
3. Render de HTML NotebookLM dentro de la ruta.
4. Motor de evaluacion por subnivel.
5. Flashcards y mapa mental en panel de apoyo.
6. Recursos macro por unidad.
7. Publicacion de medios grandes o conversion a MP3.

Este orden permite ver mejoras utiles desde la primera fase y evita bloquear la app por el peso de audio/video.
