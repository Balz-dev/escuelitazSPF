import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Supabase{Entity}Service } from './Supabase{Entity}Service'
import { I{Entity}Repository } from '@/core/application/repositories/I{Entity}Repository'

const mock{Entity}Repo: I{Entity}Repository = {
  getById: vi.fn(),
  create: vi.fn(),
  // ... añadir más métodos
}

describe('Supabase{Entity}Service', () => {
  let service: Supabase{Entity}Service
  
  beforeEach(() => {
    service = new Supabase{Entity}Service(mock{Entity}Repo)
    vi.clearAllMocks()
  })

  it('debe orquestar el llamado al repositorio para obtener datos', async () => {
    const mockData = { id: '1', name: 'Test' }
    vi.mocked(mock{Entity}Repo.getById).mockResolvedValueOnce(mockData as any)

    const result = await service.get('1') // método a llamar
    
    expect(result).toEqual(mockData)
    expect(mock{Entity}Repo.getById).toHaveBeenCalledWith('1')
  })

  it('debe manejar errores del repositorio', async () => {
    vi.mocked(mock{Entity}Repo.getById).mockRejectedValueOnce(new Error('DB Error'))

    await expect(service.get('1')).rejects.toThrow('DB Error')
  })
})
