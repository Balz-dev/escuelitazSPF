"use client"

import React from 'react'
import { AuthLayout } from '@/components/layout/auth-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { SupabaseAuthService } from '@/infrastructure/supabase/services/SupabaseAuthService'
import { User } from '@supabase/supabase-js'

const authService = new SupabaseAuthService()

export default function LoginPage() {
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  
  // Modos: 'password' (tradicional/temporal), 'otp' (código dinámico)
  const [authMode, setAuthMode] = React.useState<'password' | 'otp'>('password')
  const [isVerifyingOtp, setIsVerifyingOtp] = React.useState(false)
  
  const [identifier, setIdentifier] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [otp, setOtp] = React.useState('')
  
  const router = useRouter()
  const searchParams = useSearchParams()

  // Si viene con un 'identifier' en la URL (desde el link de WhatsApp)
  React.useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setIdentifier(emailParam)
      setAuthMode('password') // Ir directo a password si viene de invitación
    }
  }, [searchParams])

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await authService.signInWithOtp(identifier)
      setIsVerifyingOtp(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al solicitar el código')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await authService.verifyOtp(identifier, otp)
      await checkProfileAndRedirect()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Código incorrecto o expirado')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const data = await authService.signInWithPassword(identifier, password)
      
      if (!data?.user) throw new Error('No se pudo obtener el usuario')
      
      checkProfileAndRedirect(data.user)

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Credenciales incorrectas')
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await authService.signInWithGoogle()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión con Google')
      setIsLoading(false)
    }
  }

  const checkProfileAndRedirect = async (userOverride?: User | null) => {
    // 1. Obtener el usuario actual
    const session = await authService.getSession()
    const user = userOverride || session?.user
    if (!user) return

    const userMetadata = user.user_metadata
    const appMetadata = user.app_metadata
    
    // 2. Verificar si debe cambiar contraseña
    if (userMetadata?.must_change_password) {
      router.push('/set-password')
      return
    }

    // 3. Redirigir según el rol
    const role = (appMetadata?.role || userMetadata?.role) as string
    
    if (!role) {
      router.push('/unauthorized')
      return
    }

    switch (role) {
      case 'director':
        router.push('/director')
        break
      case 'docente':
        router.push('/docente')
        break
      case 'superadmin':
        router.push('/admin/requests')
        break;
      case 'padre':
        router.push('/padre')
        break
      default:
        router.push('/dashboard') // Fallback genérico
    }
  }

  return (
    <AuthLayout 
      title={
        authMode === 'password' ? "Ingresa tus datos" :
        !isVerifyingOtp ? "Acceso con código" : 
        "Verifica tu acceso"
      }
      subtitle={
        authMode === 'password' ? "Ingresa con tu usuario y contraseña proporcionados." :
        !isVerifyingOtp ? "Accede fácilmente sin contraseñas memorizadas." :
        `Hemos enviado un código a ${identifier}.`
      }
    >
      <div className="flex p-1 bg-muted rounded-lg mb-6">
        <button 
          className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${authMode === 'password' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          onClick={() => { setAuthMode('password'); setError(null); setIsVerifyingOtp(false); }}
        >
          Contraseña
        </button>
        <button 
          className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${authMode === 'otp' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          onClick={() => { setAuthMode('otp'); setError(null); }}
        >
          Código OTP
        </button>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm mb-4 animate-in fade-in slide-in-from-top-1">
          {error}
        </div>
      )}

      {/* FLUJO PASSWORD (TRADICIONAL) */}
      {authMode === 'password' && (
        <form className="space-y-4" onSubmit={handlePasswordLogin}>
          <div className="space-y-2">
            <Label htmlFor="identifier">Identificador</Label>
            <Input 
              id="identifier" 
              placeholder="Email, Celular o Usuario" 
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required 
              disabled={isLoading} 
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Contraseña</Label>
              <button type="button" className="text-xs text-primary hover:underline">¿La olvidaste?</button>
            </div>
            <Input 
              id="password" 
              type="password"
              placeholder="Tu clave temporal o definitiva" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              disabled={isLoading} 
            />
          </div>
          <Button className="w-full h-11" type="submit" isLoading={isLoading}>
            Iniciar Sesión
          </Button>
        </form>
      )}

      {/* FLUJO OTP (SIN CONTRASEÑA) */}
      {authMode === 'otp' && (
        !isVerifyingOtp ? (
          <form className="space-y-4" onSubmit={handleRequestOtp}>
            <div className="space-y-2">
              <Label htmlFor="identifier">Correo o Teléfono</Label>
              <Input 
                id="identifier" 
                placeholder="ejemplo@correo.com o WhatsApp" 
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required 
                disabled={isLoading} 
              />
            </div>
            <p className="text-xs text-muted-foreground">Te enviaremos un código único para acceder sin claves.</p>
            <Button className="w-full h-11" type="submit" isLoading={isLoading}>
              Enviar código de acceso
            </Button>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={handleVerifyOtp}>
            <div className="space-y-2">
              <Label htmlFor="otp">Código Recibido</Label>
              <Input 
                id="otp" 
                placeholder="123456" 
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required 
                disabled={isLoading} 
                autoFocus
              />
            </div>
            <Button className="w-full h-11" type="submit" isLoading={isLoading}>
              Verificar y Entrar
            </Button>
            <Button 
              variant="ghost" 
              className="w-full text-xs" 
              onClick={() => setIsVerifyingOtp(false)}
              type="button"
            >
              ← Usar otro correo/teléfono
            </Button>
          </form>
        )
      )}

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-muted" /></div>
        <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">O</span></div>
      </div>

      <Button 
        variant="outline" 
        className="w-full" 
        type="button" 
        disabled={isLoading}
        onClick={handleGoogleLogin}
      >
         <span className="mr-2">G</span> Google
      </Button>
    </AuthLayout>
  )
}
