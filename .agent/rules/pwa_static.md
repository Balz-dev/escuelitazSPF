# Reglas del Proyecto: PWA & Static-First

Este proyecto es una **PWA Offline-First**. Sigue estas reglas estrictamente al generar o modificar código:

### 1. Prohibición de Lógica de Servidor
*   **NUNCA** uses `middleware.ts` o `proxy.ts` para lógica de autenticación o redirección. Usa `AuthGuard` de cliente.
*   **NUNCA** uses `fetch()` dentro de un Server Component para obtener datos dinámicos.
*   **NUNCA** utilices funciones que dependan de un entorno de ejecución Node.js (ej: `cookies()`, `headers()`, `redirect()` de `next/navigation` en el servidor).

### 2. Manejo de Datos
*   Para obtener datos, usa **TanStack Query** o **useEffect** en el cliente.
*   Para persistir datos, usa **Dexie.js** (`src/infrastructure/offline/db.ts`).
*   Toda la interacción con Supabase debe hacerse desde el lado del cliente.

### 3. UI y Estilos
*   Conserva el sistema de **Design Tokens HSL** en `globals.css`.
*   Usa **Tailwind CSS** y **shadcn/ui** exclusivamente.
*   Todas las rutas de la app (`director`, `padre`, `maestro`) deben ser accesibles offline.

### 4. Estructura de Rutas
*   Landing: `src/app/(marketing)/` (Estática).
*   Demo: `src/app/(demo)/demo/` (SPA).
*   App Real: `src/app/(app)/` (Protegida por AuthGuard).
