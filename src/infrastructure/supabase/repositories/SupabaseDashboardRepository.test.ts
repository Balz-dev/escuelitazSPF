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
 * de queries de Supabase. Permite encadenamiento (.eq().eq()) y es awaitable.
 */
const makeChain = (resolution: any) => {
  const chain: any = {}
  const methods = ['select', 'eq', 'single', 'order', 'limit']
  methods.forEach((m) => {
    chain[m] = vi.fn().mockImplementation(() => chain)
  })
  // Hace que el objeto sea awaitable
  chain.then = (onRes: any, onRej: any) => Promise.resolve(resolution).then(onRes, onRej)
  return chain
}

const makeCountChain = (count: number | null, error: any = null) => makeChain({ count, error })
const makeSingleChain = (data: any, error: any = null) => makeChain({ data, error })

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
