const fs = require('fs');
const path = require('path');

const SOURCE_ROOT = 'C:\\Users\\Diego\\ABD_Recursos';
const DEST_ROOT = path.resolve(__dirname, '..', 'recursos', 'notebooklm');

const SUBLEVELS = [
  {
    unit: 1,
    sublevel: 1,
    code: '1.1',
    slug: 'u1_s1_que_es_bigdata',
    title: 'Que es Big Data',
    topic: 'definicion de Big Data, las 5V, datos estructurados y no estructurados, ecosistema Hadoop Spark'
  },
  {
    unit: 1,
    sublevel: 2,
    code: '1.2',
    slug: 'u1_s2_entorno_trabajo',
    title: 'Entorno R y RStudio',
    topic: 'instalacion de R y RStudio, tipos de datos en R, paquetes, primeros pasos en Python y Jupyter'
  },
  {
    unit: 1,
    sublevel: 3,
    code: '1.3',
    slug: 'u1_s3_operaciones_basicas',
    title: 'Operaciones basicas y graficos',
    topic: 'data.table, lectura CSV y Parquet, graficos basicos con ggplot2, pandas y polars'
  },
  {
    unit: 2,
    sublevel: 1,
    code: '2.1',
    slug: 'u2_s1_fundamentos_visualizacion',
    title: 'Fundamentos de Visualizacion',
    topic: 'gramatica de graficos, variables visuales, jerarquia perceptual, tipos de graficos'
  },
  {
    unit: 2,
    sublevel: 2,
    code: '2.2',
    slug: 'u2_s2_estadisticos_descriptivos',
    title: 'Estadisticos Descriptivos y Limpieza',
    topic: 'media, mediana, varianza, outliers, valores faltantes, imputacion y normalizacion'
  },
  {
    unit: 2,
    sublevel: 3,
    code: '2.3',
    slug: 'u2_s3_correlacion_agrupacion',
    title: 'Correlacion y Agrupacion',
    topic: 'correlacion Pearson y Spearman, matrices de correlacion, groupby, chi-cuadrado'
  },
  {
    unit: 3,
    sublevel: 1,
    code: '3.1',
    slug: 'u3_s1_knn_naive_bayes',
    title: 'KNN y Naive Bayes',
    topic: 'KNN, distancia euclidiana, eleccion de K, normalizacion, Naive Bayes y matriz de confusion'
  },
  {
    unit: 3,
    sublevel: 2,
    code: '3.2',
    slug: 'u3_s2_regresion_logistica',
    title: 'Regresion Logistica',
    topic: 'sigmoide, log-odds, odds ratios, regularizacion, curva ROC y AUC'
  },
  {
    unit: 3,
    sublevel: 3,
    code: '3.3',
    slug: 'u3_s3_lda_evaluacion',
    title: 'LDA y Evaluacion de Modelos',
    topic: 'LDA, QDA, validacion cruzada, data leakage, comparacion de modelos'
  },
  {
    unit: 4,
    sublevel: 1,
    code: '4.1',
    slug: 'u4_s1_importancia_variables',
    title: 'Importancia de Variables',
    topic: 'coeficientes, permutation importance, SHAP, RFE, multicolinealidad y VIF'
  },
  {
    unit: 4,
    sublevel: 2,
    code: '4.2',
    slug: 'u4_s2_comunicacion_resultados',
    title: 'Comunicacion y Reportes',
    topic: 'reportes, lenguaje de negocio, R Markdown, Quarto, tablas y dashboards'
  },
  {
    unit: 4,
    sublevel: 3,
    code: '4.3',
    slug: 'u4_s3_etica_ia_bigdata',
    title: 'Etica en IA y Big Data',
    topic: 'sesgo algoritmico, fairness, privacidad diferencial y responsabilidad profesional'
  }
];

const UNIT_FOLDERS = [
  { unit: 1, slug: 'u1_revolucion_bigdata', source: 'U1_RevolucionBigData', title: 'Revolucion del Big Data' },
  { unit: 2, slug: 'u2_visualizacion_eda', source: 'U2_VisualizacionEDA', title: 'Visualizacion y EDA' },
  { unit: 3, slug: 'u3_machine_learning', source: 'U3_MachineLearning', title: 'Machine Learning' },
  { unit: 4, slug: 'u4_interpretacion_modelos', source: 'U4_InterpretacionModelos', title: 'Interpretacion de Modelos' }
];

const SUBLEVEL_FILES = {
  resumen: 'resumen.html',
  microlectura: 'microlectura.html',
  funciones: 'funciones_r_python.html',
  procedimiento: 'procedimiento.html',
  practica: 'practica_guiada.html',
  aplicacion: 'aplicacion.html',
  evaluacion: 'evaluacion.json',
  quiz: 'quiz.json',
  flashcards: 'flashcards.json',
  mapaMental: 'mapa_mental_nlm.json',
  mapaMentalBase: 'mapa_mental.json',
  storyboard: 'storyboard_video.md',
  audioMicroclaseUrl: 'audio_microclase_url.txt',
  audioRepasoUrl: 'audio_repaso_url.txt',
  videoOverviewUrl: 'video_overview_url.txt'
};

