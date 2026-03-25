---
name: clean-architecture-guardian
description: Guía al agente para seguir los principios de Arquitectura Limpia y Desacoplamiento de Responsabilidades en todo el proyecto.
---

# Clean Architecture Guardian 🛡️

Este skill asegura que cada nueva funcionalidad o refactorización siga rigurosamente los principios de **Arquitectura Limpia** (Clean Architecture) implementados en este proyecto.

## 🏗️ Estructura de Capas Obligatoria

Toda funcionalidad debe dividirse en:

### 1. Capa de Dominio (`src/core/domain`)
- **Entidades**: Objetos TS puros que representan los conceptos del negocio (e.g., `User`, `School`).
- **DTOs**: Tipos para transferir datos entre capas.
- **REGLA**: No debe importar nada de `infrastructure`, `client` o frameworks externos.

### 2. Capa de Aplicación (`src/core/application`)
- **Puertos (Interfaces)**: Definen *qué* se puede hacer (e.g., `IAuthService`, `ISchoolRepository`).
- **Casos de Uso**: Lógica de orquestación (opcional en este proyecto simple, usualmente delegada a los Servicios).
- **REGLA**: Los componentes de UI solo deben conocer los Puertos.

### 3. Capa de Infraestructura (`src/infrastructure`)
- **Implementaciones (Adapters)**: Implementan los Puertos definidos en la capa de Aplicación.
- **Tecnologías**: Supabase SDK, Fetch API, Local Storage, etc.
- **REGLA**: Aquí es el ÚNICO lugar donde se permite importar `createClient` de Supabase o usar bibliotecas externas de infraestructura.

### 4. Capa de UI (`src/app` y `src/components`)
- **Componentes y Páginas**: Consumen las interfaces a través de sus implementaciones.
- **REGLA**: NUNCA instanciar `createClient()` directamente en una página o componente. Usar siempre un Servicio.

---

## 🧪 Estrategia de Testing (Vitest)

Cada nuevo Servicio o Repositorio debe venir acompañado de sus tests.

### Reglas de Oro para Tests:
1. **Mock de Dependencias**: Al testear un Servicio que usa un Repositorio, se debe mockear la interfaz del Repositorio.
2. **Independencia**: Los unit tests no deben tocar la base de datos real de Supabase.
3. **Ubicación**: Los tests deben estar en la carpeta `__tests__` o con el sufijo `.spec.ts` / `.test.ts`.

---

## 🚀 Flujo de Trabajo para Nuevas Funcionalidades

1. **Definir Entidad**: Crear/actualizar en `src/core/domain/entities/`.
2. **Definir Puerto**: Crear la interfaz en `src/core/application/ports/`.
3. **Implementar Servicio**: Crear la clase en `src/infrastructure/supabase/services/` (implementando el Puerto).
4. **Registrar/Usar en UI**: Instanciar el servicio al inicio de la página o componente.
5. **Generar Tests**: Crear el archivo de test para el nuevo servicio mockeando Supabase o el Repositorio.

---

## 🛑 Prohibiciones (Red Flags)

- ❌ Importar `@supabase/supabase-js` en cualquier archivo dentro de `src/app`.
- ❌ Usar `createClient()` fuera de `src/infrastructure`.
- ❌ Acceder a metadatos crudos (`user.user_metadata`) directamente en la UI. Abstracto en el Servicio.
- ❌ Lógica de negocio pesada dentro de un `useEffect`. Mover al Servicio.

---

## 🔍 Documentación Detallada

- [Reglas y Organización](./rules.md)
- [Pautas de Testing](./testing_guidelines.md)
