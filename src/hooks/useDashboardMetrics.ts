'use client'

import { useState, useEffect, useCallback } from 'react'
import { DashboardMetrics } from '@/core/domain/entities/DashboardMetrics'
import { IDashboardService } from '@/core/application/ports/IDashboardService'
import { SupabaseDashboardRepository } from '@/infrastructure/supabase/repositories/SupabaseDashboardRepository'
import { DashboardService } from '@/infrastructure/supabase/services/DashboardService'

// Instanciación del servicio vía puerto (Clean Architecture)
const dashboardService: IDashboardService = new DashboardService(
  new SupabaseDashboardRepository()
)

interface UseDashboardMetricsResult {
  metrics: DashboardMetrics | null
  isLoading: boolean
  error: string | null
  refresh: () => void
}

/**
 * Hook de UI que provee métricas del dashboard al Director.
 * No contiene lógica de negocio — delega completamente al IDashboardService.
 */
export function useDashboardMetrics(schoolId: string | null): UseDashboardMetricsResult {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!schoolId) return

    setIsLoading(true)
    setError(null)
    try {
      const data = await dashboardService.getDashboardMetrics(schoolId)
      setMetrics(data)
    } catch (err) {
      console.error('[useDashboardMetrics] Error:', err)
      setError('No se pudieron cargar las métricas. Intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }, [schoolId])

  useEffect(() => {
    load()
  }, [load])

  return { metrics, isLoading, error, refresh: load }
}
