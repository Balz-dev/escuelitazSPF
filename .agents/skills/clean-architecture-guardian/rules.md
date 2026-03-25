# Reglas de Codificación y Arquitectura

## 📂 Organización de Archivos

```
src/
  core/
    domain/
      entities/    # Interfaces y clases de negocio puras
    application/
      ports/       # Definición de interfaces (puntos de entrada/salida)
  infrastructure/
    supabase/
      client.ts    # Configuración de herramental
      repositories/# Acceso a datos (CRUD de bajo nivel)
      services/    # Lógica que usa repositorios y SDKs
  app/             # Router de Next.js
  components/
    shared/        # UI genérica desacoplada
    features/      # UI específica de un dominio
```

## 📜 Reglas de Implementación

1. **Inyección de Dependencias (Simple)**:
   - Los servicios en `infrastructure` deben aceptar sus repositorios en el constructor (con un valor por defecto para facilitar el uso en la UI pero permitir mocks en tests).
   ```typescript
   class SupabaseMyService implements IMyService {
     constructor(private repo: IMyRepo = new SupabaseMyRepo()) {}
   }
   ```

2. **Mapeo de Datos**:
   - Los repositorios deben mapear las filas de la base de datos (snake_case) a entidades de dominio (camelCase).
   - Los servicios deben retornar entidades de dominio, nunca tipos específicos de Supabase (`Tables<'x'>` o `PostgrestResponse`).

3. **Manejo de Errores**:
   - Capturar errores de infraestructura y re-lanzarlos como errores con mensajes amigables para el usuario o errores de dominio específicos.

4. **UI Pasiva**:
   - El componente de React no debe saber si los datos vienen de Supabase, un JSON local o una API REST. Solo conoce el historial de llamadas del servicio.
