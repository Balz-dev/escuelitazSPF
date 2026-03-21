"use client"

import React from 'react'
import { AuthLayout } from '@/components/layout/auth-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { createClient } from '@/infrastructure/supabase/client'
import { CheckCircle2, ShieldCheck } from 'lucide-react'

export default function SetPasswordPage() {
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)
  
  const [password, setPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  
  const router = useRouter()
  const supabase = createClient()

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // 1. Actualizar la contraseña
      const { data, error: updateError } = await supabase.auth.updateUser({
        password: password,
        data: { must_change_password: false } 
      })

      if (updateError) throw updateError

      setSuccess(true)
      
      // 2. Redirigir según rol tras el éxito
      const role = data.user?.app_metadata?.role || data.user?.user_metadata?.role
      
      setTimeout(() => {
        switch (role) {
          case 'director': router.push('/director'); break
          case 'docente': router.push('/docente'); break
          case 'padre': router.push('/padre'); break
          default: router.push('/dashboard');
        }
      }, 2000)

    } catch (err: any) {
      setError(err.message || 'Error al actualizar la contraseña')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <AuthLayout 
        title="¡Contraseña Actualizada!" 
        subtitle="Tu cuenta es ahora segura. Redirigiendo al panel..."
      >
        <div className="flex justify-center py-8">
          <CheckCircle2 className="h-16 w-16 text-primary animate-bounce" />
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout 
      title="Crea tu nueva contraseña" 
      subtitle="Por seguridad, debes cambiar la contraseña temporal que te enviaron para continuar."
    >
      <form className="space-y-4" onSubmit={handleUpdatePassword}>
        {error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="password">Nueva Contraseña</Label>
          <Input 
            id="password" 
            type="password" 
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
            disabled={isLoading} 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm">Confirmar Contraseña</Label>
          <Input 
            id="confirm" 
            type="password" 
            placeholder="Repite tu contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required 
            disabled={isLoading} 
          />
        </div>
        
        <Button className="w-full" type="submit" isLoading={isLoading}>
          <ShieldCheck className="h-4 w-4 mr-2" />
          Guardar y Entrar
        </Button>
      </form>
    </AuthLayout>
  )
}
