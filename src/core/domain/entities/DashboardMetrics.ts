/**
 * Representa las métricas principales para el panel del Director.
 * Capa: Domain
 */
export interface DashboardMetrics {
  totalStudents: number;
  activeStudents: number;
  totalTeachers: number;
  activeCycleName: string | null;
  activeCycleId?: string;
  pendingRequests: number;
}
