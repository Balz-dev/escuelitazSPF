# Cobertura de Tests Unitarios

Este documento describe la batería de pruebas unitarias del proyecto EscuelitazSPF.

## Resumen de Cobertura

| Archivo | Tests | Descripción |
|---------|-------|-------------|
| `useEntityPermissions.test.ts` | 33 | Sistema RBAC completo |
| `SupabaseAdminService.test.ts` | 9 | Gestión de solicitudes de escuelas |
| `SchoolLogoService.test.ts` | 8 | Upload/delete de logos |
| `useConvocatorias.test.ts` | 8 | Hook de convocatorias |
| `useLocalProfile.test.ts` | 10 | Hook de perfil local |
| `cn.test.ts` | 18 | Utilidad de merge de clases |
| `SupabaseAuthService.test.ts` | 3 | Servicio de autenticación (pre-existente) |
| `LocalProfileService.test.ts` | 5 | Servicio de perfil offline (pre-existente) |
| **TOTAL** | **94 tests nuevos + 8 pre-existentes = 102** | |

---

## Detalle por Archivo

### 1. `src/hooks/useEntityPermissions.test.ts`

**Responsabilidad:** Lógica RBAC (Roles y Permisos)

**Tests incluidos:**
- Permisos sobre estudiantes (6 tests)
  - Director puede crear/editar/validar
  - Docente puede crear/editar/validar
  - Padre puede crear y editar sus propios hijos
  - Actor sin rol no tiene permisos
- Permisos sobre docentes (4 tests)
  - Director gestiona docentes
  - Docente solo edita su perfil
- Permisos sobre padres (3 tests)
  - Director/docente pueden gestionar padres
  - Padre solo edita su perfil
- Permisos sobre transacciones SPF (7 tests)
  - Director, presidente, tesorero pueden gestionar
  - Regla general de finanzas SPF
- Permisos sobre convocatorias (7 tests)
  - Roles con permisos de creación
- Casos borde (6 tests)
  - Rol null, subRole null, isOwner

**Por qué es crítico:** Controla quién puede hacer qué en todo el sistema.

---

### 2. `src/infrastructure/supabase/services/SupabaseAdminService.test.ts`

**Responsabilidad:** Aprobación/rechazo de solicitudes de escuelas

**Tests incluidos:**
- `getOnboardingRequests` (3 tests)
  - Obtiene solicitudes ordenadas
  - Retorna array vacío si no hay
  - Lanza error si falla DB
- `approveRequest` (8 tests)
  - Crea escuela con identifier generado
  - Formato de slug válido
  - Invoca edge function con parámetros correctos
  - Actualiza estado a approved
  - Retorna success + school + credentials
  - Manejo de errores en cascada
- `rejectRequest` (3 tests)
  - Actualiza estado a rejected
  - Retorna success true
  - Manejo de errores

**Por qué es crítico:** Gestiona la creación de nuevas escuelas y la invitación de directores.

---

### 3. `src/infrastructure/supabase/services/SchoolLogoService.test.ts`

**Responsabilidad:** Upload y eliminación de logos de escuelas

**Tests incluidos:**
- `uploadLogo` (7 tests)
  - Construye ruta correcta con extensión
  - Preserva extensión del archivo original
  - Actualiza logo_url en BD
  - Retorna URL pública
  - Manejo de errores (Storage, BD)
- `deleteLogo` (4 tests)
  - Elimina archivo del Storage
  - Actualiza logo_url a null
  - Manejo de errores
  - Diferentes extensiones

**Por qué es importante:** Imágenes de escuelas son parte de la identidad visual.

---

### 4. `src/features/director/hooks/useConvocatorias.test.ts`

**Responsabilidad:** Hook para gestionar convocatorias del director

**Tests incluidos:**
- Carga inicial (3 tests)
  - No carga sin schoolId
  - Carga convocatorias
  - Manejo de errores
- `create` (1 test)
  - Crea y agrega al inicio
- `publish` (1 test)
  - Actualiza estado a activa
- `close` (1 test)
  - Actualiza estado a cerrada
