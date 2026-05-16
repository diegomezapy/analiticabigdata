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
https://script.google.com/macros/s/AKfycbzZiGgj3FgE0Wv6pSQmT3ZSW-lz68wbp2RfH8lx7cSGChNLorUnv1HgL_GfJxwAG0aE/exec
```

Si Google solicita autorización en el primer uso, abrir esa URL con la cuenta `dmeza.py@gmail.com` y aceptar los permisos del script antes de distribuir el enlace a estudiantes. La app conserva una copia local de los envíos en `localStorage` (`abd_sync_history`) y reintenta los pendientes cuando la URL está configurada.

## Pestañas del libro

El libro fue preparado con estas pestañas:

| Hoja | Contenido |
|------|-----------|
| `Calificaciones` | Quizzes y actividades calificables |
| `Eventos` | Login, recursos abiertos, badges y navegación relevante |
| `Progreso` | Snapshot de XP, quizzes, badges y materiales vistos |
| `Config` | Parámetros del curso, libro y despliegue |

## Datos enviados

La plataforma registra:

- Quiz por unidad: puntaje, correctas, total, porcentaje, XP, duración y detalle.
- Actividad de emparejamiento: puntaje, correctas, total y XP.
- Recursos abiertos: guía, orientaciones, materiales y descripciones HTML.
- Login, badges y snapshots de progreso.

## Actualizar el Apps Script

Desde la raíz del repo:

```powershell
clasp push --force
clasp deploy -d "Actualizacion Analitica Big Data"
```

Si se genera una nueva URL `/exec`, reemplazar `COURSE_CONFIG.sheetsWebAppUrl` en `dashboard.html`.
