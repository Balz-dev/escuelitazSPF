import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DashboardService } from '@/infrastructure/supabase/services/DashboardService'
import { IDashboardRepository } from '@/core/application/ports/IDashboardRepository'
import { DashboardMetrics } from '@/core/domain/entities/DashboardMetrics'

const mockMetrics: DashboardMetrics = {
  totalStudents: 120,
  activeStudents: 120,
  totalTeachers: 8,
  activeCycleName: 'Ciclo Escolar 2025–2026',
  pendingRequests: 3,
}

const mockRepository: IDashboardRepository = {
  getMetrics: vi.fn().mockResolvedValue(mockMetrics),
}

describe('DashboardService', () => {
  let service: DashboardService

  beforeEach(() => {
    vi.clearAllMocks()
    service = new DashboardService(mockRepository)
  })

  it('getDashboardMetrics — retorna las métricas del repositorio', async () => {
    const result = await service.getDashboardMetrics('school-uuid-1')
    expect(result).toEqual(mockMetrics)
    expect(mockRepository.getMetrics).toHaveBeenCalledWith('school-uuid-1')
    expect(mockRepository.getMetrics).toHaveBeenCalledTimes(1)
  })

  it('getDashboardMetrics — lanza error si schoolId está vacío', async () => {
    await expect(service.getDashboardMetrics('')).rejects.toThrow(
      'Se requiere un ID de escuela válido para cargar el dashboard.'
    )
    expect(mockRepository.getMetrics).not.toHaveBeenCalled()
  })

  it('getDashboardMetrics — propaga error del repositorio', async () => {
    vi.mocked(mockRepository.getMetrics).mockRejectedValueOnce(
      new Error('Error de base de datos')
    )
    await expect(service.getDashboardMetrics('school-uuid-1')).rejects.toThrow(
      'Error de base de datos'
    )
  })
})
