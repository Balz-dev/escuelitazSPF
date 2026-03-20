import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SupabasePreregistrationRepository } from '@/infrastructure/supabase/repositories/SupabasePreregistrationRepository'

// Mock del cliente Supabase
vi.mock('@/infrastructure/supabase/client', () => ({
  createClient: () => ({
    from: vi.fn(),
  }),
}))

const makeMockChain = (returnData: unknown, returnError: unknown = null) => {
  const chain: Record<string, unknown> = {}
  const methods = ['from', 'select', 'insert', 'update', 'eq', 'order', 'single']
  methods.forEach(m => {
    chain[m] = vi.fn().mockReturnValue(chain)
  })
  // El último .single() o .order() devuelve el resultado
  ;(chain.single as ReturnType<typeof vi.fn>).mockResolvedValue({ data: returnData, error: returnError })
  ;(chain.order as ReturnType<typeof vi.fn>).mockResolvedValue({ data: returnData, error: returnError })
  return chain
}

describe('SupabasePreregistrationRepository', () => {
  it('mapToDomain — convierte snake_case a camelCase correctamente', async () => {
    const rawRecord = {
      id: 'test-uuid',
      school_id: 'school-uuid',
      first_name: 'Ana',
      last_name: 'García',
      curp: 'GALA020101HVZRRL00',
      grado: '3°A',
      parent_name: 'Luis García',
      parent_phone: '2791234567',
      parent_email: 'luis@mail.com',
      relationship: 'padre',
      status: 'pendiente',
      registered_by: null,
      reviewed_by: null,
      reviewed_at: null,
      notes: null,
      created_at: '2026-03-19T12:00:00Z',
      updated_at: '2026-03-19T12:00:00Z',
    }

    const { createClient } = await import('@/infrastructure/supabase/client')
    const mock = createClient()
    const chain = makeMockChain([rawRecord])
    ;(mock.from as ReturnType<typeof vi.fn>).mockReturnValue(chain)

    const repo = new SupabasePreregistrationRepository()
    const results = await repo.getBySchool('school-uuid')

    expect(results).toHaveLength(1)
    expect(results[0].firstName).toBe('Ana')
    expect(results[0].lastName).toBe('García')
    expect(results[0].parentPhone).toBe('2791234567')
    expect(results[0].status).toBe('pendiente')
    expect(results[0].registeredBy).toBeNull()
    expect(results[0].createdAt).toBeInstanceOf(Date)
  })

  it('create — lanza error si Supabase falla', async () => {
    const { createClient } = await import('@/infrastructure/supabase/client')
    const mock = createClient()
    const chain = makeMockChain(null, { message: 'insert error' })
    ;(mock.from as ReturnType<typeof vi.fn>).mockReturnValue(chain)

    const repo = new SupabasePreregistrationRepository()

    await expect(repo.create({
      schoolId: 'school-uuid',
      firstName: 'Test',
      lastName: 'User',
      curp: null,
      grado: null,
      parentName: 'Parent',
      parentPhone: '0000000000',
      parentEmail: null,
      relationship: 'padre',
      registeredBy: null,
    })).rejects.toThrow('Error al crear pre-registro')
  })
})
