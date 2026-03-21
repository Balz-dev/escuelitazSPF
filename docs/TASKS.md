# EscuelitazSPF – Registro de Tareas y Fases

> **Estado**: Fase 2 (Autenticación) y Gestión SaaS completada sobre arquitectura PWA (Offline-First).

---

## ✅ Fase 1: Infraestructura y Supabase (Finalizado)
- [x] **Crear proyecto Supabase dedicado**: project_ref: `kahiqnthjvjfpkgtnsev`.
- [x] **Aplicar Migraciones SQL**: Escenario de 22 tablas en 8 dominios (PostgreSQL 17).
- [x] **Row-Level Security (RLS)**: Políticas de aislamiento físico y multi-tenant configuradas por tabla.
- [x] **Cliente Supabase Singleton**: Cliente instanciado y configurado en modo SPA/estático.
- [x] **Generación de Tipos**: Tipos de TypeScript generados en `database.types.ts`.
- [x] **PWA & Offline-First**: Transición a Next.js Static Export, Service workers y eliminación de dependencias SSR.
- [x] **Documentación Técnica**: ADRs 001, 002 y 003 creados en `docs/decisions/` y reglas del agente ajustadas a PWA.
- [x] **Gobernanza de Calidad**: Creado `docs/CODING_STANDARDS.md` y lineamientos de código.

---

## ✅ Fase 0: Fundación (Finalizado)
- [x] Inicializar Next.js 15, App Router, TypeScript (Strict).
- [x] Configurar Vitest + jsdom + unit test placeholders.
- [x] Estructura de directorios (Clean Architecture: Domain, Application, Infra, UI).

---

## ✅ Fase 2: Autenticación e Identidad (PWA/SPA - Finalizado)
- [x] **Protección de Rutas (PWA)**: Lógica en el cliente (Hooks/Layouts) para controlar el acceso y redirigir a `/login`.
- [x] **Dominio de Usuario**: Entidades `UserProfile`, `SchoolMember` y `MemberRole` definidas.
- [x] **Servicio de Auth (Port/Adapter)**: `IAuthService` y su implementación en Supabase (SPA) con tipado estricto.
- [x] **UI de Login**: Formulario premium con soporte OTP y Password.
- [x] **Módulo de Registro/Invitación**: Flujo jerárquico (SuperAdmin -> Director -> Docente -> Padre).
- [x] **SaaS Onboarding**: Página de `/register` para escuelas y periodo de prueba de Ciclo Escolar.
- [x] **SuperAdmin Dashboard**: Ruta `/admin/requests` para activación instantánea, rechazo con motivo y re-activación de instituciones (Professional UI).

---

## 🔄 Fase 4: Arquitectura Colaborativa y Roles (En Proceso)
> Arquitectura basada en "Collaborative Data Ownership", detallada en `arquitectura_colaborativa.md`.

### 🏃 Sprint 1: Director Hub + Módulo Docentes (Pivot)
- [ ] **Director Dashboard**: Layout y KPIs básicos (alumnos, docentes, ciclo activo).
- [ ] **Hooks de Autorización**: Implementar `useEntityPermissions` y detección de sub-roles SPF.
- [ ] **Componentes Compartidos Core**:
  - [ ] `ValidationQueue` (Cola de validaciones genérica).
  - [ ] `InvitationSender` (Envío de invitaciones multi-rol).
- [ ] **Dominio Docente**:
  - [ ] `DocenteProfileForm` (Formulario compartido).
  - [ ] Vista de lista de docentes para Director + gestión de estado.
- [ ] **Dominio Alumno (Base)**:
  - [ ] `StudentRegistrationForm` (Formulario compartido).
  - [ ] Vista de lista de alumnos de la escuela.

### 🏃 Sprint 2: Docente Dashboard
- [ ] **Docente Dashboard**: Layout y KPIs filtrados por su grupo asignado.
- [ ] **Dominio Alumno (Docente)**:
  - [ ] Vista de alumnos filtrada por el grupo del docente.
  - [ ] `ValidationQueue` específica para pre-registros de su grupo.
- [ ] **Dominio Perfil**:
  - [ ] Panel de auto-edición usando `DocenteProfileForm`.

### 🏃 Sprint 3: Módulo SPF (Microaplicación Semi-Autónoma)
> Exclusivo para Padres con sub-roles (Presidente, Tesorero, Secretario, Vocal, Suplente).
- [ ] **Migración BD**: Añadir `suplente` al enum `member_sub_role`.
- [ ] **SPF Hub**: Panel de administración propio en `/spf`.
- [ ] **Gestión de Convocatorias**: CRUD y pase de asistencia.
- [ ] **Finanzas SPF**: Registro de ingresos/egresos y flujo de aprobación.
- [ ] **Elecciones**: Proceso electoral de la mesa directiva.
- [ ] **Comunicados**: Hilos de foro con segmentación por roles.
- [ ] **Shared Widgets**: `AvisosSPF`, `ResumenFinanciero`, `ProximaReunion` para inyectar en dashboards.

### 🏃 Sprint 4: Padre Dashboard
- [ ] **Padre Dashboard**: Layout, KPIs (estado de cuota) y consumo de Shared Widgets SPF.
- [ ] **Auto-registro**: Uso de `StudentRegistrationForm` para inscripción de hijos.
- [ ] **Dominio Perfil**:
  - [ ] Panel de auto-edición usando `ParentProfileForm`.
  - [ ] Visualización de estado de pagos y avisos dirigidos.

---
