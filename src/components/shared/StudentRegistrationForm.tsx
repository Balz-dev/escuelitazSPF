'use client'

import React, { useState } from 'react'
import { SupabaseStudentService } from '@/infrastructure/supabase/services/SupabaseStudentService'
import type { CreatePreregistrationDTO } from '@/core/domain/entities/StudentPreregistration'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, CheckCircle, UserPlus } from 'lucide-react'
import { useEntityPermissions } from '@/hooks/useEntityPermissions'
import { Database } from '@/infrastructure/supabase/database.types'

type Role = Database['public']['Enums']['member_role']

const studentService = new SupabaseStudentService()

interface StudentRegistrationFormProps {
  schoolId: string
  /** Si viene autenticado, se registra como registeredBy; si es null, es auto-registro de padre */
  registeredBy?: string | null
  actorRole: Role | null
  isOwner?: boolean
  onSuccess?: () => void
  /** Modo interno: muestra campos adicionales y botón "Guardar y agregar otro" */
  isInternal?: boolean
}

const RELATIONSHIP_OPTIONS = ['padre', 'madre', 'tutor', 'abuelo/a', 'tío/a', 'otro']

/**
 * Formulario colaborativo para el registro/pre-registro de un alumno.
 * Funciona para:
 * - Directores/Docentes: registro directo (isInternal=true)
 * - Padres: solicitud de pre-registro (isInternal=false)
 */
export function StudentRegistrationForm({
  schoolId,
  registeredBy = null,
  actorRole,
  isOwner = false,
  onSuccess,
  isInternal = false,
}: StudentRegistrationFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [successCount, setSuccessCount] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const perms = useEntityPermissions('student', actorRole, null, isOwner)

  // Alumno
  const [firstName, setFirstName]   = useState('')
  const [lastName, setLastName]     = useState('')
  const [curp, setCurp]             = useState('')
  const [grado, setGrado]           = useState('')

  // Padre/Tutor
  const [parentName, setParentName]     = useState('')
  const [parentPhone, setParentPhone]   = useState('')
  const [parentEmail, setParentEmail]   = useState('')
  const [relationship, setRelationship] = useState('madre')

  if (!perms.canCreate && !perms.canEdit) {
    return (
       <Card>
         <CardContent className="p-6 text-center text-muted-foreground">
           No tienes permisos para registrar o editar alumnos.
         </CardContent>
       </Card>
    )
  }

  const reset = () => {
    setFirstName(''); setLastName(''); setCurp(''); setGrado('')
    setParentName(''); setParentPhone(''); setParentEmail(''); setRelationship('madre')
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent, addAnother = false) => {
    e.preventDefault()
    if (!firstName.trim() || !lastName.trim() || !parentName.trim() || !parentPhone.trim()) {
      setError('Completa los campos obligatorios (*).')
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const dto: CreatePreregistrationDTO = {
        schoolId,
        firstName:    firstName.trim(),
        lastName:     lastName.trim(),
        curp:         curp.trim() || null,
        grado:        grado.trim() || null,
        parentName:   parentName.trim(),
        parentPhone:  parentPhone.trim(),
        parentEmail:  parentEmail.trim() || null,
        relationship,
        registeredBy,
      }
      await studentService.createPreregistration(dto)
      setSuccessCount(c => c + 1)

      if (addAnother) {
        reset()
      } else {
        onSuccess?.()
      }
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isInternal && successCount > 0) {
    return (
      <Card className="w-full max-w-lg mx-auto border-primary bg-primary/5 shadow-md">
        <CardContent className="pt-8 pb-6 flex flex-col items-center gap-4 text-center">
          <CheckCircle className="h-14 w-14 text-primary" />
          <h2 className="text-xl font-bold">¡Registro enviado!</h2>
          <p className="text-muted-foreground text-sm">
            La solicitud ha sido guardada y está pendiente de revisión.<br />
            Gracias por confiar en nosotros.
          </p>
          <Button variant="outline" onClick={reset}>Registrar otro alumno</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-lg mx-auto shadow-md border-primary/10">
      <CardHeader className="bg-muted/30 pb-4 border-b">
        <div className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Registro de Alumno</CardTitle>
        </div>
        <CardDescription>
          {isInternal
            ? 'Ingresa los datos del alumno y de su tutor responsable.'
            : 'Pre-registra a tu hijo/a en la institución.'}
        </CardDescription>
        {isInternal && successCount > 0 && (
          <p className="text-xs text-primary font-medium mt-2 bg-primary/10 px-2 py-1 inline-block rounded">
            {successCount} alumno(s) registrados en esta sesión
          </p>
        )}
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={(e) => handleSubmit(e)} className="space-y-6">
          {/* ─── Datos del alumno ─── */}
          <fieldset className="space-y-4">
            <legend className="text-sm font-bold text-primary flex items-center gap-2 mb-3">
               <span className="bg-primary/20 p-1.5 rounded text-primary">📚</span> Datos del Alumno
            </legend>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first-name">Nombre(s) *</Label>
                <Input
                  id="first-name"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="María"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name">Apellidos *</Label>
                <Input
                  id="last-name"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="García López"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="grado">Grado / Grupo</Label>
                <Input
                  id="grado"
                  value={grado}
                  onChange={e => setGrado(e.target.value)}
                  placeholder="Ej. 3° B"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="curp">CURP (Opcional)</Label>
                <Input
                  id="curp"
                  value={curp}
                  onChange={e => setCurp(e.target.value.toUpperCase())}
                  placeholder="GARL..."
                  maxLength={18}
                />
              </div>
            </div>
          </fieldset>

          <hr className="border-border/60" />

          {/* ─── Datos del padre/tutor ─── */}
          <fieldset className="space-y-4">
            <legend className="text-sm font-bold text-primary flex items-center gap-2 mb-3">
               <span className="bg-primary/20 p-1.5 rounded text-primary">👨‍👩‍👧</span> Tutor Responsable
            </legend>

            <div className="space-y-2">
              <Label htmlFor="parent-name">Nombre completo *</Label>
              <Input
                id="parent-name"
                value={parentName}
                onChange={e => setParentName(e.target.value)}
                placeholder="Juan García López"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="parent-phone">WhatsApp *</Label>
                <Input
                  id="parent-phone"
                  type="tel"
                  value={parentPhone}
                  onChange={e => setParentPhone(e.target.value)}
                  placeholder="10 dígitos"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="relationship">Parentesco *</Label>
                <select
                  id="relationship"
                  value={relationship}
                  onChange={e => setRelationship(e.target.value)}
                  className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {RELATIONSHIP_OPTIONS.map(r => (
                    <option key={r} value={r} className="bg-background text-foreground">
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </fieldset>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md" role="alert">{error}</div>
          )}

          <div className="flex gap-3 pt-2">
            {isInternal && (
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-primary/30 hover:bg-primary/5 text-primary"
                disabled={isLoading}
                onClick={(e) => handleSubmit(e as any, true)}
              >
                Guardar y Capturar Otro
              </Button>
            )}
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isInternal ? 'Registrar Alumno' : 'Enviar Solicitud'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
