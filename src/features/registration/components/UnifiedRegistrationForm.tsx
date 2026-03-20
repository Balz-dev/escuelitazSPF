'use client'

import React, { useState } from 'react'
import { SupabasePreregistrationRepository } from '@/infrastructure/supabase/repositories/SupabasePreregistrationRepository'
import type { CreatePreregistrationDTO } from '@/core/domain/entities/StudentPreregistration'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, CheckCircle, UserPlus } from 'lucide-react'

const repo = new SupabasePreregistrationRepository()

interface UnifiedRegistrationFormProps {
  schoolId: string
  /** Si viene autenticado, se registra como registeredBy; si es null, es auto-registro de padre */
  registeredBy?: string | null
  onSuccess?: () => void
  /** Modo interno: muestra campos adicionales y botón "Guardar y agregar otro" */
  isInternal?: boolean
}

const RELATIONSHIP_OPTIONS = ['padre', 'madre', 'tutor', 'abuelo/a', 'tío/a', 'otro']

/**
 * Formulario de registro unificado de alumno + padre/tutor.
 * Funciona en dos contextos:
 * - Interno (dashboard): para director y docente con acceso autenticado.
 * - Público (/register/[identifier]): para padres sin cuenta, registeredBy = null.
 */
export function UnifiedRegistrationForm({
  schoolId,
  registeredBy = null,
  onSuccess,
  isInternal = false,
}: UnifiedRegistrationFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [successCount, setSuccessCount] = useState(0)
  const [error, setError] = useState<string | null>(null)

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
      await repo.create(dto)
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
      <Card className="w-full max-w-lg mx-auto border-primary bg-primary/5">
        <CardContent className="pt-8 pb-6 flex flex-col items-center gap-4 text-center">
          <CheckCircle className="h-14 w-14 text-primary" />
          <h2 className="text-xl font-bold">¡Registro enviado!</h2>
          <p className="text-muted-foreground text-sm">
            El director revisará tu solicitud y te contactará pronto.<br />
            Gracias por confiar en nosotros.
          </p>
          <Button variant="outline" onClick={reset}>Registrar otro alumno</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-primary" />
          <CardTitle>Registro de Alumno</CardTitle>
        </div>
        <CardDescription>
          {isInternal
            ? 'Registra un alumno directamente en el sistema.'
            : 'Llena el formulario para solicitar el registro de tu hijo/a.'}
        </CardDescription>
        {isInternal && successCount > 0 && (
          <p className="text-xs text-primary font-medium">{successCount} alumno(s) registrados hoy</p>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => handleSubmit(e)} className="space-y-5">
          {/* ─── Datos del alumno ─── */}
          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold text-foreground">📚 Datos del alumno</legend>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="first-name">Nombre(s) *</Label>
                <Input
                  id="first-name"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="María"
                  required
                />
              </div>
              <div className="space-y-1.5">
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

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="grado">Grado / Año</Label>
                <Input
                  id="grado"
                  value={grado}
                  onChange={e => setGrado(e.target.value)}
                  placeholder="Ej. 3°B"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="curp">CURP</Label>
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

          <hr className="border-border" />

          {/* ─── Datos del padre/tutor ─── */}
          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold text-foreground">👨‍👩‍👧 Padre / Tutor responsable</legend>

            <div className="space-y-1.5">
              <Label htmlFor="parent-name">Nombre completo *</Label>
              <Input
                id="parent-name"
                value={parentName}
                onChange={e => setParentName(e.target.value)}
                placeholder="Juan García López"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="parent-phone">Teléfono *</Label>
                <Input
                  id="parent-phone"
                  type="tel"
                  value={parentPhone}
                  onChange={e => setParentPhone(e.target.value)}
                  placeholder="2791234567"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="parent-email">Correo (opcional)</Label>
                <Input
                  id="parent-email"
                  type="email"
                  value={parentEmail}
                  onChange={e => setParentEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="relationship">Parentesco *</Label>
              <select
                id="relationship"
                value={relationship}
                onChange={e => setRelationship(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {RELATIONSHIP_OPTIONS.map(r => (
                  <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                ))}
              </select>
            </div>
          </fieldset>

          {error && (
            <p className="text-sm text-destructive" role="alert">{error}</p>
          )}

          <div className="flex gap-2">
            {isInternal && (
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                disabled={isLoading}
                onClick={(e) => handleSubmit(e as any, true)}
              >
                Guardar y otro
              </Button>
            )}
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isInternal ? 'Registrar' : 'Enviar solicitud'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
