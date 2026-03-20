import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Save } from 'lucide-react'
import { useEntityPermissions } from '@/hooks/useEntityPermissions'
import { Database } from '@/infrastructure/supabase/database.types'

type Role = Database['public']['Enums']['member_role']

export interface DocenteProfileData {
  id?: string
  fullName: string
  phone: string
}

interface DocenteProfileFormProps {
  initialData?: Partial<DocenteProfileData>
  actorRole: Role
  isOwner: boolean
  onSubmit: (data: DocenteProfileData) => Promise<void>
}

/**
 * Formulario compartido para la edición del perfil de Docente.
 * Se adapta según el rol que lo esté visualizando (Director o el propio Docente).
 */
export function DocenteProfileForm({ initialData, actorRole, isOwner, onSubmit }: DocenteProfileFormProps) {
  const [formData, setFormData] = useState({
    fullName: initialData?.fullName || '',
    phone: initialData?.phone || ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [success, setSuccess] = useState(false)

  const perms = useEntityPermissions('docente', actorRole, null, isOwner)

  if (!perms.canEdit) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Perfil del Docente</CardTitle>
          <CardDescription>No tienes permisos para editar este perfil.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMsg('')
    setSuccess(false)

    try {
      await onSubmit(formData as DocenteProfileData)
      setSuccess(true)
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar el perfil')
    } finally {
      setIsLoading(false)
    }
  }

  const canEditField = (field: string) => perms.editableFields.includes('*') || perms.editableFields.includes(field)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Información del Docente</CardTitle>
        <CardDescription>
          {isOwner ? 'Actualiza tu información personal.' : 'Gestión de datos del docente.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Nombre Completo</Label>
            <Input 
              required 
              value={formData.fullName}
              onChange={e => setFormData(d => ({ ...d, fullName: e.target.value }))}
              disabled={!canEditField('full_name') || isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Teléfono Móvil (WhatsApp)</Label>
            <Input 
              required 
              value={formData.phone}
              onChange={e => setFormData(d => ({ ...d, phone: e.target.value }))}
              disabled={!canEditField('phone') || isLoading}
              type="tel"
            />
          </div>

          {errorMsg && <p className="text-sm text-destructive">{errorMsg}</p>}
          {success && <p className="text-sm text-green-600">Perfil guardado exitosamente.</p>}

          <Button type="submit" disabled={isLoading} size="sm">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Guardar Cambios
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
