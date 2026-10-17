# Tracking Logístico

Backend Spring Boot para PostgreSQL y frontend React/Vite tomado del prototipo Figma y conectado a la API.

## Ejecutar localmente

1. Configura PostgreSQL y define `DB_URL`, `DB_USERNAME` y `DB_PASSWORD` para la base `tracking_logistico`.
2. Arranca el backend con Java 25 mediante `mvnw.cmd spring-boot:run`.
3. En `trackingLogistico-frontend`, instala dependencias con pnpm y ejecuta `pnpm dev`.
4. Define `VITE_API_URL` si el backend no está en `http://localhost:8080/api`.

El arranque crea un administrador inicial mediante `DataInitializer`; cambia las credenciales de desarrollo antes de usar datos reales.

## Historias cubiertas en esta iteración

- Registro e inicio de sesión conectados a la API; las cuentas públicas reciben rol Cliente.
- Envíos, consulta de estado e historial con control de acceso por rol e identificación del destinatario.
- HU-03: grupos, eventos masivos elegibles, omisión de etapas no válidas y disolución sin borrar el historial.
- HU-08: cancelación con motivo solo en Recibido en origen o En central.
- HU-S-19: cinco intentos fallidos provocan una espera de un minuto; dos adicionales, dos minutos; otros dos, bloqueo hasta desbloqueo administrativo.
- HU-04/HU-05/HU-17: rol vigente determinado en servidor, navegación por rol y gestión de roles de cuenta.
- HU-10/HU-11/HU-12/HU-13/HU-16: consulta protegida, envíos propios por identificación, usuarios asociados y volumen total.

## Pendientes del refinamiento

- HU-S-23 (verificación de correo): requiere proveedor/canal SMTP y ciclo de enlaces; el frontend informa que no envía enlaces.
- HU-S-19: los estados de bloqueo se almacenan; falta un ledger auditable completo de cada penalización y desbloqueo.
- HU-S-20: el servidor deniega consultas no autorizadas, pero todavía falta persistir el registro de cada consulta denegada.
- HU-S-21: el rol actual invalida privilegios en JWTs existentes; falta auditar actor, rol anterior/nuevo y acciones rechazadas.
- HU-S-22: el frontend cierra tras 5 min y hace logout, pero una API stateless sin expiración corta o revocación no puede invalidar en servidor un JWT ya emitido antes de su vencimiento.
- HU-06: la pantalla de edición se marca pendiente porque no hay endpoint de perfil.
- HU-14/HU-15: no se inventan fórmula de tránsito o regla de retraso; el propio PDF las deja por definir.
- Los centros logísticos se deben cargar previamente en la base, pues el catálogo no incluye su alta.

Las dependencias frontend se deben instalar antes de construir. La verificación en este entorno quedó bloqueada por acceso de red denegado a npm; no se declara un build exitoso.
