import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SupabaseConvocatoriaRepository } from '@/infrastructure/supabase/repositories/SupabaseConvocatoriaRepository'

vi.mock('@/infrastructure/supabase/client', () => ({
  createClient: () => ({
    from: vi.fn(),
  }),
}))

const baseRaw = {
  id: 'conv-uuid',
  school_id: 'school-uuid',
  created_by: 'director-uuid',
  title: 'Formación SPF 2026',
  description: 'Convocatoria de integración',
  type: 'formacion_spf',
  status: 'borrador',
  expires_at: null,
  published_at: null,
  created_at: '2026-03-19T10:00:00Z',
  updated_at: '2026-03-19T10:00:00Z',
}

const makeMockChain = (data: unknown, error: unknown = null) => {
  const chain: Record<string, unknown> = {}
  const methods = ['from', 'select', 'insert', 'update', 'delete', 'eq', 'order', 'single']
  methods.forEach(m => { chain[m] = vi.fn().mockReturnValue(chain) })
  ;(chain.single as ReturnType<typeof vi.fn>).mockResolvedValue({ data, error })
  ;(chain.order as ReturnType<typeof vi.fn>).mockResolvedValue({ data: Array.isArray(data) ? data : [data], error })
  return chain
}

describe('SupabaseConvocatoriaRepository', () => {
  it('mapToDomain — convierte correctamente los campos', async () => {
    const { createClient } = await import('@/infrastructure/supabase/client')
    const mock = createClient()
    const chain = makeMockChain([baseRaw])
    ;(mock.from as ReturnType<typeof vi.fn>).mockReturnValue(chain)

    const repo = new SupabaseConvocatoriaRepository()
    const results = await repo.getBySchool('school-uuid')

    expect(results).toHaveLength(1)
    expect(results[0].id).toBe('conv-uuid')
    expect(results[0].title).toBe('Formación SPF 2026')
    expect(results[0].type).toBe('formacion_spf')
    expect(results[0].status).toBe('borrador')
    expect(results[0].expiresAt).toBeNull()
    expect(results[0].createdAt).toBeInstanceOf(Date)
  })

  it('publish — actualiza status a activa y publishedAt a now', async () => {
    const published = { ...baseRaw, status: 'activa', published_at: new Date().toISOString() }
    const { createClient } = await import('@/infrastructure/supabase/client')
    const mock = createClient()
    const chain = makeMockChain(published)
    ;(mock.from as ReturnType<typeof vi.fn>).mockReturnValue(chain)

    const repo = new SupabaseConvocatoriaRepository()
    const result = await repo.publish('conv-uuid')

    expect(result.status).toBe('activa')
    expect(result.publishedAt).toBeInstanceOf(Date)
  })

  it('close — actualiza status a cerrada', async () => {
    const closed = { ...baseRaw, status: 'cerrada' }
    const { createClient } = await import('@/infrastructure/supabase/client')
    const mock = createClient()
    const chain = makeMockChain(closed)
    ;(mock.from as ReturnType<typeof vi.fn>).mockReturnValue(chain)

    const repo = new SupabaseConvocatoriaRepository()
    const result = await repo.close('conv-uuid')

    expect(result.status).toBe('cerrada')
  })
})
