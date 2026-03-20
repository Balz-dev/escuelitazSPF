import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SupabaseSchoolRepository } from './SupabaseSchoolRepository'

// Mock del cliente Supabase
const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn(),
  insert: vi.fn().mockReturnThis(),
}

vi.mock('../client', () => ({
  createClient: () => mockSupabase,
}))

describe('SupabaseSchoolRepository', () => {
  let repository: SupabaseSchoolRepository

  beforeEach(() => {
    repository = new SupabaseSchoolRepository()
    vi.clearAllMocks()
  })

  it('mapea correctamente los datos de Supabase a la entidad School', async () => {
    const rawData = {
      id: 'uuid-1',
      name: 'Escuela de Prueba',
      identifier: 'escuela-prueba',
      cct: '12345',
      address: 'Calle Falsa 123',
      logo_url: 'http://img.png',
      created_at: '2024-01-01T10:00:00Z',
      updated_at: '2024-01-01T10:00:00Z',
    }

    mockSupabase.single.mockResolvedValueOnce({ data: rawData, error: null })

    const result = await repository.getById('uuid-1')

    expect(result).toBeDefined()
    expect(result?.name).toBe('Escuela de Prueba')
    expect(result?.logoUrl).toBe('http://img.png')
    // Verificamos que se convirtieran a Date
    expect(result?.createdAt).toBeInstanceOf(Date)
    expect(mockSupabase.from).toHaveBeenCalledWith('schools')
  })

  it('retorna null si la escuela no existe', async () => {
    mockSupabase.single.mockResolvedValueOnce({ data: null, error: { message: 'Not found' } })
    const result = await repository.getById('uuid-nonexistent')
    expect(result).toBeNull()
  })
})
