'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Send } from 'lucide-react'
import { Database } from '@/infrastructure/supabase/database.types'
import { useInvitation } from '@/hooks/useInvitation'

type Role = Database['public']['Enums']['member_role']
type SubRole = Database['public']['Enums']['member_sub_role']

interface InvitationSenderProps {
  schoolId: string
  invitedBy: string
  allowedRoles: Role[]
  groups?: any[] // Añadido para docentes
  onSuccess?: (credentials: { tempPassword: string; username: string }) => void
}

/**
 * Componente genérico para enviar invitaciones a nuevos miembros.
 */
export function InvitationSender({ schoolId, invitedBy, allowedRoles, groups = [], onSuccess }: InvitationSenderProps) {
  const { inviteMember, isInviting, error: inviteError } = useInvitation()
  const [formData, setFormData] = useState({
    fullName: '',
    emailOrPhone: '',
    role: allowedRoles[0] || 'docente',
    subRole: 'ninguno' as SubRole | 'ninguno',
    specialty: '', // Añadido
    groupId: '' // Añadido
  })
  const [localError, setLocalError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError('')

    try {
      const data = await inviteMember({
        emailOrPhone: formData.emailOrPhone,
        fullName: formData.fullName,
        role: formData.role as any,
        schoolId,
        subRole: formData.subRole === 'ninguno' ? null : formData.subRole,
        specialty: formData.role === 'docente' ? formData.specialty : undefined,
        groupId: formData.role === 'docente' && formData.groupId !== '' ? formData.groupId : undefined
      })

      if (data) {
        setFormData({
          fullName: '',
          emailOrPhone: '',
          role: allowedRoles[0] || 'docente',
          subRole: 'ninguno',
          specialty: '',
          groupId: ''
        })
  
        if (onSuccess) {
          onSuccess(data)
        }
      }
    } catch (err: any) {
      console.error(err)
    }
  }

  const errorMsg = localError || inviteError

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Enviar Invitación</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Nombre Completo</label>
            <Input 
              required 
              value={formData.fullName}
              onChange={e => setFormData(d => ({ ...d, fullName: e.target.value }))}
              placeholder="Ej. Juan Pérez"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Teléfono Móvil (WhatsApp)</label>
            <Input 
              required 
              value={formData.emailOrPhone}
              onChange={e => setFormData(d => ({ ...d, emailOrPhone: e.target.value }))}
              placeholder="10 dígitos"
              type="tel"
            />
          </div>

          {formData.role === 'docente' && (
            <>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Especialidad (Opcional)</label>
                <Input 
                  value={formData.specialty}
                  onChange={e => setFormData(d => ({ ...d, specialty: e.target.value }))}
                  placeholder="Ej. Educación Física, Inglés"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Grupo Asignado</label>
                <Select 
                  value={formData.groupId} 
                  onValueChange={(v) => setFormData(d => ({ ...d, groupId: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar grupo (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="undefined">Sin asignar</SelectItem>
                    {groups.map(g => (
                      <SelectItem key={g.id} value={g.id}>
                        {g.grade}° {g.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Rol Asignado</label>
              <Select 
                value={formData.role} 
                onValueChange={(v: Role) => setFormData(d => ({ ...d, role: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allowedRoles.map(r => (
                    <SelectItem key={r} value={r}>
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.role === 'padre' && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Sub-Rol en SPF (Opcional)</label>
                <Select 
                  value={formData.subRole} 
                  onValueChange={(v: SubRole | 'ninguno') => setFormData(d => ({ ...d, subRole: v }))}
                >
                  <SelectTrigger>
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

          {errorMsg && <p className="text-sm text-destructive">{errorMsg}</p>}

          <Button type="submit" className="w-full" disabled={isInviting}>
            {isInviting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
            Generar Token e Invitar
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
