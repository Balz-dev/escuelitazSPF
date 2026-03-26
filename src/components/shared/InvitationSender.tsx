'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Send, CheckCircle2, User, Key, ExternalLink } from 'lucide-react'
import { Database } from '@/infrastructure/supabase/database.types'
import { useInvitation } from '@/hooks/useInvitation'

type Role = Database['public']['Enums']['member_role']
type SubRole = Database['public']['Enums']['member_sub_role']

interface InvitationSenderProps {
  schoolId: string
  invitedBy: string
  allowedRoles: Role[]
  groups?: any[]
  onSuccess?: (credentials: { tempPassword: string; username: string }) => void
  hideCard?: boolean
}

export function InvitationSender({ schoolId, invitedBy, allowedRoles, groups = [], onSuccess, hideCard = false }: InvitationSenderProps) {
  const { inviteMember, isInviting, error: inviteError } = useInvitation()
  const [formData, setFormData] = useState({
    fullName: '',
    emailOrPhone: '',
    role: allowedRoles[0] || 'docente',
    subRole: 'ninguno' as SubRole | 'ninguno',
    specialty: '',
    grade: '',
    section: ''
  })
  const [localError, setLocalError] = useState('')
  const [invitationResult, setInvitationResult] = useState<{ tempPassword: string; username: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError('')

    try {
      const result = await inviteMember({
        emailOrPhone: formData.emailOrPhone,
        fullName: formData.fullName,
        role: formData.role as any,
        schoolId,
        invitedBy, // Nuevo
        subRole: formData.subRole === 'ninguno' ? null : formData.subRole,
        specialty: formData.role === 'docente' ? formData.specialty : undefined,
        grade: formData.grade || undefined,
        section: formData.section || undefined,
      });

      if (result) {
        setInvitationResult(result);
        if (onSuccess) {
          onSuccess(result);
        }
      }
    } catch (err: any) {
      console.error('Error in handleSubmit:', err);
      setLocalError(err.message || 'Error inesperado al enviar la invitación');
    }
  }

  const handleWhatsApp = () => {
    if (!invitationResult) return
    const message = `¡Hola ${formData.fullName}! Te damos la bienvenida a Escuelitaz. Tu cuenta ha sido creada.\n\nUsuario: ${invitationResult.username}\nContraseña Temporal: ${invitationResult.tempPassword}\n\nAccede aquí: ${window.location.origin}/login`
    const url = `https://wa.me/52${formData.emailOrPhone}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  const errorMsg = localError || inviteError

  if (invitationResult) {
    return (
      <div className="space-y-6 py-4">
        <div className="flex flex-col items-center justify-center text-center space-y-2">
          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-foreground">¡Registro Exitoso!</h3>
          <p className="text-sm text-muted-foreground">La cuenta ha sido generada correctamente</p>
        </div>

        <div className="bg-muted/50 rounded-xl p-4 border space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Usuario</span>
            </div>
            <span className="font-mono font-medium text-foreground">{invitationResult.username}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Key className="h-4 w-4" />
              <span>Contraseña Temporal</span>
            </div>
            <span className="font-mono font-medium text-primary">{invitationResult.tempPassword}</span>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <Button onClick={handleWhatsApp} className="w-full h-11 bg-[#25D366] hover:bg-[#128C7E] text-white">
            <ExternalLink className="h-4 w-4 mr-2" />
            Enviar por WhatsApp
          </Button>
          <Button variant="outline" onClick={() => setInvitationResult(null)} className="w-full">
            Registrar a otro docente
          </Button>
        </div>
      </div>
    )
  }

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Nombre Completo</label>
        <Input 
          required 
          value={formData.fullName}
          onChange={e => setFormData(d => ({ ...d, fullName: e.target.value }))}
          className="h-11 rounded-lg border-muted-foreground/20 focus:border-primary"
          placeholder="Ej. Juan Pérez"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Teléfono WhatsApp</label>
        <Input 
          required 
          value={formData.emailOrPhone}
          onChange={e => setFormData(d => ({ ...d, emailOrPhone: e.target.value }))}
          className="h-11 rounded-lg border-muted-foreground/20"
          placeholder="10 dígitos (Sin espacios)"
          type="tel"
          maxLength={10}
        />
      </div>

      {formData.role === 'docente' && (
        <>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Especialidad (Opcional)</label>
            <Input 
              value={formData.specialty}
              onChange={e => setFormData(d => ({ ...d, specialty: e.target.value }))}
              className="h-11 rounded-lg border-muted-foreground/20"
              placeholder="Ej. Matemáticas, Ed. Física"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Grado</label>
              <Select 
                value={formData.grade} 
                onValueChange={(v) => setFormData(d => ({ ...d, grade: v === 'none' ? '' : v }))}
              >
                <SelectTrigger className="h-11 rounded-lg border-muted-foreground/20">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin asignar</SelectItem>
                  <SelectItem value="Multigrado">Multigrado</SelectItem>
                  <SelectItem value="1">1º - Primero</SelectItem>
                  <SelectItem value="2">2º - Segundo</SelectItem>
                  <SelectItem value="3">3º - Tercero</SelectItem>
                  <SelectItem value="4">4º - Cuarto</SelectItem>
                  <SelectItem value="5">5º - Quinto</SelectItem>
                  <SelectItem value="6">6º - Sexto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Grupo</label>
              <Select 
                value={formData.section} 
                onValueChange={(v) => setFormData(d => ({ ...d, section: v === 'none' ? '' : v }))}
              >
                <SelectTrigger className="h-11 rounded-lg border-muted-foreground/20">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin asignar</SelectItem>
                  {['A', 'B', 'C', 'D', 'E', 'F'].map(letter => (
                    <SelectItem key={letter} value={letter}>Grupo {letter}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Rol</label>
          <Select 
            value={formData.role} 
            onValueChange={(v: Role) => setFormData(d => ({ ...d, role: v }))}
          >
            <SelectTrigger className="h-11 rounded-lg border-muted-foreground/20 capitalize">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {allowedRoles.map(r => (
                <SelectItem key={r} value={r} className="capitalize">
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {formData.role === 'padre' && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Sub-Rol SPF</label>
            <Select 
              value={formData.subRole} 
              onValueChange={(v: SubRole | 'ninguno') => setFormData(d => ({ ...d, subRole: v }))}
            >
              <SelectTrigger className="h-11 rounded-lg border-muted-foreground/20 capitalize">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ninguno">Ninguno</SelectItem>
                <SelectItem value="presidente">Presidente</SelectItem>
                <SelectItem value="tesorero">Tesorero</SelectItem>
                <SelectItem value="secretario">Secretario</SelectItem>
                <SelectItem value="vocal">Vocal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {errorMsg && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium">{errorMsg}</div>}

      <Button type="submit" className="w-full h-12 text-base shadow-md font-bold transition-all hover:scale-[1.01] active:scale-[0.99] mt-2" disabled={isInviting || (formData.role === 'docente' && (!!formData.grade !== !!formData.section))}>
        {isInviting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Procesando...
          </>
        ) : (
          <>
            <Send className="h-5 w-5 mr-2" />
            {formData.role === 'docente' ? 'Registrar Docente' : 'Generar Invitación'}
          </>
        )}
      </Button>
    </form>
  )

  if (hideCard) {
    return <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">{formContent}</div>
  }

  return (
    <Card className="shadow-lg border-muted/50 overflow-hidden">
      <CardHeader className="bg-primary/5 border-b py-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Registro de Miembro
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {formContent}
      </CardContent>
    </Card>
  )
}
