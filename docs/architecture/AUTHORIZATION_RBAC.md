# Arquitectura de Autorización y RBAC (Multi-tenant)

Este documento describe el sistema de control de acceso implementado para garantizar que cada escuela (tenant) esté aislada y que los usuarios tengan los permisos adecuados según su rol.

## 1. Principio de Aislamiento (Multitenancy)

La plataforma utiliza una arquitectura de **base de datos compartida con aislamiento lógico**.
- Cada registro en tablas sensibles (Alumnos, Pagos, Transacciones) tiene una columna `school_id`.
- La seguridad se aplica a nivel de base de datos mediante **Row Level Security (RLS)**.

### Función `get_my_school_ids()`
Esta función de SQL recupera todos los IDs de las escuelas a las que el usuario autenticado pertenece:
```sql
SELECT school_id FROM public.school_members
WHERE user_id = auth.uid() AND is_active = true;
```

---

## 2. Flujo de Invitación y Registro

Para evitar que cualquier persona con una cuenta de Google acceda a datos de una escuela, se implementó un flujo de invitación obligatoria:

1.  **Invitación**: Un Administrador o Director crea una invitación en `public.user_invitations` asociada a un correo electrónico.
2.  **Registro/Login**: El usuario inicia sesión con Google.
3.  **Vinculación Automática (Trigger)**:
    - Se activa la función SQL `public.handle_invitation_on_signup()`.
    - Busca una invitación pendiente para ese correo.
    - Si existe, vincula al usuario a la escuela, le asigna su rol y actualiza sus metadatos de sesión (`app_metadata`).
4.  **Acceso**: El usuario es redirigido a su dashboard correspondiente.

---

## 3. Identificadores de Acceso Inteligentes

Para facilitar el acceso (especialmente a padres y docentes), el sistema permite tres tipos de identificadores:
- **Email**: `nombre@escuela.com`
- **Teléfono**: `+52123456...`
- **Nombre de Usuario (Virtual)**: `maestra.1234` o `padre.5567` (autogenerados en la invitación).

### Resolución de Identificador
El `SupabaseAuthService` realiza una búsqueda previa (RPC `resolve_identifier_by_username`) si el identificador no cumple con el formato de email o teléfono. Esto permite que el usuario ingrese con su "apodo" de plataforma mientras la base de datos mapea internamente su sesión real.

---

## 4. Roles y Redirección (AuthGuard)

El componente `AuthGuard` en el frontend actúa como el guardián de rutas.

| Rol | Dashboard | Descripción |
| :--- | :--- | :--- |
| `superadmin` | `/admin/requests` | Administrador global de la plataforma. |
| `director` | `/director` | Gestor principal de una escuela específica. |
| `docente` | `/docente` | Acceso a gestión de alumnos y grupos. |
| `padre` | `/padres` | Acceso a información de sus hijos y pagos. |
| `ninguno` | `/unauthorized` | Usuarios autenticados pero no invitados (Sala de espera). |

---

## 4. Seguridad en Base de Datos (RLS)

Se han configurado políticas estrictas para cada tabla:

- **Perfiles**: Un usuario solo puede ver su propio perfil, los perfiles de miembros de su misma escuela, o si es superadmin.
- **Escuelas**: Solo los superadmins ven todas; los directores solo ven la suya.
- **Entidades Escolares**: Todas filtran por `school_id IN (SELECT get_my_school_ids())`.

---

## 5. Mantenimiento y Auditoría

Cada acción crítica queda registrada en la tabla `public.action_logs`, capturando el `user_id`, `school_id` y los detalles de la operación realizada.
