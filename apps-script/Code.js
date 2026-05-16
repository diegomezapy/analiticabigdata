const SPREADSHEET_ID = '1eU6Fh073qLIOQaPonRim5d0e6IuGE0Bq8hDZHmlHKzI';

const HEADERS = {
  Calificaciones: [
    'timestamp', 'usuario', 'nombre', 'unidad', 'actividad', 'tipo', 'puntaje',
    'correctas', 'total', 'porcentaje', 'xp', 'intento', 'duracion_seg',
    'detalle', 'origen_url', 'user_agent', 'session_id'
  ],
  Eventos: [
    'timestamp', 'usuario', 'nombre', 'evento', 'unidad', 'recurso', 'detalle',
    'xp', 'progreso_json', 'origen_url', 'user_agent', 'session_id'
  ],
  Progreso: [
    'timestamp', 'usuario', 'nombre', 'xp_total', 'quizzes_completados',
    'promedio_quiz', 'badges', 'materiales_vistos', 'progreso_json',
    'session_id'
  ]
};

function doGet() {
  return jsonResponse({
    status: 'ok',
    course: 'Analítica de Big Data',
    spreadsheet_id: SPREADSHEET_ID
  });
}

function doPost(e) {
  try {
    const payload = parsePayload_(e);
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    ensureWorkbook_(ss);

    const kind = String(payload.kind || payload.tipo_registro || 'calificacion').toLowerCase();
    if (kind === 'batch' && Array.isArray(payload.items)) {
      payload.items.forEach(item => appendPayload_(ss, item));
    } else {
      appendPayload_(ss, payload);
    }

    return jsonResponse({ status: 'ok', saved_at: new Date().toISOString() });
  } catch (err) {
    return jsonResponse({ status: 'error', message: String(err && err.message ? err.message : err) });
  }
}

function appendPayload_(ss, payload) {
  const kind = String(payload.kind || payload.tipo_registro || 'calificacion').toLowerCase();
  if (kind === 'evento') {
    appendByHeaders_(ss.getSheetByName('Eventos'), HEADERS.Eventos, {
      timestamp: payload.timestamp || now_(),
      usuario: payload.usuario || '',
      nombre: payload.nombre || '',
      evento: payload.evento || payload.actividad || '',
      unidad: payload.unidad || '',
      recurso: payload.recurso || '',
      detalle: stringify_(payload.detalle || payload),
      xp: payload.xp || '',
      progreso_json: stringify_(payload.progreso || payload.progreso_json || ''),
      origen_url: payload.origen_url || '',
      user_agent: payload.user_agent || '',
      session_id: payload.session_id || ''
    });
    return;
  }

  if (kind === 'progreso') {
    appendByHeaders_(ss.getSheetByName('Progreso'), HEADERS.Progreso, {
      timestamp: payload.timestamp || now_(),
      usuario: payload.usuario || '',
      nombre: payload.nombre || '',
      xp_total: payload.xp_total || payload.xp || 0,
      quizzes_completados: payload.quizzes_completados || '',
      promedio_quiz: payload.promedio_quiz || '',
      badges: stringify_(payload.badges || ''),
      materiales_vistos: payload.materiales_vistos || '',
      progreso_json: stringify_(payload.progreso || payload.progreso_json || ''),
      session_id: payload.session_id || ''
    });
    return;
  }

  appendByHeaders_(ss.getSheetByName('Calificaciones'), HEADERS.Calificaciones, {
    timestamp: payload.timestamp || payload.fecha_iso || now_(),
    usuario: payload.usuario || '',
    nombre: payload.nombre || '',
    unidad: payload.unidad || '',
    actividad: payload.actividad || '',
    tipo: payload.tipo || payload.kind || 'calificacion',
    puntaje: payload.puntaje || 0,
    correctas: payload.correctas || 0,
    total: payload.total || 0,
    porcentaje: payload.porcentaje || payload.puntaje || 0,
    xp: payload.xp || 0,
    intento: payload.intento || '',
    duracion_seg: payload.duracion_seg || payload.tiempo_usado || '',
    detalle: stringify_(payload.detalle || payload),
    origen_url: payload.origen_url || '',
    user_agent: payload.user_agent || '',
    session_id: payload.session_id || ''
  });
}

function ensureWorkbook_(ss) {
  Object.keys(HEADERS).forEach(name => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
    }
    const headers = HEADERS[name];
    const existing = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
    const needsHeader = headers.some((header, index) => existing[index] !== header);
    if (needsHeader) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight('bold')
      .setFontColor('#ffffff')
      .setBackground(name === 'Calificaciones' ? '#17364f' : name === 'Eventos' ? '#0f766e' : '#6d28d9');
  });
}

function appendByHeaders_(sheet, headers, rowObject) {
  const row = headers.map(header => rowObject[header] !== undefined ? rowObject[header] : '');
  sheet.appendRow(row);
}

function parsePayload_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    return {};
  }
  return JSON.parse(e.postData.contents);
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function stringify_(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  return JSON.stringify(value);
}

function now_() {
  return Utilities.formatDate(new Date(), 'America/Asuncion', "yyyy-MM-dd'T'HH:mm:ssXXX");
}
