"use client"

import React from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Save, Loader2, CheckCircle2, User, Phone, MessageSquareText } from 'lucide-react'
import { SupabaseAuthService } from '@/infrastructure/supabase/services/SupabaseAuthService'

const authService = new SupabaseAuthService()

export default function RegisterStudentPage() {
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [invitationData, setInvitationData] = React.useState<{
    tempPassword: string;
    username: string;
    loginIdentifier: string;
    loginUrl: string;
    parentName: string;
    studentName: string;
    parentContact: string;
  } | null>(null)
  
  const [studentName, setStudentName] = React.useState('')
  const [grade, setGrade] = React.useState('')
  const [group, setGroup] = React.useState('')
  const [parentName, setParentName] = React.useState('')
  const [parentContact, setParentContact] = React.useState('')

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setInvitationData(null)

    try {
      const schoolId = '00000000-0000-0000-0000-000000000000' 
      
      const result = await authService.inviteMember(parentContact, schoolId, 'padre', {
        full_name: parentName,
        student_name: studentName,
        grade,
        group
      })

      setInvitationData({
        tempPassword: result.tempPassword,
        username: result.username,
        loginIdentifier: result.loginIdentifier,
        loginUrl: `${result.loginUrl}?email=${encodeURIComponent(result.loginIdentifier)}`,
        parentName,
        studentName,
        parentContact
      })

      setStudentName('')
      setGrade('')
      setGroup('')
      setParentName('')
      setParentContact('')
    } catch (err: any) {
      setError(err.message || 'Error al guardar el registro')
    } finally {
      setIsLoading(false)
    }
  }

  const sendWhatsApp = () => {
    if (!invitationData) return

    const message = `¡Hola ${invitationData.parentName}! 👋 Soy el docente de ${invitationData.studentName}. Te invito a la plataforma escolar.

Tus datos para acceder son:
👤 Usuario: ${invitationData.username}
🔑 Contraseña: ${invitationData.tempPassword}

Accede aquí para entrar al instante:
${invitationData.loginUrl}`

    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${invitationData.parentContact.replace(/\D/g, '')}?text=${encodedMessage}`
    
    window.open(whatsappUrl, '_blank')
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Registro de Alumno y Padre</h1>
        <p className="text-muted-foreground">Captura datos y genera la invitación de WhatsApp.</p>
      </header>

      {!invitationData ? (
        <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><User className="h-5 w-5 text-primary" /> Datos del Alumno</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2"><Label htmlFor="sname">Nombre del Alumno</Label><Input id="sname" placeholder="Ej. Luis Ramírez" value={studentName} onChange={(e) => setStudentName(e.target.value)} required disabled={isLoading} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label htmlFor="grade">Grado</Label><Input id="grade" placeholder="1º, 2º..." value={grade} onChange={(e) => setGrade(e.target.value)} required disabled={isLoading} /></div>
                  <div className="space-y-2"><Label htmlFor="group">Grupo</Label><Input id="group" placeholder="A, B, C..." value={group} onChange={(e) => setGroup(e.target.value)} required disabled={isLoading} /></div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card className="border-primary/20 bg-primary/5"><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Phone className="h-5 w-5 text-primary" /> Vincular Padre / Tutor</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2"><Label htmlFor="pname">Nombre del Padre / Tutor</Label><Input id="pname" placeholder="Ej. María López" value={parentName} onChange={(e) => setParentName(e.target.value)} required disabled={isLoading} /></div>
                <div className="space-y-2"><Label htmlFor="pcontact">WhatsApp del Tutor</Label><Input id="pcontact" placeholder="+52..." value={parentContact} onChange={(e) => setParentContact(e.target.value)} required disabled={isLoading} /></div>
                <div className="pt-4"><Button className="w-full h-12" type="submit" disabled={isLoading}>{isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />} Registrar y Preparar WhatsApp</Button></div>
                {error && <div className="bg-destructive/10 text-destructive p-3 rounded-md text-xs">{error}</div>}
              </CardContent>
            </Card>
          </div>
        </form>
      ) : (
        <Card className="max-w-md mx-auto border-primary/20 shadow-xl">
          <div className="bg-primary/10 p-6 text-center">
            <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-2" />
            <h3 className="font-bold text-xl">¡Registro Exitoso!</h3>
            <p className="text-sm text-muted-foreground mt-1">Cuentas creadas para {invitationData.parentName} y su hijo.</p>
          </div>
          <CardContent className="p-6 space-y-6">
             <div className="bg-muted p-4 rounded-md text-xs font-mono space-y-1">
                <p>Usuario: {invitationData.username}</p>
                <p>Clave: {invitationData.tempPassword}</p>
             </div>
             <Button className="w-full h-16 bg-[#25D366] hover:bg-[#20ba5a] text-white text-lg font-bold" onClick={sendWhatsApp}>
                <MessageSquareText className="h-6 w-6 mr-2" />
                Enviar WhatsApp al Padre
             </Button>
             <Button variant="ghost" className="w-full text-xs" onClick={() => setInvitationData(null)}>Registrar otro alumno</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
