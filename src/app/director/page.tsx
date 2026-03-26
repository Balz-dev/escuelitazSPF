'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { SupabaseAuthService } from '@/infrastructure/supabase/services/SupabaseAuthService'
import { DirectorOnboarding } from '@/features/director/components/DirectorOnboarding'
import { PasswordResetRequestsWidget } from '@/features/director/components/PasswordResetRequestsWidget'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Loader2, Users, GraduationCap, Building2, CalendarRange,
  Settings, RefreshCw, AlertCircle
} from 'lucide-react'
import { SupabaseDirectorService } from '@/infrastructure/supabase/services/SupabaseDirectorService'
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics'
import { MetricsCard } from '@/components/dashboard/MetricsCard'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { useEntityPermissions } from '@/hooks/useEntityPermissions'
import { TeachersList } from '@/features/director/components/TeachersList'

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
  
  // Para Seguridd Guardian
  const [userRole, setUserRole] = useState<'director' | 'docente' | 'padre' | null>(null)

  // ✅ Consumo de métricas (Clean Architecture)
  const { metrics, isLoading: metricsLoading, error: metricsError, refresh } = useDashboardMetrics(
    schoolId || null
  )

  // ✅ Permisos (Seguridad Guardian)
  const studentPermissions = useMemo(() => 
    useEntityPermissions('student', userRole), 
    [userRole]
  )
  const teacherPermissions = useMemo(() => 
    useEntityPermissions('docente', userRole), 
    [userRole]
  )

  useEffect(() => {
    const init = async () => {
      const profile = await authService.getCurrentUser()
      if (profile) {
        setUserId(profile.id)
        setDirectorName(profile.fullName || '')
        // Para el Dashboard del Director, el rol principal es director.
        // En un futuro se puede obtener mapeando las membresías reales.
        setUserRole('director')

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
        <DashboardHeader 
          schoolName={schoolInfo?.name}
          activeCycle={activeCycle}
          directorName={directorName.split(' ')[0]} 
        />
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

      {/* KPIs - Usando MetricsCard modularizados */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricsCard 
          title="Alumnos Registrados"
          value={metrics?.totalStudents}
          icon={GraduationCap}
          isLoading={metricsLoading}
          className="border-t-primary"
          footerText={studentPermissions.canEdit ? "Ver Gestión de Alumnos" : "Ver Alumnos"}
          onClick={() => router.push('/director/alumnos')}
        />

        <MetricsCard 
          title="Plantilla Docente"
          value={metrics?.totalTeachers}
          icon={Users}
          isLoading={metricsLoading}
          className="border-t-blue-500"
          valueClassName="text-blue-700"
          footerText={teacherPermissions.canCreate ? "Ver Gestión de Docentes" : "Ver Docentes"}
          onClick={() => router.push('/director/docentes')}
        />

        <MetricsCard 
          title="Solicitudes Pendientes"
          value={metrics?.pendingRequests}
          icon={RefreshCw}
          isLoading={metricsLoading}
          className="border-t-orange-500"
          valueClassName="text-orange-600"
          footerText="Revisar Pre-registros"
          onClick={() => router.push('/director/alumnos')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 xl:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PasswordResetRequestsWidget schoolId={schoolId} />

            {/* Widget: Módulo SPF */}
            <Card className="bg-linear-to-br from-emerald-50 to-emerald-100/50 border-emerald-200 shadow-sm h-fit">
              <CardHeader className="pb-2">
                <CardTitle className="text-emerald-800 flex items-center gap-2 text-base">
                  <Building2 className="w-4 h-4" />
                  Resumen Padres (SPF)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-white/80 p-3 rounded-md shadow-sm border border-emerald-100">
                  <p className="text-xs font-semibold text-emerald-900 mb-1">Fondo Actual</p>
                  <p className="text-xl font-bold text-emerald-700">$12,500.00 <span className="text-[10px] font-normal text-muted-foreground ml-1">MXN</span></p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-emerald-300 text-emerald-800 hover:bg-emerald-100/50 text-xs h-8"
                  onClick={() => router.push('/spf')}
                >
                  Ir al Módulo SPF
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Acceso rápido - Segunda fila interna */}
          <Card className="shadow-sm border-muted/20">
            <CardHeader className="pb-3 border-b bg-muted/5">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Accesos Rápidos</CardTitle>
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Button variant="secondary" className="h-20 flex-col gap-1.5 text-xs" onClick={() => router.push('/director/alumnos')}>
                <Users className="w-5 h-5 text-primary" />
                Alumnos
              </Button>
              <Button variant="secondary" className="h-20 flex-col gap-1.5 text-xs" onClick={() => router.push('/director/docentes')}>
                <GraduationCap className="w-5 h-5 text-blue-500" />
                Docentes
              </Button>
              <Button variant="secondary" className="h-20 flex-col gap-1.5 text-xs text-muted-foreground" disabled>
                <CalendarRange className="w-5 h-5" />
                Eventos
              </Button>
              <Button variant="secondary" className="h-20 flex-col gap-1.5 text-xs" onClick={() => router.push('/settings')}>
                <Settings className="w-5 h-5 text-orange-500" />
                Ciclo
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* LISTADO DE DOCENTES (Side Panel on Large Screens) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          <TeachersList 
            schoolId={schoolId} 
            maxHeight="650px" 
            title="Vista de Docentes" 
            userId={userId}
          />
        </div>
      </div>
    </div>
  )
}
