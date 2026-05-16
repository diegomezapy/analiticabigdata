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
  ],
  Estudiantes: [
    'timestamp', 'usuario', 'nombre', 'email', 'estado', 'password_hash',
    'password_changed', 'detalle'
  ],
  Config: [
    'timestamp', 'usuario', 'nombre', 'config_key', 'config_value', 'detalle',
    'session_id'
  ]
};

function doGet(e) {
  const params = e && e.parameter ? e.parameter : {};
  if (params.action === 'auth') {
    const result = authenticateStudent_(params.username || '', params.password_hash || '');
    return jsonResponse(result, params.callback);
  }
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

  if (kind === 'estudiante') {
    appendByHeaders_(ss.getSheetByName('Estudiantes'), HEADERS.Estudiantes, {
      timestamp: payload.timestamp || now_(),
      usuario: payload.usuario || payload.cedula || '',
      nombre: payload.nombre || '',
      email: payload.email || '',
      estado: payload.estado || 'activo',
      password_hash: payload.password_hash || '',
      password_changed: payload.password_changed === true ? 'true' : 'false',
      detalle: stringify_(payload.detalle || payload)
    });
    return;
  }

  if (kind === 'config') {
    appendByHeaders_(ss.getSheetByName('Config'), HEADERS.Config, {
      timestamp: payload.timestamp || now_(),
      usuario: payload.usuario || '',
      nombre: payload.nombre || '',
      config_key: payload.config_key || payload.recurso || '',
      config_value: stringify_(payload.config_value || payload.valor || ''),
      detalle: stringify_(payload.detalle || ''),
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
      .setBackground(sheetColor_(name));
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

function jsonResponse(data, callback) {
  const json = JSON.stringify(data);
  const output = callback ? `${callback}(${json});` : json;
  return ContentService
    .createTextOutput(output)
    .setMimeType(callback ? ContentService.MimeType.JAVASCRIPT : ContentService.MimeType.JSON);
}

function stringify_(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  return JSON.stringify(value);
}

function now_() {
  return Utilities.formatDate(new Date(), 'America/Asuncion', "yyyy-MM-dd'T'HH:mm:ssXXX");
}

function authenticateStudent_(username, passwordHash) {
  if (!username || !passwordHash) {
    return { status: 'error', message: 'missing_credentials' };
  }
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  ensureWorkbook_(ss);
  const rows = readObjects_(ss.getSheetByName('Estudiantes'))
    .filter(row => String(row.usuario || '').trim() === String(username).trim());
  if (!rows.length) {
    return { status: 'error', message: 'not_authorized' };
  }
  const latest = rows[rows.length - 1];
  if (String(latest.estado || 'activo').toLowerCase() === 'removido') {
    return { status: 'error', message: 'removed' };
  }
  const storedHash = latest.password_hash || sha256Hex_(String(latest.usuario || ''));
  if (storedHash !== passwordHash) {
    return { status: 'error', message: 'invalid_password' };
  }
  return {
    status: 'ok',
    user: {
      username: String(latest.usuario || ''),
      cedula: String(latest.usuario || ''),
      nombre: String(latest.nombre || latest.usuario || ''),
      email: String(latest.email || ''),
      rol: 'estudiante',
      password_changed: String(latest.password_changed || '').toLowerCase() === 'true'
    }
  };
}

function sha256Hex_(value) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, value);
  return bytes.map(byte => {
    const unsigned = byte < 0 ? byte + 256 : byte;
    return (`0${unsigned.toString(16)}`).slice(-2);
  }).join('');
}

function sheetColor_(name) {
  const colors = {
    Calificaciones: '#17364f',
    Eventos: '#0f766e',
    Progreso: '#6d28d9',
    Estudiantes: '#b45309',
    Config: '#374151'
  };
  return colors[name] || '#374151';
}

function installDailyReminderTrigger() {
  ScriptApp.getProjectTriggers()
    .filter(trigger => trigger.getHandlerFunction() === 'sendReminderEmails')
    .forEach(trigger => ScriptApp.deleteTrigger(trigger));
  ScriptApp.newTrigger('sendReminderEmails')
    .timeBased()
    .everyDays(1)
    .atHour(7)
    .create();
  return jsonResponse({ status: 'ok', trigger: 'sendReminderEmails', hour: 7 });
}

function sendReminderEmails() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  ensureWorkbook_(ss);
  const students = readObjects_(ss.getSheetByName('Estudiantes'))
    .filter(row => String(row.estado || 'activo').toLowerCase() !== 'removido')
    .filter(row => row.email);
  const config = latestSemesterConfig_(ss);
  const events = Array.isArray(config.activities) ? config.activities : [];
  const today = Utilities.formatDate(new Date(), 'America/Asuncion', 'yyyy-MM-dd');
  const dueEvents = events.filter(event => {
    const diff = dayDiff_(today, event.due);
    return diff === 1 || diff < 0;
  });
  if (!students.length || !dueEvents.length) return;

  students.forEach(student => {
    dueEvents.forEach(event => {
      const diff = dayDiff_(today, event.due);
      const subject = diff === 1
        ? `Recordatorio: ${event.title} vence mañana`
        : `Pendiente: ${event.title} está atrasada`;
      const body = [
        `Hola ${student.nombre || student.usuario},`,
        '',
        diff === 1
          ? `Mañana vence: ${event.title}.`
          : `La actividad está pendiente desde ${event.due}: ${event.title}.`,
        event.resource ? `Recurso: ${event.resource}` : '',
        '',
        'Aula: https://diegomezapy.github.io/analiticabigdata/',
        'Este mensaje fue generado automáticamente desde la planilla del curso.'
      ].filter(Boolean).join('\n');
      MailApp.sendEmail(student.email, subject, body);
      appendByHeaders_(ss.getSheetByName('Eventos'), HEADERS.Eventos, {
        timestamp: now_(),
        usuario: student.usuario || '',
        nombre: student.nombre || '',
        evento: 'recordatorio_email',
        unidad: event.unit || '',
        recurso: event.id || '',
        detalle: subject,
        xp: '',
        progreso_json: stringify_(event),
        origen_url: 'Apps Script',
        user_agent: 'MailApp',
        session_id: ''
      });
    });
  });
}

function latestSemesterConfig_(ss) {
  const rows = readObjects_(ss.getSheetByName('Config'))
    .filter(row => row.config_key === 'semester_config');
  if (!rows.length) return {};
  const latest = rows[rows.length - 1];
  try {
    return JSON.parse(latest.config_value || '{}');
  } catch (e) {
    return {};
  }
}

function readObjects_(sheet) {
  if (!sheet || sheet.getLastRow() < 2) return [];
  const values = sheet.getDataRange().getValues();
  const headers = values.shift();
  return values.map(row => {
    const obj = {};
    headers.forEach((header, index) => obj[header] = row[index]);
    return obj;
  });
}

function dayDiff_(fromISO, toISO) {
  const from = new Date(`${fromISO}T00:00:00`);
  const to = new Date(`${toISO}T00:00:00`);
  return Math.round((to - from) / 86400000);
}
