# ADR-001: Arquitectura de 4 Capas (Clean Architecture + DDD Lite)

## Status
Aceptado (Fase 1)

## Contexto
El proyecto anterior (`escuelitaz`) presentaba problemas de mantenimiento debido a que la lógica de negocio estaba mezclada con los componentes de UI y las llamadas directas a Supabase, creando un acoplamiento fuerte difícil de probar unitariamente.

## Decisión
Implementar una separación de preocupaciones estricta dividiendo el código en 4 capas desacopladas por puertos e interfaces:

1.  **Domain (Core)**: Contiene entidades puras y reglas de negocio. (Cero dependencias externas).
2.  **Application (Use Cases)**: Contiene la interfaz de los servicios y repositorios (Ports).
3.  **Infrastructure**: Implementaciones concretas de Supabase, Offline (Dexie), APIS (Adapters).
4.  **UI/Presentation**: Componentes de React, Layouts y Hooks.

## Consecuencias
- **Positivo**: El sistema es sumamente fácil de probar con Vitest sin necesidad de red (usando mocks de las interfaces).
- **Positivo**: Si decidimos cambiar de Supabase a otro servicio de BD en el futuro, solo se toca la capa de Infrastructure sin afectar la UI ni el dominio.
- **Negativo**: Requiere más archivos iniciales (Boilerplate) para mapear entidades.
