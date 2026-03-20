"use client"

import React from 'react'
import { AuthLayout } from '@/components/layout/auth-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SupabaseOnboardingService } from '@/infrastructure/supabase/services/SupabaseOnboardingService'
import { CheckCircle2, School, MessageCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { APP_CONFIG } from '@/config/constants'

const onboardingService = new SupabaseOnboardingService()

export default function RegisterPage() {
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [isSuccess, setIsSuccess] = React.useState(false)

  const [formData, setFormData] = React.useState({
    schoolName: '',
    directorName: '',
    contactPhone: '',
    contactEmail: '',
    requesterName: '',
    requesterRole: 'director'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await onboardingService.requestAccess({
        ...formData,
        // Si el rol es director, asumimos que el nombre del director es el mismo que el del solicitante
        directorName: formData.requesterRole === 'director' ? formData.requesterName : formData.directorName
      })
      setIsSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Error al enviar la solicitud')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <AuthLayout
        title="¡Solicitud Recibida!"
        subtitle="Estamos emocionados de que quieras unir a tu escuela."
      >
        <div className="space-y-6 text-center py-4">
          <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>
          <p className="text-muted-foreground">
            Un asesor revisará tus datos y te contactará vía **WhatsApp** en menos de 24 horas para activar tu periodo de prueba premium por un **ciclo escolar completo**.
          </p>
          <div className="pt-4">
            <Button className="w-full h-12 bg-[#25D366] hover:bg-[#20ba5a] text-white" asChild>
              <a href={`https://wa.me/${APP_CONFIG.supportPhone.replace(/\D/g, '')}?text=Hola! Acabo de registrar mi escuela ${formData.schoolName} en la plataforma.`} target="_blank">
                <MessageCircle className="h-5 w-5 mr-2" />
                Contactar por WhatsApp ahora
              </a>
            </Button>
          </div>
          <Button variant="link" asChild className="w-full">
            <Link href="/">Volver al inicio</Link>
          </Button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Registra tu Escuela"
      subtitle="Únete a la plataforma líder para Sociedades de Padres. Prueba gratuita por un ciclo escolar completo."
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="schoolName">Nombre de la Institución</Label>
          <div className="relative">
            <School className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="schoolName"
              className="pl-9"
              placeholder="Ej. Escuela Primaria Benito Juárez"
              value={formData.schoolName}
              onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border/50">
          <div className="space-y-2">
            <Label htmlFor="requesterName">Tu Nombre Completo</Label>
            <Input
              id="requesterName"
              placeholder="¿Quién realiza la solicitud?"
              value={formData.requesterName}
              onChange={(e) => setFormData({ ...formData, requesterName: e.target.value })}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requesterRole">¿Cuál es tu relación con la escuela?</Label>
            <select
              id="requesterRole"
              className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={formData.requesterRole}
              onChange={(e) => setFormData({ ...formData, requesterRole: e.target.value })}
              disabled={isLoading}
            >
              <option value="director">Director / Directora</option>
              <option value="padre">Padre / Madre de Familia</option>
              <option value="supervisor">Supervisor de Zona</option>
              <option value="otro">Otro / Patrocinador</option>
            </select>
          </div>

          {formData.requesterRole !== 'director' && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <Label htmlFor="directorName">Nombre del Director/a de la Escuela</Label>
              <Input
                id="directorName"
                placeholder="Nombre del titular de la escuela"
                value={formData.directorName}
                onChange={(e) => setFormData({ ...formData, directorName: e.target.value })}
                required={formData.requesterRole !== 'director'}
                disabled={isLoading}
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">WhatsApp de Contacto</Label>
            <Input
              id="phone"
              placeholder="+52..."
              value={formData.contactPhone}
              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Correo Electrónico (Opcional)</Label>
          <Input
            id="email"
            type="email"
            placeholder="director@escuela.com"
            value={formData.contactEmail}
            onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
            disabled={isLoading}
          />
        </div>

        <div className="pt-4">
          <Button className="w-full h-12 text-lg shadow-lg" type="submit" isLoading={isLoading}>
            Solicitar Acceso Gratuito
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground px-4">
          Al enviar tu solicitud, aceptas que un asesor te contacte para la configuración inicial de tu escuela.
        </p>

        <div className="pt-4 text-center">
          <Link href="/login" className="text-sm text-primary hover:underline font-medium">
            ¿Ya tienes cuenta? Inicia sesión aquí
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}
