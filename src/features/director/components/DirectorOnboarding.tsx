'use client'

import React, { useState } from 'react'
import { useLocalProfile } from '@/features/director/hooks/useLocalProfile'
import { schoolLogoService } from '@/infrastructure/supabase/services/SchoolLogoService'
import { SupabaseSchoolRepository } from '@/infrastructure/supabase/repositories/SupabaseSchoolRepository'
import { AvatarPicker } from '@/components/ui/AvatarPicker'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, CheckCircle, ChevronRight, School, User } from 'lucide-react'
import { createClient } from '@/infrastructure/supabase/client'

const schoolRepo = new SupabaseSchoolRepository()
const supabase = createClient()

interface DirectorOnboardingProps {
  userId: string
  schoolId: string
  directorName: string
  onComplete: () => void
}

type Step = 'perfil' | 'escuela'

/**
 * Asistente (Wizard) de bienvenida para el Director.
 * Paso 1 — Perfil personal (avatar local + nombre en Supabase)
 * Paso 2 — Datos de la escuela (CCT, dirección, logo en Storage)
 * Se muestra solo una vez; al completar llama onComplete().
 */
export function DirectorOnboarding({ userId, schoolId, directorName, onComplete }: DirectorOnboardingProps) {
  const { avatarUrl, saveAvatar } = useLocalProfile(userId)
  const [step, setStep] = useState<Step>('perfil')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Paso 1 — Perfil
  const [fullName, setFullName] = useState(directorName)
  const [bio, setBio] = useState('')

  // Paso 2 — Escuela
  const [cct, setCct] = useState('')
  const [address, setAddress] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  const handleProfileNext = async () => {
    setIsSubmitting(true)
    try {
      // Actualizar nombre en Supabase profiles
      await supabase.from('profiles').update({ full_name: fullName }).eq('id', userId)
    } finally {
      setIsSubmitting(false)
      setStep('escuela')
    }
  }

  const handleSchoolComplete = async () => {
    setIsSubmitting(true)
    try {
      // Actualizar CCT y dirección en schools
      await schoolRepo.update(schoolId, {
        ...(cct     ? { cct }     : {}),
        ...(address ? { address } : {}),
      })

      // Subir logo si se seleccionó
      if (logoFile) {
        await schoolLogoService.uploadLogo(schoolId, logoFile)
        if (logoPreview) URL.revokeObjectURL(logoPreview)
      }

      // Marcar onboarding como completado
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', userId)

      onComplete()
    } finally {
      setIsSubmitting(false)
    }
  }

  const steps: Step[] = ['perfil', 'escuela']
  const stepIndex = steps.indexOf(step)

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">

        {/* Indicador de pasos */}
        <div className="flex items-center gap-3 justify-center">
          {steps.map((s, i) => (
            <React.Fragment key={s}>
              <div className={[
                'flex items-center gap-2 text-sm font-medium transition-colors',
                i === stepIndex ? 'text-primary' : i < stepIndex ? 'text-primary/60' : 'text-muted-foreground'
              ].join(' ')}>
                <div className={[
                  'h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold',
                  i === stepIndex ? 'bg-primary text-primary-foreground' :
                  i < stepIndex  ? 'bg-primary/20 text-primary' :
                  'bg-muted text-muted-foreground'
                ].join(' ')}>
                  {i < stepIndex ? <CheckCircle className="h-4 w-4" /> : i + 1}
                </div>
                {s === 'perfil' ? 'Tu perfil' : 'Tu escuela'}
              </div>
              {i < steps.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
            </React.Fragment>
          ))}
        </div>

        {/* Paso 1: Perfil personal */}
        {step === 'perfil' && (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-2"><User className="h-8 w-8 text-primary" /></div>
              <CardTitle>Bienvenido, {directorName.split(' ')[0]}</CardTitle>
              <CardDescription>Personaliza tu perfil — se guardará solo en este dispositivo.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center gap-3">
                <AvatarPicker avatarUrl={avatarUrl} onFileSelect={saveAvatar} size="lg" />
                <p className="text-xs text-muted-foreground">Tu foto es privada y local</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="director-fullname">Nombre completo</Label>
                <Input
                  id="director-fullname"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Ej. María González López"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="director-bio">Presentación breve (opcional)</Label>
                <Input
                  id="director-bio"
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Directora desde 2020, apasionada por la educación..."
                />
              </div>

              <Button className="w-full" onClick={handleProfileNext} disabled={isSubmitting || !fullName.trim()}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Continuar
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Paso 2: Datos de la escuela */}
        {step === 'escuela' && (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-2"><School className="h-8 w-8 text-primary" /></div>
              <CardTitle>Datos de la escuela</CardTitle>
              <CardDescription>Esta información se compartirá con todos los miembros.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Logo upload */}
              <div className="flex flex-col items-center gap-3">
                <label htmlFor="school-logo-upload" className="cursor-pointer">
                  <div className="h-24 w-24 rounded-xl border-2 border-dashed border-border bg-muted flex items-center justify-center overflow-hidden hover:border-primary transition-colors">
                    {logoPreview
                      ? <img src={logoPreview} alt="Vista previa del escudo" className="h-full w-full object-cover" />
                      : <School className="h-10 w-10 text-muted-foreground" />}
                  </div>
                </label>
                <input
                  id="school-logo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoSelect}
                />
                <p className="text-xs text-muted-foreground">Escudo o logo de la escuela</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="school-cct">Clave de Centro de Trabajo (CCT)</Label>
                <Input
                  id="school-cct"
                  value={cct}
                  onChange={e => setCct(e.target.value.toUpperCase())}
                  placeholder="Ej. 30EPR0234A"
                  maxLength={15}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="school-address">Dirección</Label>
                <Input
                  id="school-address"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Calle, colonia, municipio, estado"
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep('perfil')} disabled={isSubmitting}>
                  Atrás
                </Button>
                <Button className="flex-1" onClick={handleSchoolComplete} disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                  Completar
                </Button>
              </div>
              <p className="text-center text-xs text-muted-foreground">Puedes omitir y completar esto después</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
