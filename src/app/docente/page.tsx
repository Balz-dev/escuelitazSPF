'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCurrentTeacher } from '@/hooks/useCurrentTeacher'
import { useDocenteDashboard } from '@/hooks/useDocenteDashboard'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { MetricsCard } from '@/components/dashboard/MetricsCard'
import { UserPasswordResetWidget } from '@/components/shared/UserPasswordResetWidget'
import { 
  Loader2, 
  Users, 
  ClipboardCheck, 
  Settings, 
  RefreshCw, 
  AlertCircle,
  GraduationCap,
  CalendarDays
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { SupabaseAuthService } from '@/infrastructure/supabase/services/SupabaseAuthService'

const authService = new SupabaseAuthService()

/**
 * Dashboard principal para el rol de Docente.
 * Muestra métricas del grupo asignado y accesos rápidos a tareas comunes.
 */
export default function DocenteDashboard() {
  const router = useRouter()
  const { teacher, isLoading: teacherLoading, error: teacherError } = useCurrentTeacher()
  const [userName, setUserName] = useState<string>('')

  useEffect(() => {
    authService.getCurrentUser().then(user => {
      if (user) {
        setUserName(user.fullName || '')
      }
    })
  }, [])

  const { stats, isLoading: statsLoading, error: statsError, refresh } = useDocenteDashboard(
    teacher?.schoolId,
    teacher?.groupId
  )

  if (teacherLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (teacherError) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg flex items-center gap-3">
          <AlertCircle className="h-5 w-5" />
          <p>{teacherError}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <DashboardHeader 
          schoolName={teacher?.schoolName || 'Cargando escuela...'}
          activeCycle={stats?.cicloActivo || 'Cargando ciclo...'}
          userName={userName.split(' ')[0]} 
        />
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={refresh} disabled={statsLoading} aria-label="Actualizar estadísticas">
            <RefreshCw className={`w-4 h-4 ${statsLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push('/docente/perfil')}>
            <Settings className="w-4 h-4 mr-2" /> Mi Perfil
          </Button>
        </div>
      </header>

      {/* Alerta si no tiene grupo asignado */}
      {!teacher?.groupId && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <div>
            <p className="font-semibold">Sin grupo asignado</p>
            <p className="text-sm">Contacte al director para que le asigne un grupo y pueda gestionar sus alumnos.</p>
          </div>
        </div>
      )}

      {/* Error de estadísticas */}
      {statsError && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-center gap-2 text-sm">
          <AlertCircle className="w-4 h-4" />
          {statsError}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MetricsCard 
          title="Mi Grupo"
          value={teacher?.groupName || 'Sin grupo'}
          icon={Users}
          isLoading={statsLoading}
          className="border-t-primary"
          footerText={teacher?.groupId ? `Total: ${stats?.alumnosEnGrupo} alumnos` : "Gestión de alumnos"}
          onClick={() => router.push('/docente/alumnos')}
        />

        <MetricsCard 
          title="Pre-registros del Grado"
          value={stats?.preRegistrosPendientes}
          icon={ClipboardCheck}
          isLoading={statsLoading}
          className="border-t-orange-500"
          valueClassName="text-orange-600"
          footerText="Validar solicitudes pendientes"
          onClick={() => router.push('/docente/alumnos?tab=preregistrations')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-12 space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Widget: Reinicio de contraseñas de alumnos/padres */}
              <div className="h-full">
                <UserPasswordResetWidget 
                  targetRoleName="Alumnos o Padres" 
                />
              </div>
              
              {/* Widget: Accesos Rápidos */}
              <Card className="shadow-sm border-muted/20">
                <CardHeader className="pb-3 border-b bg-muted/5">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    Accesos Rápidos
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 grid grid-cols-2 gap-4">
                  <Button 
                    variant="secondary" 
                    className="h-24 flex-col gap-2 hover:bg-primary/5 hover:text-primary transition-colors" 
                    onClick={() => router.push('/docente/alumnos')}
                    disabled={!teacher?.groupId}
                  >
                    <Users className="w-6 h-6 text-primary" />
                    <span className="text-sm font-medium">Lista de Alumnos</span>
                  </Button>
                  <Button 
                    variant="secondary" 
                    className="h-24 flex-col gap-2 hover:bg-blue-50 hover:text-blue-700 transition-colors" 
                    onClick={() => router.push('/docente/clases')}
                    disabled
                  >
                    <CalendarDays className="w-6 h-6 text-blue-500" />
                    <span className="text-sm font-medium">Calendario</span>
                    <span className="text-[10px] text-muted-foreground">Próximamente</span>
                  </Button>
                </CardContent>
              </Card>
           </div>
        </div>
      </div>
    </div>
  )
}
