'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SupabaseAuthService } from '@/infrastructure/supabase/services/SupabaseAuthService'
import { DirectorOnboarding } from '@/features/director/components/DirectorOnboarding'
import { PasswordResetRequestsWidget } from '@/features/director/components/PasswordResetRequestsWidget'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Loader2, Users, GraduationCap, Building2, BellRing,
  Settings, CalendarRange, MousePointerClick, RefreshCw, AlertCircle
} from 'lucide-react'
import { SupabaseDirectorService } from '@/infrastructure/supabase/services/SupabaseDirectorService'
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics'

const directorService = new SupabaseDirectorService()
const authService = new SupabaseAuthService()

export default function DirectorDashboard() {
  const router = useRouter()
  const [isOnboarding, setIsOnboarding] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [schoolInfo, setSchoolInfo] = useState<{ name: string } | null>(null)
  const [userId, setUserId] = useState<string>('')
  const [schoolId, setSchoolId] = useState<string>('')
  const [directorName, setDirectorName] = useState<string>('')

  // ✅ Consumo de métricas a través del hook (Clean Architecture)
  const { metrics, isLoading: metricsLoading, error: metricsError, refresh } = useDashboardMetrics(
    schoolId || null
  )

  useEffect(() => {
    const init = async () => {
      const profile = await authService.getCurrentUser()
      if (profile) {
        setUserId(profile.id)
        setDirectorName(profile.fullName || '')
        const membership = await directorService.getSchoolMembership(profile.id)
        if (membership) {
          setSchoolId(membership.school_id)
          setSchoolInfo({ name: membership.school_name })
        }
        if (!profile.onboardingCompleted || !membership) {
          setIsOnboarding(true)
        }
      }
      setIsInitializing(false)
    }
    init()
  }, [])

  if (isInitializing) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (isOnboarding) {
    return (
      <DirectorOnboarding
        userId={userId}
        schoolId={schoolId}
        directorName={directorName}
        onComplete={() => {
          setIsOnboarding(false)
          window.location.reload()
        }}
      />
    )
  }

  const activeCycle = metrics?.activeCycleName ?? 'Cargando ciclo...'

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Centro de Control</h1>
          <p className="text-muted-foreground flex items-center gap-2 mt-1">
            <Building2 className="w-4 h-4" /> {schoolInfo?.name} • {activeCycle}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={refresh} disabled={metricsLoading} aria-label="Actualizar métricas">
            <RefreshCw className={`w-4 h-4 ${metricsLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push('/settings')}>
            <Settings className="w-4 h-4 mr-2" /> Ajustes
          </Button>
        </div>
      </header>

      {/* Error de métricas */}
      {metricsError && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {metricsError}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          className="hover:shadow-md transition-shadow cursor-pointer border-t-4 border-t-primary"
          onClick={() => router.push('/director/alumnos')}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Alumnos Registrados</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <div className="text-2xl font-bold">{metrics?.totalStudents ?? '—'}</div>
            )}
            <p className="text-xs text-primary-600 mt-1 flex items-center gap-1">
              <MousePointerClick className="w-3 h-3" /> Ver Gestión de Alumnos
            </p>
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-md transition-shadow cursor-pointer border-t-4 border-t-blue-500"
          onClick={() => router.push('/director/docentes')}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Plantilla Docente</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <div className="text-2xl font-bold">{metrics?.totalTeachers ?? '—'}</div>
            )}
            <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
              <MousePointerClick className="w-3 h-3" /> Ver Gestión de Docentes
            </p>
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-md transition-shadow cursor-pointer border-t-4 border-t-orange-500"
          onClick={() => router.push('/director/alumnos')}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Solicitudes Pendientes</CardTitle>
            <BellRing className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <div className="text-2xl font-bold text-orange-600">{metrics?.pendingRequests ?? '—'}</div>
            )}
            <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
              <MousePointerClick className="w-3 h-3" /> Revisar Pre-registros
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <PasswordResetRequestsWidget schoolId={schoolId} />

        {/* Widget: Módulo SPF */}
        <Card className="bg-linear-to-br from-emerald-50 to-emerald-100/50 border-emerald-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-emerald-800 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Resumen Sociedad de Padres (SPF)
            </CardTitle>
            <CardDescription className="text-emerald-700/80">
              Vista general financiera y de comunicaciones.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white/80 p-4 rounded-md shadow-sm border border-emerald-100">
              <h3 className="text-sm font-semibold text-emerald-900 mb-2">Fondo Actual (Estimado)</h3>
              <p className="text-3xl font-bold text-emerald-700">
                $12,500.00 <span className="text-sm font-normal text-muted-foreground">MXN</span>
              </p>
              <p className="text-xs text-emerald-600 mt-1">+ Ingresos recientes: $1,200.00 esta semana</p>
            </div>
            <div className="bg-white/80 p-4 rounded-md shadow-sm border border-emerald-100">
              <h3 className="text-sm font-semibold text-emerald-900 mb-2 flex items-center gap-2">
                <CalendarRange className="w-4 h-4" /> Próxima Convocatoria
              </h3>
              <p className="font-medium">Asamblea General Ordinaria</p>
              <p className="text-sm text-muted-foreground">Viernes, 15 de Octubre - 10:00 AM</p>
            </div>
            <Button
              variant="outline"
              className="w-full border-emerald-300 text-emerald-800 hover:bg-emerald-100/50"
              onClick={() => router.push('/spf')}
            >
              Ir al Módulo SPF Completo
            </Button>
          </CardContent>
        </Card>

        {/* Acceso rápido */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Accesos Rápidos</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Button variant="secondary" className="h-24 flex-col gap-2" onClick={() => router.push('/director/alumnos')}>
              <Users className="w-6 h-6" />
              Gestión Alumnos
            </Button>
            <Button variant="secondary" className="h-24 flex-col gap-2" onClick={() => router.push('/director/docentes')}>
              <GraduationCap className="w-6 h-6" />
              Invitar Docente
            </Button>
            <Button variant="secondary" className="h-24 flex-col gap-2 text-muted-foreground" disabled>
              <CalendarRange className="w-6 h-6" />
              Agendar (Próximamente)
            </Button>
            <Button variant="secondary" className="h-24 flex-col gap-2" onClick={() => router.push('/settings')}>
              <Settings className="w-6 h-6" />
              Ajustes del Ciclo
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
