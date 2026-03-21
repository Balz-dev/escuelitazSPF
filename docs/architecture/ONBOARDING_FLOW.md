# Arquitectura de Onboarding y Activación (SaaS)

Este documento describe el flujo jerárquico y el sistema de activación de instancias implementado para el modelo SaaS de Escuelitaz SPF.

## 1. Modelo de Jerarquía y Onboarding

El sistema sigue una estructura de cascada para la creación de cuentas:

1. **SuperAdmin**: Gestiona las solicitudes de las escuelas y activa perfiles de perfiles de **Director**.
2. **Director**: Una vez activo, gestiona sus propios **Docentes**.
3. **Docente**: Gestiona el registro de **Padres** vinculados a sus alumnos.

## 2. Proceso de Registro de Escuelas

1. **Solicitud (`/register`)**: El director interesado envía sus datos (Nombre Escuela, Director, WhatsApp).
2. **Revisión Administrativa (`/admin/requests`)**: El SuperAdmin revisa la solicitud en una cola de pendientes.
   - **Rechazo con Motivo**: Al rechazar una escuela, se debe proporcionar una razón que se guarda en `rejection_reason`.
   - **Re-activación**: Las escuelas rechazadas pueden ser aprobadas más tarde si se decide cambiar de opinión.
3. **Activación**: Al aprobar una solicitud (o re-aprobar una rechazada):
   - Se crea el registro oficial en la tabla `schools`.
   - Se le asigna un estado `is_active: true`.
   - Se activa un periodo de prueba de **un ciclo escolar completo**.
   - Se dispara la Edge Function `invite-user` para crear el usuario del Director.
   - Las credenciales iniciales se envían vía WhatsApp:
     - **Usuario**: Nombre del director (minúsculas).
     - **Clave**: Nombre del director (minúsculas) + 4 dígitos (ej: `pedro4829`).

## 3. Control de Acceso e Inactividad

- **AuthGuard**: Verifica en cada navegación si la escuela vinculada al usuario está activa (`schools.is_active`).
- **Página de Suspensión (`/suspended`)**: Si la escuela no está activa, el usuario es redirigido aquí, bloqueando cualquier operación en el sistema.
- **Configuración Dinámica**: El número de soporte para renovaciones se gestiona en `src/config/constants.ts` (`APP_CONFIG.supportPhone`).

## 4. Tecnologías Clave

- **Supabase Auth API**: Creación administrativa de usuarios sin intervención del usuario final.
- **Edge Functions**: Lógica de generación de claves y normalización de usuarios.
- **WhatsApp API (`wa.me`)**: Protocolo primario para la entrega de credenciales seguras de "última milla".
