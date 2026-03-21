# Migración de Metadatos: Seguridad de Roles (app_metadata vs user_metadata)

## Contexto 
Originalmente, los roles de usuario (ej. `superadmin`, `director`, `padre`) y el `school_id` se almacenaban en la columna `user_metadata` de Supabase Auth. Este enfoque funciona bien para prototipos, pero presenta un riesgo de seguridad en un modelo SaaS de producción. 

En Supabase, los usuarios pueden enviar mutaciones a la API pública para **modificar su propio campo `user_metadata`**. Aunque la base de datos subyacente puede protegerse con RLS, un "hacker" ingenioso podría asignarse a sí mismo el rol de `superadmin` en su token enviando un payload como:
```javascript
supabase.auth.updateUser({ data: { role: 'superadmin' } })
```

## Solución: Custom Claims con `app_metadata`
Se tomó la decisión arquitectónica de migrar la gestión de roles a **`app_metadata`**.

### ¿Qué es `app_metadata`?
Es un campo protegido internamente por Supabase. Se inyecta en el objeto inicial de la sesión JWT y es completamente **inmodificable por el cliente** final. Solamente el panel de administración o servicios ejecutados con privilegios de administrador del servidor (el `service_role` de Supabase) pueden modificar este campo. 

Este diseño tiene varias ventajas clave, especialmente porque el proyecto es una aplicación **Progressive Web App (PWA)**:
1. **Seguridad Total**: Imposibilita la elevación de privilegios desde el cliente.
2. **Offline-First / Zero-latency**: No rompe el PWA y no exige tablas externas extra. El rol del usuario sigue inyectado dentro del token Web JSON (JWT) almacenado en el LocalStorage y se lee inmediatamente en el arranque de la app, sin requerir internet para consultar permisos.
3. **Escalabilidad**: Mantiene la arquitectura sencilla sin requerir una compleja malla inicial de "Policies" (RLS).

## Cambios Realizados
1. **Edge Function (`invite-user/index.ts`)**: Se modificó para registrar el `role` y el `school_id` obligatoriamente dentro de `app_metadata` al momento de usar `admin.createUser`. 
2. **AuthGuard (`auth-guard.tsx`)**: Ahora el sistema de ruteo lee los permisos priorizando la lectura desde `app_metadata`. (Retenemos la capacidad de leer `user_metadata` como plan de contingencia fallback para usuarios viejos).
3. **Controladores de Layout (`login/page.tsx` y `set-password/page.tsx`)**: También se les enseñó a resolver el rol mediante un mapeo similar `const role = user.app_metadata?.role || user.user_metadata?.role`.

---

## Migración de Usuarios Existentes (SQL de Mantenimiento)
Si tienes usuarios antiguos (por ejemplo, tu propia cuenta `superadmin`) que todavía confían únicamente en su `user_metadata`, debes ejecutar la siguiente instrucción SQL en el Editor SQL de tu panel de Supabase. Este script copia los roles en el lugar blindado permanentemente:

```sql
-- Ejecutar en Supabase SQL Editor: Esto mueve el 'role' y el 'school_id' desde user_metadata a app_metadata.

UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || jsonb_build_object(
  'role', raw_user_meta_data->>'role',
  'school_id', raw_user_meta_data->>'school_id'
)
WHERE raw_user_meta_data->>'role' IS NOT NULL;
```
