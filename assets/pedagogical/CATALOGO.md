# Catálogo de Imágenes Pedagógicas — ABD 2026

**Fuente:** unDraw (open-source, sin atribución requerida)  
**Carpeta:** `assets/pedagogical/`  
**Total:** 34 ilustraciones SVG

---

## UNIDAD 1 — Revolución del Big Data

| Archivo | Subnivel recomendado | Descripción |
|---------|----------------------|-------------|
| `u1_data.svg` | 1.1 Qué es Big Data | Persona interactuando con datos flotantes — concepto general |
| `u1_data_processing.svg` | 1.1 Qué es Big Data | Engranajes procesando datos — pipeline de datos |
| `u1_circuit_board.svg` | 1.1 Ecosistema Big Data | Placa de circuitos — infraestructura tecnológica |
| `u1_server.svg` | 1.1 / 1.2 | Servidores/data center — almacenamiento |
| `u1_cloud_hosting.svg` | 1.2 Entorno de trabajo | Nube con archivos — cloud computing |
| `u1_developer.svg` | 1.2 R/RStudio | Desarrollador frente a pantalla con código |
| `u1_data_input.svg` | 1.3 Operaciones básicas | Formulario de entrada de datos — import/read |
| `u1_online_learning.svg` | 1.2 Entorno de trabajo | Estudiante aprendiendo online |

## UNIDAD 2 — Visualización y EDA

| Archivo | Subnivel recomendado | Descripción |
|---------|----------------------|-------------|
| `u2_analytics.svg` | 2.1 Fundamentos visualización | Persona viendo gráficos en pantalla — gramática de gráficos |
| `u2_charts.svg` | 2.1 ggplot2 / seaborn | Gráfico de barras y líneas — tipos de chart |
| `u2_data_trends.svg` | 2.2 Estadísticos descriptivos | Tendencias en datos — estadísticos de resumen |
| `u2_data_points.svg` | 2.3 Correlación | Puntos dispersos — scatter plot / correlación |
| `u2_statistics.svg` | 2.2 / 2.3 | Persona con estadísticas y gráficos |
| `u2_dashboard.svg` | 2.1 / 2.3 | Panel de indicadores — visualización integrada |
| `u2_design_stats.svg` | 2.1 Fundamentos | Diseño de estadísticas — principios de visualización |
| `u2_research.svg` | 2.2 EDA | Persona investigando datos — exploración |

## UNIDAD 3 — Machine Learning

| Archivo | Subnivel recomendado | Descripción |
|---------|----------------------|-------------|
| `u3_ai.svg` | 3.1 KNN / Naive Bayes | Robot/IA con datos — concepto general ML |
| `u3_predictive.svg` | 3.1 KNN | Análisis predictivo — clasificación |
| `u3_cohort.svg` | 3.1 / 3.3 | Análisis de cohortes — agrupación/evaluación |
| `u3_programming.svg` | 3.2 Regresión Logística | Persona programando — implementación de modelos |
| `u3_code_review.svg` | 3.3 LDA / Evaluación | Revisión de código — validación de modelos |
| `u3_data_reports.svg` | 3.3 Evaluación | Reportes de datos — métricas de evaluación |
| `u3_solution.svg` | 3.2 / 3.3 | Bombilla de solución — encontrar el modelo correcto |

## UNIDAD 4 — Interpretación de Modelos

| Archivo | Subnivel recomendado | Descripción |
|---------|----------------------|-------------|
| `u4_data_extraction.svg` | 4.1 Importancia de variables | Extracción de features — SHAP / RFE |
| `u4_analyze.svg` | 4.1 / 4.2 | Persona analizando — interpretación |
| `u4_detailed_analysis.svg` | 4.1 SHAP | Análisis detallado — maldición de dimensionalidad |
| `u4_presentation.svg` | 4.2 Comunicación de resultados | Presentación en pantalla — R Markdown / Shiny |
| `u4_data_report.svg` | 4.2 Reportes ejecutivos | Informe de datos — comunicación a stakeholders |
| `u4_knowledge.svg` | 4.2 / 4.3 | Cerebro con conocimiento — interpretabilidad |
| `u4_sharing.svg` | 4.2 Shiny | Compartir artículos — publicar resultados |
| `u4_security.svg` | 4.3 Ética / Privacidad | Seguridad — privacidad diferencial |

## General (sin unidad específica)

| Archivo | Uso sugerido |
|---------|-------------|
| `gen_education.svg` | Pantalla de bienvenida / home |
| `gen_business_analytics.svg` | Sección "aplicación real" en cualquier unidad |
| `gen_all_data.svg` | Banner general del curso |

---

## Cómo integrar en el HTML (ejemplos)

### En una tarjeta de subnivel (dashboard.html):
```html
<div class="resource-card">
  <img src="assets/pedagogical/u1_data.svg"
       alt="Big Data" class="card-illustration" loading="lazy">
  <h3>1.1 Qué es Big Data</h3>
  <p>Definición, 5V, ecosistema</p>
</div>
```

### Como hero de unidad:
```html
<div class="unit-hero">
  <img src="assets/pedagogical/u3_ai.svg"
       alt="Machine Learning"
       style="width:240px; opacity:0.9; float:right; margin:-1rem 0 1rem 2rem">
  <h2>Unidad 3 — Machine Learning</h2>
  <p>KNN, Naive Bayes, Regresión Logística, LDA, Evaluación de modelos</p>
</div>
```

### Como ilustración dentro de microlectura / procedimiento:
```html
<figure class="edu-figure">
  <img src="assets/pedagogical/u2_data_points.svg"
       alt="Correlación y scatter plot"
       style="max-width:320px; border-radius:12px; display:block; margin:1.5rem auto">
  <figcaption>Diagrama de dispersión para visualizar correlación entre variables</figcaption>
</figure>
```

### CSS sugerido para .card-illustration:
```css
.card-illustration {
  width: 100%;
  max-height: 160px;
  object-fit: contain;
  padding: 1rem;
  background: var(--bg-hover);
  border-radius: var(--radius-md);
  margin-bottom: 1rem;
}
```

---

## Mapa rápido: subnivel → archivo principal

| Subnivel | Imagen principal | Imagen secundaria |
|----------|-----------------|-------------------|
| 1.1 Qué es Big Data | `u1_data.svg` | `u1_circuit_board.svg` |
| 1.2 Entorno R/RStudio | `u1_developer.svg` | `u1_cloud_hosting.svg` |
| 1.3 Operaciones básicas | `u1_data_input.svg` | `u1_data_processing.svg` |
| 2.1 Fundamentos visualización | `u2_charts.svg` | `u2_analytics.svg` |
| 2.2 Estadísticos y limpieza | `u2_data_trends.svg` | `u2_statistics.svg` |
| 2.3 Correlación y agrupación | `u2_data_points.svg` | `u2_research.svg` |
| 3.1 KNN y Naive Bayes | `u3_ai.svg` | `u3_predictive.svg` |
| 3.2 Regresión Logística | `u3_programming.svg` | `u3_solution.svg` |
| 3.3 LDA y Evaluación | `u3_code_review.svg` | `u3_data_reports.svg` |
| 4.1 Importancia de variables | `u4_data_extraction.svg` | `u4_analyze.svg` |
| 4.2 Comunicación de resultados | `u4_presentation.svg` | `u4_data_report.svg` |
| 4.3 Ética en IA | `u4_security.svg` | `u4_knowledge.svg` |
