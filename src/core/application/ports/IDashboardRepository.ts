import { DashboardMetrics } from '../../domain/entities/DashboardMetrics';

/**
 * Puerto de Infraestructura para el acceso a datos del Dashboard.
 * Capa: Application
 */
export interface IDashboardRepository {
  /**
   * Obtiene las métricas generales del dashboard para una escuela y ciclo activos.
   * @param schoolId El ID de la escuela
   */
  getMetrics(schoolId: string): Promise<DashboardMetrics>;
}
