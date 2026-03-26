"use client"

import React, { useEffect, useState } from 'react'
import { SupabaseAuthService } from '@/infrastructure/supabase/services/SupabaseAuthService'
import { SupabaseSchoolService } from '@/infrastructure/supabase/services/SupabaseSchoolService'
import { SupabaseDirectorService } from '@/infrastructure/supabase/services/SupabaseDirectorService'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, MessageSquareText, Loader2, Users, Info } from 'lucide-react'
import { InvitationSender } from '@/components/shared/InvitationSender'
import { UserPasswordResetWidget } from '@/components/shared/UserPasswordResetWidget'
import { TeachersList } from '@/features/director/components/TeachersList'
import { Group } from '@/core/domain/entities/Group'

const authService = new SupabaseAuthService()
const schoolService = new SupabaseSchoolService()
const directorService = new SupabaseDirectorService()

export default function GestorDocentesPage() {
  const [schoolId, setSchoolId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [groups, setGroups] = useState<Group[]>([])
  const [isListLoading, setIsListLoading] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    const init = async () => {
      const user = await authService.getCurrentUser()
      if (user) {
        setUserId(user.id)
        const activeSchoolId = await schoolService.getActiveSchoolId(user.id)
        setSchoolId(activeSchoolId)
        if (activeSchoolId) {
          loadData(activeSchoolId)
        }
      }
      setIsLoading(false)
    }
    init()
  }, [])

  const loadData = async (sid: string) => {
    setIsListLoading(true)
    try {
      const groupData = await directorService.getGroups(sid)
      setGroups(groupData)
    } catch (err) {
      console.error(err)
    } finally {
      setIsListLoading(false)
    }
  }

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  if (!schoolId || !userId) {
    return <div className="p-6 text-center text-muted-foreground">No se encontró la escuela activa.</div>
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Registro de Docentes</h1>
          <p className="text-muted-foreground mt-1">Administra la plantilla docente de tu escuela, registra nuevos profesores y asigna sus grupos correspondientes.</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isListLoading}>
          {isListLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Users className="h-4 w-4 mr-2" />}
          Actualizar Lista
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Lado izquierdo: Enviar Invitación */}
        <div className="lg:col-span-4 space-y-4">
          <InvitationSender
            schoolId={schoolId}
            invitedBy={userId}
            allowedRoles={['docente']}
            groups={groups}
            onSuccess={handleRefresh}
          />

          {/* Widget de Reseteo de Contraseña */}
          <UserPasswordResetWidget targetRoleName="Docente" />
        </div>

        <div className="lg:col-span-8 Docentes-registrados">
          <TeachersList 
            key={refreshTrigger}
            schoolId={schoolId} 
            userId={userId || ''}
          />
        </div>
      </div>
    </div>
  )
}
