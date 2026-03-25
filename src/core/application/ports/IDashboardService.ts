import { DashboardMetrics } from '../../domain/entities/DashboardMetrics';

/**
 * Puerto de Servicio para interactuar con las lógicas del Dashboard.
 * Capa: Application
 */
export interface IDashboardService {
  /**
   * Orquesta la obtención de métricas para el dashboard de director.
   * @param schoolId ID de la escuela.
   */
  getDashboardMetrics(schoolId: string): Promise<DashboardMetrics>;
}
