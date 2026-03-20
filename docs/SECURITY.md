# Gestión de Seguridad en Escuelitaz SPF

Este documento establece las reglas críticas de seguridad para el desarrollo de la plataforma, dada su arquitectura PWA Estática + Supabase.

## 1. El Búker: Row Level Security (RLS) en Supabase

Nuestra seguridad **no** depende del código de Next.js, sino de la base de datos.
- **Regla de Oro:** Ninguna tabla debe existir sin RLS activo.
- **Políticas Requeridas:**
    - `SELECT`: Solo si el usuario pertenece a la escuela (`school_id`).
    - `INSERT/UPDATE`: Solo si el rol del usuario lo permite (ej: `docente` para calificaciones, `director` para maestros).
    - `DELETE`: Solo el `superadmin` o el `director` en casos controlados.

## 2. Gestión de Claves y Secretos

- **PUBLIC KEY (`anon`):** Única clave permitida en el código frontend (`.env.local`).
- **SERVICE ROLE KEY:** **PROHIBIDO** incluirla en el frontend. Solo se usa internamente en migraciones locales o Edge Functions.
- **Variables de Entorno:** Nunca subas `.env.local` al repositorio.

## 3. Seguridad en el Frontend (PWA)

- **Sanitización:** React protege contra XSS, pero evita `dangerouslySetInnerHTML`.
- **Datos Sensibles:** No guardes contraseñas o datos bancarios en texto plano en `IndexedDB` (Dexie).
- **Validaciones:** Las validaciones de UI (ej: campos requeridos) son para UX. La seguridad real se valida en la base de datos.

## 4. Edge Functions

- Siempre usa `verify_jwt: true` en las funciones de Supabase, a menos que sea una función específicamente pública.
- Valida internamente el rol del usuario que llama a la función usando la metadata del JWT.

## 5. Auditoría de Nueva Funcionalidad (Checklist)

Cada vez que agregues algo nuevo, verifica:
- [ ] ¿He creado una nueva tabla? -> ¿Tiene RLS activo?
- [ ] ¿He creado una nueva ruta? -> ¿Está protegida por el `AuthGuard`?
- [ ] ¿He añadido un campo sensible? -> ¿Está oculto en las consultas públicas?