const UNIT_LIGHT_EXTENSIONS = new Set(['.json']);
const UNIT_MEDIA_EXTENSIONS = new Set(['.wav', '.mp4', '.pptx']);

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyFile(source, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(source, dest);
}

function exists(file) {
  return fs.existsSync(file) && fs.statSync(file).isFile();
}

function relFor(...parts) {
  return parts.join('/').replace(/\\/g, '/');
}

function countQuestions(filePath) {
  if (!exists(filePath)) return 0;
  try {
    const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (Array.isArray(json.preguntas)) return json.preguntas.length;
    if (Array.isArray(json.questions)) return json.questions.length;
    if (Array.isArray(json.quiz)) return json.quiz.length;
  } catch (error) {
    return 0;
  }
  return 0;
}

function countCards(filePath) {
  if (!exists(filePath)) return 0;
  try {
    const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (Array.isArray(json.cards)) return json.cards.length;
    if (Array.isArray(json.flashcards)) return json.flashcards.length;
    if (Array.isArray(json)) return json.length;
  } catch (error) {
    return 0;
  }
  return 0;
}

function importSublevels(index) {
  let copied = 0;
  const destBase = path.join(DEST_ROOT, 'subniveles');
  for (const item of SUBLEVELS) {
    const sourceDir = path.join(SOURCE_ROOT, 'subniveles', item.slug);
    const destDir = path.join(destBase, item.slug);
    const archivos = {};
    const missing = [];

    for (const [key, filename] of Object.entries(SUBLEVEL_FILES)) {
      const source = path.join(sourceDir, filename);
      if (!exists(source)) {
        if (!['quiz', 'mapaMentalBase'].includes(key)) missing.push(filename);
        continue;
      }
      copyFile(source, path.join(destDir, filename));
      copied += 1;
      archivos[key] = relFor('recursos', 'notebooklm', 'subniveles', item.slug, filename);
    }

    index.subniveles.push({
      ...item,
      archivos,
      estado: {
        completoEscrito: ['resumen', 'microlectura', 'funciones', 'procedimiento', 'practica', 'aplicacion', 'evaluacion']
          .every(key => Boolean(archivos[key])),
        quizNotebookLm: Boolean(archivos.quiz),
        preguntasEvaluacion: countQuestions(path.join(destDir, 'evaluacion.json')),
        preguntasQuiz: countQuestions(path.join(destDir, 'quiz.json')),
        flashcards: countCards(path.join(destDir, 'flashcards.json')),
        faltantes: missing
      }
    });
  }
  return copied;
}

function importUnits(index) {
  let copied = 0;
  const destBase = path.join(DEST_ROOT, 'unidades');
  for (const unit of UNIT_FOLDERS) {
    const sourceDir = path.join(SOURCE_ROOT, unit.source);
    const destDir = path.join(destBase, unit.slug);
    const archivos = {};
    const mediaPendiente = [];

    if (fs.existsSync(sourceDir)) {
      for (const dirent of fs.readdirSync(sourceDir, { withFileTypes: true })) {
        if (!dirent.isFile()) continue;
        const ext = path.extname(dirent.name).toLowerCase();
        const source = path.join(sourceDir, dirent.name);
        if (UNIT_LIGHT_EXTENSIONS.has(ext)) {
          copyFile(source, path.join(destDir, dirent.name));
          copied += 1;
          const key = path.basename(dirent.name, ext);
          archivos[key] = relFor('recursos', 'notebooklm', 'unidades', unit.slug, dirent.name);
        } else if (UNIT_MEDIA_EXTENSIONS.has(ext)) {
          mediaPendiente.push({
            archivo: dirent.name,
            tipo: ext.slice(1),
            bytes: fs.statSync(source).size,
            recomendado: ext === '.wav' ? 'convertir a mp3/ogg antes de publicar' : 'publicar en carga diferida'
          });
        }
      }
    }

    index.unidades.push({
      unit: unit.unit,
      slug: unit.slug,
      source: unit.source,
      title: unit.title,
      archivos,
      mediaPendiente
    });
  }
  return copied;
}

function main() {
  if (!fs.existsSync(SOURCE_ROOT)) {
    throw new Error(`No existe la carpeta fuente: ${SOURCE_ROOT}`);
  }
  ensureDir(DEST_ROOT);
  const index = {
    generatedAt: new Date().toISOString(),
    sourceRoot: SOURCE_ROOT,
    basePath: 'recursos/notebooklm',
    version: 1,
    subniveles: [],
    unidades: []
  };
  const sublevelFiles = importSublevels(index);
  const unitFiles = importUnits(index);
  const indexPath = path.join(DEST_ROOT, 'indice.json');
  fs.writeFileSync(indexPath, `${JSON.stringify(index, null, 2)}\n`, 'utf8');
  console.log(`Recursos NotebookLM importados: ${sublevelFiles + unitFiles} archivos livianos`);
  console.log(`Subniveles indexados: ${index.subniveles.length}`);
  console.log(`Indice: ${path.relative(path.resolve(__dirname, '..'), indexPath)}`);
}

main();
