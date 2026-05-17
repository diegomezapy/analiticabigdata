const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..');
const INDEX_PATH = path.join(REPO_ROOT, 'recursos', 'notebooklm', 'indice.json');
const CHROME_CANDIDATES = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
];

const HTML_KEYS = [
  'resumen',
  'microlectura',
  'funciones',
  'procedimiento',
  'practica',
  'aplicacion'
];

function findBrowser() {
  return CHROME_CANDIDATES.find(candidate => fs.existsSync(candidate));
}

function fileUrl(filePath) {
  return `file:///${filePath.replace(/\\/g, '/')}`;
}

function exportPdf(browser, htmlPath, pdfPath) {
  fs.mkdirSync(path.dirname(pdfPath), { recursive: true });
  const htmlStat = fs.statSync(htmlPath);
  if (fs.existsSync(pdfPath) && fs.statSync(pdfPath).mtimeMs >= htmlStat.mtimeMs) {
    return { status: 'skip' };
  }
  const result = spawnSync(browser, [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--disable-extensions',
    '--run-all-compositor-stages-before-draw',
    '--print-to-pdf-no-header',
    `--print-to-pdf=${pdfPath}`,
    fileUrl(htmlPath)
  ], { encoding: 'utf8', timeout: 60000 });

  if (result.status !== 0 || !fs.existsSync(pdfPath)) {
    return {
      status: 'error',
      message: (result.stderr || result.stdout || `exit ${result.status}`).slice(0, 300)
    };
  }
  return { status: 'created', bytes: fs.statSync(pdfPath).size };
}

function main() {
  if (!fs.existsSync(INDEX_PATH)) {
    throw new Error(`No existe ${INDEX_PATH}. Ejecuta primero import_notebooklm_resources.js`);
  }
  const browser = findBrowser();
  if (!browser) {
    throw new Error('No se encontro Chrome ni Edge para imprimir PDFs.');
  }
  const index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf8'));
  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const sublevel of index.subniveles || []) {
    for (const key of HTML_KEYS) {
      const relHtml = sublevel.archivos?.[key];
      if (!relHtml) continue;
      const htmlPath = path.join(REPO_ROOT, relHtml);
      if (!fs.existsSync(htmlPath)) continue;
      const pdfPath = htmlPath.replace(/\.html$/i, '.pdf');
      const result = exportPdf(browser, htmlPath, pdfPath);
      if (result.status === 'created') {
        created += 1;
        console.log(`+ ${path.relative(REPO_ROOT, pdfPath)} (${Math.round(result.bytes / 1024)} KB)`);
      } else if (result.status === 'skip') {
        skipped += 1;
      } else {
        errors += 1;
        console.warn(`! ${path.relative(REPO_ROOT, htmlPath)}: ${result.message}`);
      }
    }
  }
  console.log(`PDFs creados: ${created}; omitidos: ${skipped}; errores: ${errors}`);
  if (errors) process.exitCode = 1;
}

main();
