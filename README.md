# EscuelitazSPF – Gestión de Sociedades de Padres de Familia

Plataforma SaaS multi-tenant diseñada para digitalizar la comunicación, finanzas y gobernanza de las Sociedades de Padres de Familia (SPF) en escuelas.

## 🚀 Visión
Ofrecer una herramienta profesional, transparente y escalable que permita a directores, maestros y padres gestionar asambleas, elecciones y cuotas de forma digital, offline-first y con aislamiento estricto de datos.

## ⚙️ Configuración del Entorno

### Prerrequisitos
- **Node.js**: v20.x o superior.
- **pnpm**: v9.x o superior.
- **Supabase CLI**: Para desarrollo local y migraciones.

### Instalación Local
```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd escuelitazSPF

# 2. Instalar dependencias
pnpm install

# 3. Configurar variables de entorno
cp .env.example .env.local

# 4. Iniciar base de datos local (Supabase)
supabase start

# 5. Ejecutar servidor de desarrollo
pnpm dev
```

## 🔐 Variables de Env (.env.local)
Asegúrate de configurar las siguientes variables para la conexión con Supabase:
- `NEXT_PUBLIC_SUPABASE_URL`: URL del proyecto.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Llave pública anónima.
- `SUPABASE_SERVICE_ROLE_KEY`: (Solo env. de servidor) Para bypass de RLS.

## 🛠️ Stack Tecnológico
- **Frontend**: Next.js 15 (App Router), React 19, Vanilla CSS.
- **Backend/Base de Datos**: Supabase (PostgreSQL 17), RLS Multi-tenant.
- **Offline Engine**: Dexie.js + Zustand + TanStack Query.
- **Testing**: Vitest, React Testing Library, Playwright.

## 🏛️ Arquitectura (Clean Architecture)
El proyecto utiliza una estructura de 4 capas desacopladas:
- `src/core/domain`: Entidades puras y reglas de negocio.
- `src/core/application`: Casos de uso e Interfaces de Repositorio.
- `src/infrastructure`: Implementaciones de Supabase y Offline (Adaptadores).
- `src/ui`: Componentes, Layouts, Hooks y Páginas de Next.js.

## 🧪 Testing y Validación
```bash
# Unitarios e Integración
pnpm test

# E2E (Playwright)
pnpm test:e2e
```

## 🚢 Despliegue y Mejores Prácticas

### Git Workflow (IA-Assisted)
Para mantener un repositorio profesional, seguimos estas reglas:
1. **Ramas**: Siempre usar ramas de funcionalidad (`feature/nombre-de-la-funcionalidad`).
2. **Commits**: Usar [Conventional Commits](https://www.conventionalcommits.org/) (ej: `feat:`, `fix:`, `chore:`).
3. **Workflows**: Usar el comando `/start_feature` para sincronizar con `main` automáticamente.

### Estrategia de Despliegue (CI/CD)
- **Staging**: Despliegue automático en Vercel tras cada Pull Request a `main`.
- **Producción**: Despliegue tras merge y tagging en `main`.
- **Supabase**: Las migraciones se aplican automáticamente vía GitHub Actions usando `supabase db push`.

---
*Desarrollado con ❤️ para la comunidad de Escuelitaz..*
