# ADR-005: Arquitectura PWA, Static-First y Auth de Cliente

**Estatus**: Aprobado ✅

## Contexto
La aplicación **Escuelitaz SPF** debe funcionar en entornos con conexión intermitente (escuelas). El uso de SSR (Server Side Rendering) y Middleware de servidor rompe la experiencia de una PWA (Progressive Web App) cuando el dispositivo no tiene internet, ya que el servidor no puede responder.

## Decisión
Se ha decidido migrar hacia una **Arquitectura 100% Estática y Desconectada**:

1.  **Output Estático**: La aplicación usará `output: 'export'` (SSG/SPA) en lugar de SSR.
2.  **Auth de Cliente**: Se elimina el `middleware.ts` / `proxy.ts`. La protección de rutas se gestionará en el cliente mediante un componente `AuthGuard`.
3.  **No Server-Side Fetch**: Queda prohibido el uso de `fetch` dentro de Server Components o lógica de servidor. Toda la data se obtiene en el cliente y se persiste en **IndexedDB (Dexie.js)**.
4.  **Single Page Application (SPA) para la App**: Las rutas del dashboard se cargan dinámicamente en el navegador.

## Consecuencias
*   **Positivas**: Carga instantánea, funcionamiento 100% offline, despliegue más económico y escalable.
*   **Negativas**: No se pueden usar funciones de Next.js que requieran servidor (headers, cookies en servidor, middleware de redirección).

## Reglas de Implementación
*   Todas las páginas de la "App" y "Demo" deben ser `use client` o compatibles con exportación estática.
*   El estado global se maneja con **Zustand**.
*   La persistencia de datos se hace con **Dexie.js**.
