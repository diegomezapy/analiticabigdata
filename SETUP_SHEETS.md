# Google Sheets — Analítica de Big Data

Libro destino:

https://docs.google.com/spreadsheets/d/1eU6Fh073qLIOQaPonRim5d0e6IuGE0Bq8hDZHmlHKzI/edit

ID del libro:

```text
1eU6Fh073qLIOQaPonRim5d0e6IuGE0Bq8hDZHmlHKzI
```

## Web App

El proyecto incluye el Apps Script en `apps-script/`.

Script creado:

```text
https://script.google.com/d/1cZXfAId4sBXwIsPUaWgbPviQ13yUQTodyW8plm8I5y32a0llEJ5C_hFa/edit
```

URL de recepción configurada en `dashboard.html`:

```text
https://script.google.com/macros/s/AKfycbwb5nz0SvccSfbz8QbfT299YsG10nyLRzfs5d0vcL-LmdTCZvy3H-o2-zGfhZvUr8B3/exec
```

Si Google solicita autorización en el primer uso, abrir esa URL con la cuenta `dmeza.py@gmail.com` y aceptar los permisos del script antes de distribuir el enlace a estudiantes. La app conserva una copia local de los envíos en `localStorage` (`abd_sync_history`) y reintenta los pendientes cuando la URL está configurada.

## Pestañas del libro

El libro fue preparado con estas pestañas:

| Hoja | Contenido |
|------|-----------|
| `Calificaciones` | Quizzes y actividades calificables |
| `Eventos` | Login, recursos abiertos, badges y navegación relevante |
| `Progreso` | Snapshot de XP, quizzes, badges y materiales vistos |
| `Estudiantes` | Altas/bajas registradas desde Administración |
| `Config` | Parámetros del curso, calendario y despliegue |
| `Interacciones` | Foro, consultas vinculadas a recursos y anuncios docentes |

## Datos enviados

La plataforma registra:

- Quiz por unidad: puntaje, correctas, total, porcentaje, XP, duración y detalle.
- Actividad de emparejamiento: puntaje, correctas, total y XP.
- Prácticas guiadas: avance por fichas, dataset usado y laboratorio completado.
- Recursos abiertos: guía, orientaciones, materiales y descripciones HTML.
- Login, badges, cambios de contraseña, recordatorios y snapshots de progreso.
- Estudiantes registrados/removidos y configuración de fechas por semestre.
- Autenticación de estudiantes autorizados por el profesor: si una cédula no existe en `Estudiantes` o fue removida, el login no permite automatrícula.
- Mensajes de comunidad: aportes de foro, consultas al profesor marcadas por unidad/recurso/práctica y anuncios docentes.

## Recordatorios por correo

La PWA muestra recordatorios locales en el dispositivo del estudiante. Para correos automáticos desde Google Sheets:

1. Abrir el proyecto Apps Script.
2. Ejecutar una vez `installDailyReminderTrigger`.
3. Autorizar permisos de Sheets, correo y disparadores.

El disparador diario ejecuta `sendReminderEmails`, revisa la última configuración `semester_config` de la hoja `Config` y envía avisos a estudiantes activos con correo en `Estudiantes`.

## Actualizar el Apps Script

Desde la raíz del repo:

```powershell
clasp push --force
clasp deploy -d "Actualizacion Analitica Big Data"
```

Si se genera una nueva URL `/exec`, reemplazar `COURSE_CONFIG.sheetsWebAppUrl` en `dashboard.html`.
