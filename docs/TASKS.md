# EscuelitazSPF – Registro de Tareas y Fases

> **Estado**: Sprint 1 del Director Hub completado. Iniciando Sprint 2 (Docente Dashboard) — 2026-03-27.

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
- [x] **UI de Login Personalizada**: Soporte para inicio de sesión por **Nombre de Usuario** mediante la estrategia de "Phantom Email" (Email Fantasma) para evitar costos de SMS.
- [x] **Normalización E.164**: Formateo automático de teléfonos en todo el flujo de onboarding.
- [x] **SaaS Onboarding**: Página de `/register` para escuelas y periodo de prueba de Ciclo Escolar.
- [x] **SuperAdmin Dashboard**: Gestión profesional de solicitudes con activación, rechazo con motivo, edición y eliminación total de registros.

---

## 🔄 Fase 4: Arquitectura Colaborativa y Roles (En Proceso)
> Arquitectura basada en "Collaborative Data Ownership", detallada en `arquitectura_colaborativa.md`.

### ✅ Sprint 1: Director Hub + Módulo Docentes (COMPLETO)
- [x] **Director Dashboard**: Layout y KPIs básicos (alumnos, docentes, ciclo activo).
- [x] **Hooks de Autorización**: `useEntityPermissions` + detección de sub-roles SPF.
- [x] **Componentes Compartidos Core**:
  - [x] `ValidationQueue` — (`src/components/shared/ValidationQueue.tsx`)
  - [x] `InvitationSender` — (`src/components/shared/InvitationSender.tsx`)
- [x] **Dominio Docente**:
  - [x] `DocenteProfileForm` — (`src/components/shared/DocenteProfileForm.tsx`)
  - [x] `TeachersList` con acciones CRUD + suplencias — (`src/features/director/components/TeachersList.tsx`)
  - [x] Página `/director/docentes` — registro, invitación y gestión completa.
  - [x] `RegisterTeacherDialog` + `EditTeacherDialog` + `CreateGroupDialog`
  - [x] Lógica de sustituciones: `startSubstitution` / `endSubstitution` en `SupabaseDirectorService`
- [x] **Dominio Alumno (Base)**:
  - [x] `StudentRegistrationForm` — (`src/components/shared/StudentRegistrationForm.tsx`)
  - [x] Página `/director/alumnos` — registro + cola de validación.

### 🔄 Sprint 2: Docente Dashboard (EN PROCESO — 2026-03-27)
- [ ] **Docente Dashboard Completo**: Actualmente es un placeholder. Requiere:
  - [ ] KPIs propios: alumnos del grupo, asistencia, pre-registros pendientes.
  - [ ] `useDashboardMetrics` adaptado o nuevo hook `useDocenteMetrics`.
- [ ] **Dominio Alumno (Docente)**:
  - [ ] Vista de alumnos filtrada por `group_id` del docente logueado.
  - [ ] Ruta `/docente/alumnos` con `ValidationQueue` para pre-registros de su grupo.
- [ ] **Dominio Perfil del Docente**:
  - [ ] Ruta `/docente/perfil` con `DocenteProfileForm` en modo auto-edición.
  - [ ] Guardar cambios vía `IDirectorService.updateTeacher` (o puerto dedicado).
- [ ] **Detección del grupo asignado**: Hook `useCurrentTeacher` que resuelva el `group_id` del docente conectado.
- [ ] **Tests**: Cobertura para `useDocenteMetrics` y `useCurrentTeacher`.

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
