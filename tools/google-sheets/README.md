# Registro de autorizaciones en Google Sheets

Hazlo con la cuenta de Google de EXORA, no con una cuenta personal.

1. Crea una hoja de cálculo nueva llamada **EXORA · Autorizaciones de datos**.
2. Ve a **Extensiones → Apps Script**, borra lo que haya y pega el contenido de `autorizaciones.gs`. Guarda.
3. Toca **Implementar → Nueva implementación → Aplicación web**:
   - Ejecutar como: **Yo**.
   - Quién tiene acceso: **Cualquier persona** (es necesario para que el sitio pueda enviar; el script solo agrega filas, no devuelve datos).
4. Autoriza los permisos y copia la **URL de la aplicación web** (termina en `/exec`).
5. En `src/content.ts`:
   - `CONSENT_SHEET_URL` = la URL del paso 4.
   - `CONSENT_SHEET_VIEW` = el enlace normal de la hoja (para el botón del panel).
6. Comparte la hoja **solo** con Vero y Susana (editor). Nunca "cualquier persona con el enlace".
7. Activa la verificación en dos pasos en esa cuenta de Google.
