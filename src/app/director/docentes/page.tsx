"use client"

import React, { useEffect, useState } from 'react'
import { SupabaseAuthService } from '@/infrastructure/supabase/services/SupabaseAuthService'
import { SupabaseSchoolService } from '@/infrastructure/supabase/services/SupabaseSchoolService'
import { SupabaseDirectorService } from '@/infrastructure/supabase/services/SupabaseDirectorService'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, MessageSquareText, Loader2, Users, Pencil, Trash2, Shapes } from 'lucide-react'
import { InvitationSender } from '@/components/shared/InvitationSender'
import { UserPasswordResetWidget } from '@/components/shared/UserPasswordResetWidget'
import { EditTeacherDialog } from '@/components/shared/EditTeacherDialog'
import { CreateGroupDialog } from '@/components/shared/CreateGroupDialog'

const authService = new SupabaseAuthService()
const schoolService = new SupabaseSchoolService()
const directorService = new SupabaseDirectorService()

export default function GestorDocentesPage() {
  const [schoolId, setSchoolId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [teachers, setTeachers] = useState<any[]>([])
  const [groups, setGroups] = useState<any[]>([])
  const [isListLoading, setIsListLoading] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState<any | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isSubstituting, setIsSubstituting] = useState(false)

  const [invitationData, setInvitationData] = useState<{
    tempPassword: string;
    username: string;
    loginIdentifier: string;
    loginUrl: string;
    teacherName: string;
  } | null>(null)

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
      const [teacherData, groupData] = await Promise.all([
        directorService.getTeachers(sid),
        directorService.getGroups(sid)
      ])
      setTeachers(teacherData)
      setGroups(groupData)
    } catch (err) {
      console.error(err)
    } finally {
      setIsListLoading(false)
    }
  }

  const sendWhatsApp = () => {
    if (!invitationData) return

    const message = `¡Hola! 👋 Te invito a la plataforma Escuelitaz como Docente.

Tus datos de acceso son:
👤 Usuario: ${invitationData.username}
🔑 Contraseña: ${invitationData.tempPassword}

Ingresa directamente aquí:
${invitationData.loginUrl}

(Deberás cambiar tu contraseña al entrar)`

    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${invitationData.loginIdentifier.replace(/\D/g, '')}?text=${encodedMessage}`
    
    window.open(whatsappUrl, '_blank')
  }

  const handleDeactivate = async (memberId: string) => {
    if (confirm('¿Estás seguro de desactivar a este docente? Perderá el acceso y se liberará su grupo.')) {
      try {
        await directorService.deactivateTeacher(memberId)
        if (schoolId) loadData(schoolId)
      } catch (err) {
        console.error(err)
      }
    }
  }

  const handleStartSubstitution = async (originalId: string) => {
    const substituteId = prompt('ID del Miembro Suplente (temporalmente manual):')
    if (!substituteId) return

    try {
      setIsSubstituting(true)
      await directorService.startSubstitution(originalId, substituteId)
      if (schoolId) loadData(schoolId)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsSubstituting(false)
    }
  }

  const handleEndSubstitution = async (originalId: string) => {
    if (confirm('¿Finalizar la suplantación y regresar el grupo al titular?')) {
      try {
        setIsSubstituting(true)
        await directorService.endSubstitution(originalId)
        if (schoolId) loadData(schoolId)
      } catch (err: any) {
        alert(err.message)
      } finally {
        setIsSubstituting(false)
      }
    }
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
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Docentes</h1>
          <p className="text-muted-foreground mt-1">Administra la plantilla docente de tu escuela e invítalos con asignación de grupo.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => loadData(schoolId)} disabled={isListLoading}>
           {isListLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : <Users className="h-4 w-4 mr-2"/>}
           Actualizar Lista
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Lado izquierdo: Enviar Invitación */}
        <div className="lg:col-span-4 space-y-4">
          {!invitationData ? (
             <InvitationSender 
               schoolId={schoolId} 
               invitedBy={userId} 
               allowedRoles={['docente']}
               groups={groups}
               onSuccess={(data) => {
                 setInvitationData({
                   ...data,
                   loginIdentifier: (data as any).phone || data.username, 
                   loginUrl: `${window.location.origin}/login?u=${encodeURIComponent(data.username)}`,
                   teacherName: 'Docente'
                 } as any)
                 loadData(schoolId)
               }}
             />
          ) : (
             <Card className="border-primary/20 shadow-md">
                <CardContent className="space-y-6 pt-6">
                  <div className="bg-primary/10 p-4 rounded-lg border border-primary/20 space-y-3 font-medium">
                     <div className="flex items-center gap-2 text-primary">
                        <CheckCircle2 className="h-5 w-5" />
                        <span>¡Registro exitoso!</span>
                     </div>
                     <div className="text-sm space-y-1 font-mono bg-background/50 p-3 rounded border border-primary/10">
                        <p>👤 Usuario: {invitationData.username}</p>
                        <p>🔑 Clave Temp: {invitationData.tempPassword}</p>
                     </div>
                  </div>

                  <Button className="w-full h-11 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold" onClick={sendWhatsApp}>
                    <MessageSquareText className="h-5 w-5 mr-2" />
                    Enviar WhatsApp a {invitationData.username}
                  </Button>

                  <Button variant="ghost" className="w-full text-xs" onClick={() => setInvitationData(null)}>
                    Registrar otro docente
                  </Button>
                </CardContent>
              </Card>
          )}

          {/* Widget de Reseteo de Contraseña */}
          <UserPasswordResetWidget targetRoleName="Docente" />
        </div>

        <div className="lg:col-span-8">
          <Card className="h-full border-muted/20 shadow-sm overflow-hidden">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <CardTitle className="text-lg flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Docentes Registrados
                </span>
                <div className="flex items-center gap-4">
                  <CreateGroupDialog 
                    schoolId={schoolId} 
                    onSuccess={() => loadData(schoolId)} 
                  />
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                     {teachers.length} Activos
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               {isListLoading ? (
                 <div className="p-20 flex flex-col items-center gap-4 text-muted-foreground italic">
                   <Loader2 className="h-8 w-8 animate-spin" />
                   Cargando plantilla docente...
                 </div>
               ) : teachers.length === 0 ? (
                 <div className="p-20 text-center text-muted-foreground flex flex-col items-center justify-center bg-muted/5">
                   <Users className="h-12 w-12 mb-3 opacity-10" />
                   <p className="text-sm font-medium">No hay docentes registrados aún.</p>
                   <p className="text-xs mt-1">Usa el formulario lateral para invitar a tu primer profesor.</p>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 divide-y divide-muted/10 max-h-[600px] overflow-y-auto">
                   {teachers.map((teacher, idx) => (
                      <div key={teacher.memberId} className={`p-5 flex items-center justify-between hover:bg-muted/5 transition-all border-l-4 ${teacher.substitutedById ? 'border-amber-400 bg-amber-50/30' : 'border-transparent hover:border-primary/40'}`}>
                        <div className="flex items-center gap-4">
                          <div className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg shadow-sm border ${teacher.isSubstitute ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-primary/10 text-primary border-primary/5'}`}>
                             {teacher.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                               <p className="font-bold text-foreground text-base leading-tight">{teacher.fullName}</p>
                               {teacher.isSubstitute && (
                                 <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Suplente</span>
                               )}
                               {teacher.substitutedById && (
                                 <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Suplantado</span>
                               )}
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                               <span className="flex items-center bg-muted/30 px-2 py-0.5 rounded"><Users className="w-3 h-3 mr-1.5"/> @{teacher.username}</span>
                               {teacher.specialty && (
                                 <span className="flex items-center text-primary/80 font-medium">✨ {teacher.specialty}</span>
                               )}
                               <span className="flex items-center"><Shapes className="w-3.5 h-3.5 mr-1.5 text-primary/60"/> Grupo: <strong className="ml-1 text-foreground">{teacher.group}</strong></span>
                               <span className="flex items-center"><Users className="w-3.5 h-3.5 mr-1.5 text-blue-500/60"/> Alumnos: <b className="ml-1 text-foreground px-1.5 bg-blue-50 rounded">{teacher.studentCount}</b></span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                           {!teacher.substitutedById && !teacher.isSubstitute && (
                             <Button 
                               disabled={isListLoading || isSubstituting}
                               variant="outline" 
                               size="sm"
                               className="h-8 text-[10px] font-bold uppercase"
                               onClick={() => handleStartSubstitution(teacher.memberId)}
                             >
                               Suplir
                             </Button>
                           )}
                           {teacher.substitutedById && (
                             <Button 
                               disabled={isListLoading || isSubstituting}
                               variant="secondary" 
                               size="sm"
                               className="h-8 text-[10px] font-bold uppercase bg-amber-100 text-amber-700 hover:bg-amber-200"
                               onClick={() => handleEndSubstitution(teacher.memberId)}
                             >
                               Finalizar
                             </Button>
                           )}
                           <Button 
                             disabled={isListLoading}
                             variant="ghost" 
                             size="icon" 
                             className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                             onClick={() => {
                               setEditingTeacher(teacher)
                               setIsEditDialogOpen(true)
                             }}
                           >
                              <Pencil className="h-4 w-4" />
                           </Button>
                           <Button 
                             disabled={isListLoading}
                             variant="ghost" 
                             size="icon" 
                             className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
                             onClick={() => handleDeactivate(teacher.memberId)}
                           >
                              <Trash2 className="h-4 w-4" />
                           </Button>
                        </div>
                      </div>
                   ))}
                 </div>
               )}
            </CardContent>
          </Card>
        </div>
      </div>

      <EditTeacherDialog 
        teacher={editingTeacher}
        schoolId={schoolId}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSuccess={() => schoolId && loadData(schoolId)}
      />
    </div>
  )
}
