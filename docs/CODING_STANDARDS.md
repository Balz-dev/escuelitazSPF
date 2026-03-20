# EscuelitazSPF – Estándares de Codificación y Buenas Prácticas

Estas reglas DEBEN seguirse en cada interacción de desarrollo para garantizar que el proyecto sea escalable, seguro y libre de deuda técnica.

## 1. Tipado Estricto (No Any)
- **Prohibición de `any`**: Está terminantemente prohibido el uso de `any`. Si un tipo es desconocido, usar `unknown` y realizar un Type Guard.
- **Entidades de Dominio**: Todas las funciones deben recibir o devolver entidades definidas en `src/core/domain`.
- **Interfaces**: Los puertos (interfaces) deben definir los contratos antes de cualquier implementación.

## 2. Arquitectura de 4 Capas (Clean Architecture)
- **Domain**: Lógica pura, cero dependencias.
- **Application**: Casos de uso e interfaces (Ports).
- **Infrastructure**: Implementaciones (Adapters). Nunca llamar a Supabase directamente desde la UI.
- **UI/Features**: Componentes modulares. Un componente solo habla con hooks que, a su vez, hablan con servicios/repositorios.

## 3. Seguridad Multi-tenancy (Aislamiento)
- **Aislamiento**: Cada tabla debe tener RLS habilitado.
- **Tenant Context**: En cada operación de escritura, se debe validar que el `school_id` esté presente y sea coherente con la sesión del usuario.
- **No Leaks**: Nunca devolver un objeto de base de datos (`Row`) directamente a la UI; usar siempre el mapeador al Dominio (`mapToDomain`).

## 4. Validación Continua (Testing)
- **TDD Lite**: Cada nueva funcionalidad debe venir acompañada de al menos un test unitario en `.test.ts`.
- **Build First**: Antes de dar por finalizada una tarea, se debe verificar que `tsc --noEmit` y `pnpm lint` pasen sin errores.

## 5. Gestión de Errores
- **Resiliencia**: Siempre manejar errores de red o base de datos en los adaptadores y relanzar errores de dominio comprensibles.
- **Logs**: Todas las acciones críticas (transacciones, votos, invitaciones) deben registrarse en la tabla `action_logs` del esquema.

## 6. CSS y Diseño
- **Premium UI**: Usar CSS Modules exclusively. Prohibido el uso de estilos en línea o layouts genéricos.
- **Tokens**: Usar las variables definidas en el Design System (colores, espaciados).
