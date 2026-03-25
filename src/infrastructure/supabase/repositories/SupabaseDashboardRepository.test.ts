import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SupabaseDashboardRepository } from '@/infrastructure/supabase/repositories/SupabaseDashboardRepository'

// Mock del cliente Supabase usando vi.hoisted para compatibilidad con Vitest
const mockFrom = vi.hoisted(() => vi.fn())
vi.mock('@/infrastructure/supabase/client', () => ({
  createClient: () => ({
    from: mockFrom,
  }),
}))

/**
 * Helper que construye una cadena de mock compatible con el patrón
 * de queries de Supabase retornadas por SupabaseDashboardRepository.
 * Para consultas con count, resuelve con { count, error }.
 * Para .single(), resuelve con { data, error }.
 */
const makeCountChain = (count: number | null, error: unknown = null) => {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {}
  const methods = ['select', 'eq', 'single']
  methods.forEach((m) => {
    chain[m] = vi.fn().mockReturnValue(chain)
  })
  // La cadena resuelve su promesa al llamarla (es awaitable)
  // Aquí simulamos la resolución del Promise.all
  Object.defineProperty(chain, Symbol.iterator, { value: undefined })
  // mockResolvedValue para el caso count (select con head:true)
  ;(chain.eq as ReturnType<typeof vi.fn>).mockResolvedValue({ count, error })
  return chain
}

const makeSingleChain = (data: unknown, error: unknown = null) => {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {}
  const methods = ['select', 'eq', 'single']
  methods.forEach((m) => {
    chain[m] = vi.fn().mockReturnValue(chain)
  })
  ;(chain.single as ReturnType<typeof vi.fn>).mockResolvedValue({ data, error })
  return chain
}

describe('SupabaseDashboardRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getMetrics — retorna métricas correctas cuando no hay errores', async () => {
    const schoolData = {
      name: 'Escuela Primaria Belisario',
      subscription_status: 'active',
      trial_ends_at: null,
    }

    // mockFrom devuelve la cadena apropiada según la tabla consultada
    mockFrom.mockImplementation((table: string) => {
      if (table === 'students') return makeCountChain(120)
      if (table === 'school_members') return makeCountChain(8)
      if (table === 'student_preregistrations') return makeCountChain(3)
      if (table === 'schools') return makeSingleChain(schoolData)
      return makeCountChain(0)
    })

    const repo = new SupabaseDashboardRepository()
    const metrics = await repo.getMetrics('school-uuid-1')

    expect(metrics.totalStudents).toBe(120)
    expect(metrics.totalTeachers).toBe(8)
    expect(metrics.pendingRequests).toBe(3)
    expect(metrics.activeCycleName).toContain('Ciclo Escolar')
  })

  it('getMetrics — lanza error si la consulta de escuela falla', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'students') return makeCountChain(0)
      if (table === 'school_members') return makeCountChain(0)
      if (table === 'student_preregistrations') return makeCountChain(0)
      if (table === 'schools')
        return makeSingleChain(null, { message: 'School not found' })
      return makeCountChain(0)
    })

    const repo = new SupabaseDashboardRepository()
    await expect(repo.getMetrics('invalid-id')).rejects.toThrow(
      'Error al obtener datos de la escuela'
    )
  })

  it('getMetrics — activeCycleName muestra período de prueba correctamente', async () => {
    const trialEnd = new Date()
    trialEnd.setFullYear(trialEnd.getFullYear() + 1)

    const schoolData = {
      name: 'Escuela Test',
      subscription_status: 'trial',
      trial_ends_at: trialEnd.toISOString(),
    }

    mockFrom.mockImplementation((table: string) => {
      if (table === 'students') return makeCountChain(10)
      if (table === 'school_members') return makeCountChain(2)
      if (table === 'student_preregistrations') return makeCountChain(0)
      if (table === 'schools') return makeSingleChain(schoolData)
      return makeCountChain(0)
    })

    const repo = new SupabaseDashboardRepository()
    const metrics = await repo.getMetrics('school-trial-id')

    expect(metrics.activeCycleName).toContain('Período de Prueba')
  })

  it('getMetrics — maneja conteos nulos con cero por defecto', async () => {
    const schoolData = {
      name: 'Escuela Vacía',
      subscription_status: 'active',
      trial_ends_at: null,
    }

    mockFrom.mockImplementation((table: string) => {
      if (table === 'students') return makeCountChain(null)
      if (table === 'school_members') return makeCountChain(null)
      if (table === 'student_preregistrations') return makeCountChain(null)
      if (table === 'schools') return makeSingleChain(schoolData)
      return makeCountChain(null)
    })

    const repo = new SupabaseDashboardRepository()
    const metrics = await repo.getMetrics('school-empty-id')

    expect(metrics.totalStudents).toBe(0)
    expect(metrics.totalTeachers).toBe(0)
    expect(metrics.pendingRequests).toBe(0)
  })
})
