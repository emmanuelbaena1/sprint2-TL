# Trackline / Tracking Logístico — versión refinada

Este paquete contiene el backend Spring Boot y el frontend React/Vite. Se trabajó a partir de copias del proyecto recibido; las carpetas originales no se modificaron. El frontend se conserva como proyecto completo del prototipo Figma, incluidos sus plugins de desarrollo; `node_modules` no se incluye.

## Requisitos

- Java 25 (según `pom.xml`), PostgreSQL y pnpm/Node compatibles con el proyecto frontend.
- Base `tracking_logistico`. Configura `DB_URL`, `DB_USERNAME` y `DB_PASSWORD` en el backend.
- `VITE_API_URL` es opcional; por defecto apunta a `http://localhost:8080/api`.

## Arranque

1. Inicia PostgreSQL y configura las variables del backend.
2. Desde `backend`, ejecuta `mvnw.cmd spring-boot:run` en Windows (o `./mvnw spring-boot:run` en Unix).
3. Desde `frontend`, ejecuta `pnpm install` y luego `pnpm dev`.
4. El backend permite CORS de desarrollo para `localhost` y `127.0.0.1` en cualquier puerto.

El inicializador crea un usuario administrador de desarrollo: `admin@tracking.com` / `admin1234`, y tres centros logísticos de ejemplo si no existen. Cambia esas credenciales antes de cualquier uso real.

## Historias abordadas en esta iteración

- HU-03: grupos de envíos, membresía activa única, eventos grupales por envío, omisión de etapas no elegibles y disolución conservando historial.
- HU-04/HU-05: rol proveniente de la sesión del servidor y navegación por rol; no se permite elegir rol en el registro público.
- HU-08: cancelación con motivo solo desde Recibido en origen o En central, con evento histórico de cancelación.
- HU-S-19: penalización escalonada 5 intentos / 1 minuto, 2 adicionales / 2 minutos y 2 adicionales / bloqueo hasta desbloqueo administrativo.
- Integración con la API para registro/login, envíos, tracking e historial, roles, consultas de supervisor y bloqueo de cuentas.

## Límites conocidos frente al documento

- HU-S-23: se registra una cuenta de Cliente, pero no está implementada verificación real de correo; falta proveedor SMTP, enlaces de un solo uso, caducidad y cuota de envíos.
- HU-S-19: el estado de penalización se guarda, pero no se conserva un ledger auditable separado de cada intento/desbloqueo.
- HU-S-20 y HU-S-21: no se persiste auditoría de consultas denegadas ni de cambios/rechazos de rol.
- HU-S-22: el frontend cierra la sesión local tras 5 minutos de inactividad. La API stateless no revoca en servidor un JWT ya emitido; este sigue vigente hasta su expiración configurada.
- HU-06: perfil se muestra pendiente porque falta endpoint de edición.
- HU-14/HU-15: el documento no define fórmula de tránsito ni regla objetiva de retraso; no se inventaron.
- WhatsApp: falta el número oficial de la empresa.

## Verificación

Se realizaron comprobaciones estáticas de rutas, autorización, campos y secuencias de estado. No se pudo compilar ni ejecutar el proyecto en el entorno de edición: Java/Maven/Node/pnpm no estaban disponibles en PATH y la instalación de dependencias quedó bloqueada por permisos de red al registro npm. Instala dependencias y ejecuta la aplicación localmente para la verificación integral.
