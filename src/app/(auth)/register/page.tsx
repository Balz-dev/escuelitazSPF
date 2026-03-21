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

          <div className="space-y-4">
            <p className="text-muted-foreground">
              Un asesor revisará tus datos y te contactará en menos de 24 horas para activar tu periodo de prueba premium por un **ciclo escolar completo**.
            </p>

            <div className="bg-muted/50 p-4 rounded-xl border border-border/50 shadow-sm relative overflow-hidden group">
              <div className="absolute inset-0 bg-linear-to-r from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <p className="font-semibold text-foreground text-sm flex items-center justify-center gap-2">
                ¿Quieres agilizar tu prueba gratis?
              </p>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Envíanos un mensaje y nuestro equipo de <span className="text-foreground font-medium">soporte técnico</span> te atenderá inmediatamente para configurar tu escuela.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <Button className="w-full h-12 bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-lg shadow-[#25D366]/20 transition-all font-medium border-0" asChild>
              <a href={`https://wa.me/${APP_CONFIG.supportPhone.replace(/\D/g, '')}?text=Hola! Acabo de registrar mi escuela ${formData.schoolName} en la plataforma y me gustaría agilizar mi prueba gratuita y contactar con soporte técnico.`} target="_blank" className="flex items-center justify-center gap-2 w-full h-full">
                <svg viewBox="0 0 448 512" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                  <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
                </svg>
                Agilizar mediante WhatsApp
              </a>
            </Button>
          </div>
          <Button variant="link" asChild className="w-full text-muted-foreground hover:text-foreground">
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
