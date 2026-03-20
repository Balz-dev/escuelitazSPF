# ADR-002: Multi-tenancy Lógico (RLS y school_id)

## Status
Aceptado (Fase 1)

## Contexto
El sistema debe soportar múltiples escuelas de forma independiente (Multi-tenancy). Necesitamos un balance entre simplicidad de administración y seguridad estricta para que una escuela nunca vea los datos financieros o alumnos de otra.

## Decisión
Usar el modelo de **Shared Database, Shared Schema** con aislamiento lógico estricto en el motor PostgreSQL de Supabase.

1.  **Políticas RLS**: Se habilitó RLS en las 22 tablas del sistema.
2.  **school_id**: Cada tabla transaccional (alumnos, reuniones, transacciones, etc.) contiene un campo `school_id` UUID no nulo.
3.  **Filtrado por Sesión**: La función de base de datos `get_my_school_ids()` vincula el `auth.uid()` con la tabla `school_members` para permitir SELECT/INSERT/UPDATE solo si el usuario pertenece a la escuela específica.

## Consecuencias
- **Positivo**: No es necesario crear bases de datos nuevas para cada escuela (fácil mantenimiento).
- **Positivo**: El aislamiento se ejecuta a nivel de base de datos (PostgreSQL 17), reduciendo el riesgo de errores en el código de la UI que filtren datos.
- **Negativo**: Se debe asegurar que cada inserción incluya el `school_id` correcto o lanzará error de violación de política.
- **Negativo**: Todas las consultas transversales deben considerar el `school_id` para optimizar el rendimiento de los índices.
