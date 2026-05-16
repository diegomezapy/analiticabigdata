# 🔧 Configuración de Google Sheets

Esta guía te llevará paso a paso a conectar la plataforma con tu Google Sheets para que los resultados de los estudiantes se guarden automáticamente.

**Planilla objetivo**: https://docs.google.com/spreadsheets/d/1-6Q0EdjhEdw2ZHelpYY6jMFx9lqTTClaH1wBawbbdH8/edit

---

## Paso 1: Abrir la Planilla

Abre la planilla de Google Sheets en el enlace de arriba.

## Paso 2: Crear el Apps Script

1. En la planilla, ve a **Extensiones → Apps Script**
2. Elimina el código existente y pega el siguiente:

```javascript
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Elegir hoja según unidad
    var sheetName = 'Unidad' + data.unidad;
    var sheet = ss.getSheetByName(sheetName);
    
    // Si no existe la hoja, crearla
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(['Usuario', 'Nombre', 'Unidad', 'Actividad', 'Puntaje (%)', 
                       'Correctas', 'Total Preguntas', 'Fecha', 'Tiempo Restante (s)', 'XP Ganado']);
      sheet.getRange(1,1,1,10).setBackground('#2c3e50').setFontColor('#ffffff').setFontWeight('bold');
    }
    
    // Agregar el registro
    sheet.appendRow([
      data.usuario || '',
      data.nombre || '',
      data.unidad || '',
      data.actividad || '',
      data.puntaje || 0,
      data.correctas || 0,
      data.total || 0,
      data.fecha || new Date().toLocaleString(),
      data.tiempo_restante || 0,
      data.xp || 0
    ]);
    
    // También guardar en hoja "Todos"
    var allSheet = ss.getSheetByName('Todos');
    if (!allSheet) {
      allSheet = ss.insertSheet('Todos');
      allSheet.appendRow(['Usuario', 'Nombre', 'Unidad', 'Actividad', 'Puntaje (%)', 
                          'Correctas', 'Total', 'Fecha', 'XP']);
      allSheet.getRange(1,1,1,9).setBackground('#4a235a').setFontColor('#ffffff').setFontWeight('bold');
    }
    allSheet.appendRow([data.usuario, data.nombre, data.unidad, data.actividad, 
                        data.puntaje, data.correctas, data.total, data.fecha, data.xp]);
    
    return ContentService.createTextOutput(JSON.stringify({status:'ok'}))
                         .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({status:'error', msg:err.toString()}))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput('API de Anal\u00edtica de Big Data FACEN OK')
                       .setMimeType(ContentService.MimeType.TEXT);
}
```

## Paso 3: Publicar el Script como Web App

1. Haz click en **Implementar → Nueva implementación**
2. Selecciona tipo: **Aplicación web**
3. Configura:
   - **Ejecutar como**: Yo (tu cuenta)
   - **Quién tiene acceso**: Cualquier persona
4. Click en **Implementar**
5. **Autoriza** el acceso cuando te lo pida
6. **Copia la URL** que aparece (empieza con `https://script.google.com/macros/s/...`)

## Paso 4: Agregar la URL al dashboard

Abre el archivo `dashboard.html` y busca esta línea:

```javascript
const SHEETS_URL = 'TU_APPS_SCRIPT_URL_AQUI';
```

Reemplaza `TU_APPS_SCRIPT_URL_AQUI` con la URL que copiaste. Por ejemplo:

```javascript
const SHEETS_URL = 'https://script.google.com/macros/s/AKfycby.../exec';
```

## Paso 5: ¡Listo!

A partir de ahora, cada vez que un estudiante complete un quiz, el resultado se guardará automáticamente en la planilla de Google Sheets, en la hoja correspondiente a cada unidad.

---

## Estructura de la Planilla

| Hoja | Contenido |
|------|-----------|
| `Unidad1` | Resultados del quiz de Unidad 1 |
| `Unidad2` | Resultados del quiz de Unidad 2 |
| `Unidad3` | Resultados del quiz de Unidad 3 |
| `Unidad4` | Resultados del quiz de Unidad 4 |
| `Todos` | Todos los resultados en una sola hoja |

---

## Agregar Más Usuarios

Edita el archivo `data/usuarios.json`. Para hashear contraseñas:
- Ve a https://emn178.github.io/online-tools/sha256.html
- Ingresa la contraseña en el campo de texto
- El hash generado es el valor de `password_hash`

Ejemplo para agregar el usuario `maria` con contraseña `estatistica2026`:
```json
{
  "username": "maria",
  "password_hash": "HASH_AQUI",
  "nombre": "María García",
  "rol": "estudiante"
}
```
