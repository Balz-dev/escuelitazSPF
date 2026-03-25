# Pautas para el Desarrollo de Pruebas (Vitest) 🧪

La cobertura de tests es crítica para asegurar que las nuevas funcionalidades respeten la arquitectura.

## 🏆 Mock de Supabase Client

En lugar de mockear todo el SDK de `@supabase/supabase-js`, mockeamos el `createClient` interno alojado en `@/infrastructure/supabase/client`.

### Patrón para Mock en Services

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SupabaseMyService } from './SupabaseMyService'

// Mock del cliente Supabase
const mockSupabase = {
  from: vi.fn(),
  select: vi.fn(),
  eq: vi.fn(),
  single: vi.fn(),
}

vi.mock('../client', () => ({
  createClient: () => mockSupabase,
}))

describe('SupabaseMyService', () => {
    // Definir tests aquí
})
```

## 📐 Patrón para Mock en Repositories

Para testear un servicio que usa un repositorio (**Inyección de Dependencias**):

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MyService } from './MyService'
import { IMyRepo } from '@/core/application/repositories/IMyRepo'

const mockRepo: IMyRepo = {
  getById: vi.fn(),
  create: vi.fn(),
}

describe('MyService', () => {
  let service: MyService
  
  beforeEach(() => {
    service = new MyService(mockRepo) // Pasamos el mock
    vi.clearAllMocks()
  })

  it('debe orquestar el llamado al repositorio', async () => {
    const mockData = { id: '1', name: 'Test' }
    vi.mocked(mockRepo.getById).mockResolvedValueOnce(mockData)

    const result = await service.getData('1')
    
    expect(result).toEqual(mockData)
    expect(mockRepo.getById).toHaveBeenCalledWith('1')
  })
})
```

## 🚨 Checklist de Test para el Agente

Al crear una nueva funcionalidad:
1. [ ] ¿Existe un test unitario para el Repo/Service creado?
2. [ ] ¿Se usa `vi.mock` de forma que no se requiera conexión a DB real?
3. [ ] ¿Se están verificando tanto los casos de éxito como los de error?
4. [ ] ¿Los nombres de los tests están en español y describen claramente la intención?
5. [ ] ¿Se ha ejecutado `npm run test` para asegurar que todo pasa?
