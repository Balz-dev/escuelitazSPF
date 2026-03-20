# ADR-003: Autenticación Híbrida y RBAC Dinámico

## Status
Aceptado (Fase 2)

## Contexto
El sistema necesita tres perfiles (Maestro, Director, Padre) con membresías en una o varias escuelas. Necesitamos un flujo de pre-registro ("Invitación de Miembro") para facilitar el acceso a usuarios sin conocimientos técnicos, permitiendo un login seguro vía Google OAuth o Contraseña.

## Decisión
Usar el modelo de **Auth vs. Roles (RBAC)** desacoplado en Supabase:

1.  **Mesa `profiles`**: Extiende `auth.users` con campos como `fullName`, `phone` y `mustChangePassword`. Se crea vía Trigger SQL automático.
2.  **Mesa `school_members` y `member_roles`**: Vincula un usuario con una escuela específica y le asigna roles primarios (`member_role`) y subroles (`member_sub_role`: Tesorero, Presidente, etc.).
3.  **Pre-registro (`user_invitations`)**: Un Director puede invitar a un Padre/Maestro ingresando su Correo/Teléfono. Se genera un token temporal que permite al usuario reclamar su perfil y establecer su contraseña inicial o vincular su cuenta de Google.

## Consecuencias
- **Positivo**: Permite que un usuario sea "Padre" en una escuela y "Docente" en otra (Múltiples membresías-roles).
- **Positivo**: Proporciona un flujo guiado ("Pre-registro") que mejora la adopción del usuario.
- **Negativo**: La lógica de permisos en la UI depende de cargar las membresías del usuario en el primer login/landing.
- **Negativo**: Requiere un manejo cuidadoso de las invitaciones expiradas para no llenar la base de datos de basura.