- `remove` (1 test)
  - Elimina de la lista
- `refresh` (1 test)
  - Recarga todas

**Por qué es importante:** Funcionalidad core del dashboard del director.

---

### 5. `src/features/director/hooks/useLocalProfile.test.ts`

**Responsabilidad:** Perfil local del usuario (IndexedDB)

**Tests incluidos:**
- Carga inicial (4 tests)
  - No carga sin userId
  - Carga perfil
  - Carga avatar URL
  - Revoca Object URLs anteriores
- `saveProfile` (2 tests)
  - Guarda y recarga
  - No hace nada sin userId
- `saveAvatar` (2 tests)
  - Guarda avatar y recarga
  - No hace nada sin userId
- `deleteAvatar` (2 tests)
  - Elimina y actualiza estado
  - No hace nada sin userId
- Limpieza (1 test)
  - Revoca Object URL al desmontar

**Por qué es importante:** Persistencia offline del perfil personal.

---

### 6. `src/core/shared/utils/cn.test.ts`

**Responsabilidad:** Utilidad de merge de clases CSS

**Tests incluidos:**
- Valores simples (4 tests)
  - Inputs vacíos
  - Strings sin cambios
  - Números a string
  - Combinación de strings
- Objetos como condiciones (3 tests)
  - Keys truthy incluidas
  - Keys falsy excluidas
  - Objetos vacíos
- Arrays (4 tests)
  - Aplancha arrays
  - Arrays anidados recursivos
  - Filtra valores vacíos
  - Arrays vacíos
- Casos mixtos (2 tests)
  - Combina strings, objetos, arrays
  - Condiciones booleanas
- Casos borde (5 tests)
  - Booleanos en nivel superior
  - Clases con guiones/números
  - Orden de clases

**Por qué es importante:** Utilidad usada en toda la UI para clases condicionales.

---

### 7. `src/components/auth/auth-guard.test.tsx`

**Responsabilidad:** Guardian de rutas y redirecciones

**Tests incluidos:**
- Rutas públicas (3 tests)
  - `/` es pública
  - `/login` es pública
  - Subrutas de `/demo` son públicas
- Redirecciones sin sesión (1 test)
  - Redirige a /login
- Redirecciones por rol (5 tests)
  - Director → /director
  - Docente → /docente
  - Superadmin → /admin/requests
  - Padre → /padre
  - Rol desconocido → /dashboard
- Verificación de escuela activa (2 tests)
  - Redirige a /suspended si inactiva
  - Permite acceso si activa
- Spinner de carga (1 test)
  - Muestra spinner mientras verifica
- Suscripción (1 test)
  - Desuscribe al desmontar

**Por qué es crítico:** Control de acceso a todas las rutas protegidas.

---

## Tests Pre-existentes

| Archivo | Tests | Descripción |
|---------|-------|-------------|
| `SupabaseAuthService.test.ts` | 3 | Autenticación |
| `LocalProfileService.test.ts` | 5 | Servicio de perfil offline |
| `SupabaseSchoolRepository.test.ts` | 2 | Repositorio de escuelas |
| `SupabaseConvocatoriaRepository.test.ts` | 4 | Repositorio de convocatorias |
| `SupabasePreregistrationRepository.test.ts` | 3 | Repositorio de pre-registros |
| `supabase.test.ts` | 2 | Cliente Supabase |

---

## Cómo Ejecutar los Tests

```bash
# Todos los tests
npm test

# Tests específicos
npx vitest run src/hooks/useEntityPermissions.test.ts

# Modo watch
npx vitest src/hooks/useEntityPermissions.test.ts

# Coverage
npx vitest run --coverage
```

---

## Principios de Testing Aplicados

1. **Tests independientes:** Cada test puede ejecutarse solo
2. **Mocks de dependencias externas:** Supabase, IndexedDB, Next.js router
3. **Naming descriptivo:** El nombre del test describe el escenario
4. **Arrange-Act-Assert:** Estructura clara en cada test
5. **Casos borde:** Incluye escenarios límite y de error
