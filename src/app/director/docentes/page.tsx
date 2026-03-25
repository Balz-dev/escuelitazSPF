"use client"

import React, { useEffect, useState } from 'react'
import { SupabaseAuthService } from '@/infrastructure/supabase/services/SupabaseAuthService'
import { SupabaseSchoolService } from '@/infrastructure/supabase/services/SupabaseSchoolService'
import { SupabaseDirectorService } from '@/infrastructure/supabase/services/SupabaseDirectorService'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, MessageSquareText, Loader2, Users } from 'lucide-react'
import { InvitationSender } from '@/components/shared/InvitationSender'
import { UserPasswordResetWidget } from '@/components/shared/UserPasswordResetWidget'

const authService = new SupabaseAuthService()
const schoolService = new SupabaseSchoolService()
const directorService = new SupabaseDirectorService()

export default function GestorDocentesPage() {
  const [schoolId, setSchoolId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [teachers, setTeachers] = useState<any[]>([])
  const [isListLoading, setIsListLoading] = useState(false)

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
          loadTeachers(activeSchoolId)
        }
      }
      setIsLoading(false)
    }
    init()
  }, [])

  const loadTeachers = async (sid: string) => {
    setIsListLoading(true)
    try {
      const data = await directorService.getTeachers(sid)
      setTeachers(data)
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
          <p className="text-muted-foreground mt-1">Administra la plantilla docente de tu escuela e invítalos a la plataforma.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => loadTeachers(schoolId)} disabled={isListLoading}>
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
               onSuccess={(data) => {
                 setInvitationData({
                   ...data,
                   loginIdentifier: (data as any).phone || data.username, 
                   loginUrl: `${window.location.origin}/login?u=${encodeURIComponent(data.username)}`,
                   teacherName: 'Docente'
                 } as any)
                 loadTeachers(schoolId)
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

        {/* Lado derecho: Lista de Docentes */}
        <div className="lg:col-span-8">
          <Card className="h-full border-muted/20 shadow-sm overflow-hidden">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <CardTitle className="text-lg flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Docentes Registrados en la Escuela
                </span>
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                   {teachers.length} Activos
                </span>
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
                      <div key={teacher.memberId} className="p-4 flex items-center justify-between hover:bg-muted/10 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                             {teacher.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{teacher.fullName}</p>
                            <div className="flex gap-4 text-xs text-muted-foreground mt-0.5">
                               <span className="flex items-center"><Users className="w-3 h-3 mr-1"/> Usuario: {teacher.username}</span>
                               {teacher.phone && <span className="flex items-center"><MessageSquareText className="w-3 h-3 mr-1"/> {teacher.phone}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Activo</span>
                        </div>
                      </div>
                   ))}
                 </div>
               )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
