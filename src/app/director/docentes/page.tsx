"use client"

import React, { useEffect, useState } from 'react'
import { SupabaseAuthService } from '@/infrastructure/supabase/services/SupabaseAuthService'
import { SupabaseSchoolService } from '@/infrastructure/supabase/services/SupabaseSchoolService'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, MessageSquareText, Loader2, Users } from 'lucide-react'
import { InvitationSender } from '@/components/shared/InvitationSender'
import { UserPasswordResetWidget } from '@/components/shared/UserPasswordResetWidget'

const authService = new SupabaseAuthService()
const schoolService = new SupabaseSchoolService()

export default function GestorDocentesPage() {
  const [schoolId, setSchoolId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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
      }
      setIsLoading(false)
    }
    init()
  }, [])

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
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Docentes</h1>
        <p className="text-muted-foreground">Administra la plantilla docente de tu escuela e invítalos a la plataforma.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Lado izquierdo: Enviar Invitación */}
        <div className="md:col-span-5 space-y-4">
          {!invitationData ? (
             <InvitationSender 
               schoolId={schoolId} 
               invitedBy={userId} 
               allowedRoles={['docente']}
               onSuccess={(data) => {
                 setInvitationData({
                   ...data,
                   loginIdentifier: data.username, // temporal as we sent emailOrPhone basically 
                   loginUrl: `${window.location.origin}/login?u=${encodeURIComponent(data.username)}`,
                   teacherName: 'Docente'
                 } as any)
               }}
             />
          ) : (
             <Card className="border-primary/20 shadow-md">
                <CardContent className="space-y-6 pt-6">
                  <div className="bg-primary/10 p-4 rounded-lg border border-primary/20 space-y-3">
                     <div className="flex items-center gap-2 text-primary font-bold">
                        <CheckCircle2 className="h-5 w-5" />
                        <span>¡Registro exitoso!</span>
                     </div>
                     <div className="text-sm space-y-1 font-mono bg-background/50 p-2 rounded">
                        <p>Usuario Sugerido: {invitationData.username}</p>
                        <p>Clave Temporal: {invitationData.tempPassword}</p>
                     </div>
                  </div>

                  <Button className="w-full h-12 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold" onClick={sendWhatsApp}>
                    <MessageSquareText className="h-5 w-5 mr-2" />
                    Enviar WhatsApp de Invitación
                  </Button>

                  <Button variant="ghost" className="w-full text-xs" onClick={() => setInvitationData(null)}>
                    Invitar a otro docente
                  </Button>
                </CardContent>
              </Card>
          )}

          {/* Widget de Reseteo de Contraseña */}
          <UserPasswordResetWidget targetRoleName="Docente" />
        </div>

        {/* Lado derecho: Lista de Docentes */}
        <div className="md:col-span-7">
          <Card className="h-full">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Docentes Registrados
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               {/* PENDIENTE: Integrar lista real fetching de profiles + school_members */}
               <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center">
                 <Users className="h-10 w-10 mb-3 opacity-20" />
                 <p className="text-sm">Próximamente: Lista de docentes activos con estado de perfil (pendiente/completo).</p>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
