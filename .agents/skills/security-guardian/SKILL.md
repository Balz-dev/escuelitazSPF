---
name: security-guardian
description: Guía al agente para auditar automáticamente la seguridad en cada tarea de desarrollo.
---

# Skill: Security Guardian (Guardián de Seguridad)

Este skill asegura que cada cambio en el código o base de datos de Escuelitaz SPF cumpla con los estándares de seguridad definidos en `docs/SECURITY.md`.

## Cuándo usar este skill
- Al crear nuevas tablas en Supabase.
- Al implementar nuevas funcionalidades que manejen datos de usuarios o financieros.
- Al crear nuevas Edge Functions.
- Al modificar el `AuthGuard` o el sistema de autenticación.

## Instrucciones para el Agente

### 1. Auditoría de Base de Datos
Cada vez que el usuario pida crear una tabla o modificar el esquema:
- **Verifica RLS:** Pregunta o implementa inmediatamente `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`.
- **Propón Políticas:** Sugiere políticas basadas en `auth.uid()` y el rol del usuario (`user_metadata`).

### 2. Auditoría de Código Frontend
- **Escaneo de Claves:** Si ves una cadena que parece una clave de Supabase (`eyJ...`), avisa al usuario que no debe estar hardcodeada.
- **Protección de Rutas:** Si se crea una nueva página en `src/app`, verifica si debe ser pública o privada y actualiza el `AuthGuard` si es necesario.
- **Inputs:** Asegúrate de que los formularios usen validación tanto en cliente como en la lógica de DB.

### 3. Auditoría de Edge Functions
- Asegura que las funciones usen el `auth.getUser()` del cliente y no asuman que el `uid` enviado es real sin verificar el JWT.

## Comandos Recomendados
- `search_docs` en Supabase para mejores prácticas de RLS.
- `grep_search` para buscar fugas de claves o uso de `service_role`.
