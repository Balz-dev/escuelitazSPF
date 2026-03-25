import { IDashboardService } from '@/core/application/ports/IDashboardService'
import { IDashboardRepository } from '@/core/application/ports/IDashboardRepository'
import { DashboardMetrics } from '@/core/domain/entities/DashboardMetrics'

/**
 * Implementación del servicio de Dashboard del Director.
 * Orquesta la lógica de negocio delegando al repositorio.
 * Capa: Infraestructura / Servicio de Aplicación
 */
export class DashboardService implements IDashboardService {
  constructor(private readonly repository: IDashboardRepository) {}

  async getDashboardMetrics(schoolId: string): Promise<DashboardMetrics> {
    if (!schoolId) {
      throw new Error('Se requiere un ID de escuela válido para cargar el dashboard.')
    }
    return this.repository.getMetrics(schoolId)
  }
}
