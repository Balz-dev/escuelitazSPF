---
description: Siempre audita la seguridad en cada cambio de código o base de datos.
---

# Regla: Security-First (Seguridad Ante Todo)

Para cada tarea que implique cambios en la estructura de datos, autenticación o comunicación con el servidor, debes seguir este proceso obligatorio de auditoría:

## 1. Verificación de Supabase
Si creas o modificas una tabla, genera **automáticamente** los comandos SQL para:
- `ALTER TABLE "nombre" ENABLE ROW LEVEL SECURITY;`
- Crear políticas de `SELECT`, `INSERT`, `UPDATE` y `DELETE` basadas en `auth.uid()`.

## 2. Verificación de Rutas
Si creas una nueva página en `src/app`:
- Pregunta si debe ser pública o privada.
- Si es privada, asegúrate de que esté bajo el control de `src/components/auth/auth-guard.tsx`.

## 3. Prevención de Fugas
- Nunca uses la clave `service_role` en el código del cliente.
- Si detectas claves hardcodeadas, advierte al usuario inmediatamente.

## 4. Sanitización
- Valida que todos los datos recibidos de un formulario de usuario se traten como datos no confiables.

Consulta siempre `docs/SECURITY.md` para detalles específicos del proyecto.
