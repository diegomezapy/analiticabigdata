const CACHE_NAME = 'analitica-bigdata-v39';

const APP_SHELL = [
  './',
  'index.html',
  'dashboard.html',
  'documentos.html',
  'manifest.json',
  'css/styles.css',
  'css/documentos.css',
  'data/usuarios.json',
  'data/quizzes/quiz_u1.json',
  'data/quizzes/quiz_u2.json',
  'data/quizzes/quiz_u3.json',
  'data/quizzes/quiz_u4.json',
  'data/datasets/clientes_compras.csv',
  'data/datasets/estudiantes_ead.csv',
  'data/datasets/modelos_credito.csv',
  'recursos/notebooklm/indice.json',
  'recursos/notebooklm/contenido_fichas.json',
  'guia_didactica/index.html',
  'practicas/index.html',
  'laboratorio/index.html',
  'icons/icon.svg',
  'icons/logo-abd.svg',
  'icons/unit-1.svg',
  'icons/unit-2.svg',
  'icons/unit-3.svg',
  'icons/unit-4.svg',
  'assets/academic/facen-header.png',
  'assets/academic/facen-footer.png',
  'assets/pedagogical/gen_all_data.svg',
  'assets/pedagogical/gen_business_analytics.svg',
  'assets/pedagogical/gen_education.svg',
  'assets/pedagogical/edu_u1s1_5v_bigdata.svg',
  'assets/pedagogical/edu_u1s1d_escala_datos.svg',
  'assets/pedagogical/edu_u1s2_rstudio.svg',
  'assets/pedagogical/edu_u1s3_pipeline.svg',
  'assets/pedagogical/edu_u2s1_grammar_graficos.svg',
  'assets/pedagogical/edu_u2s2_boxplot.svg',
  'assets/pedagogical/edu_u2s2d_distribuciones.svg',
  'assets/pedagogical/edu_u2s3_correlacion.svg',
  'assets/pedagogical/edu_u3s1_knn.svg',
  'assets/pedagogical/edu_u3s2_sigmoide.svg',
  'assets/pedagogical/edu_u3s3_roc_confusion.svg',
  'assets/pedagogical/edu_u4s1_shap.svg',
  'assets/pedagogical/edu_u4s2_rmarkdown.svg',
  'assets/pedagogical/edu_u4s3_sesgo_algoritmico.svg',
  'assets/pedagogical/u1_circuit_board.svg',
  'assets/pedagogical/u1_cloud_hosting.svg',
  'assets/pedagogical/u1_data.svg',
  'assets/pedagogical/u1_data_input.svg',
  'assets/pedagogical/u1_data_processing.svg',
  'assets/pedagogical/u1_developer.svg',
  'assets/pedagogical/u1_online_learning.svg',
  'assets/pedagogical/u1_server.svg',
  'assets/pedagogical/u2_analytics.svg',
  'assets/pedagogical/u2_charts.svg',
  'assets/pedagogical/u2_dashboard.svg',
  'assets/pedagogical/u2_data_points.svg',
  'assets/pedagogical/u2_data_trends.svg',
  'assets/pedagogical/u2_design_stats.svg',
  'assets/pedagogical/u2_research.svg',
  'assets/pedagogical/u2_statistics.svg',
  'assets/pedagogical/u3_ai.svg',
  'assets/pedagogical/u3_code_review.svg',
  'assets/pedagogical/u3_cohort.svg',
  'assets/pedagogical/u3_data_reports.svg',
  'assets/pedagogical/u3_predictive.svg',
  'assets/pedagogical/u3_programming.svg',
  'assets/pedagogical/u3_solution.svg',
  'assets/pedagogical/u4_analyze.svg',
  'assets/pedagogical/u4_data_extraction.svg',
  'assets/pedagogical/u4_data_report.svg',
  'assets/pedagogical/u4_detailed_analysis.svg',
  'assets/pedagogical/u4_knowledge.svg',
  'assets/pedagogical/u4_presentation.svg',
  'assets/pedagogical/u4_security.svg',
  'assets/pedagogical/u4_sharing.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isHeavyAsset = /\.(wav|mp3|mp4|pptx|pdf)$/i.test(url.pathname);
  if (!isSameOrigin || isHeavyAsset) {
    event.respondWith(fetch(event.request).catch(() => caches.match('index.html')));
    return;
  }
  event.respondWith(
    caches.match(event.request).then(cached =>
      cached || fetch(event.request).then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      }).catch(() => caches.match('index.html'))
    )
  );
});
