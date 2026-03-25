"use client"

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { KeyRound, Loader2, MessageSquareText, Search, AlertCircle, CheckCircle2 } from 'lucide-react'
import { SupabaseAuthService } from '@/infrastructure/supabase/services/SupabaseAuthService'

const authService = new SupabaseAuthService()

interface UserPasswordResetWidgetProps {
  targetRoleName?: string // e.g. "Docente", "Padre", "Director"
}

export function UserPasswordResetWidget({ targetRoleName = "Usuario" }: UserPasswordResetWidgetProps) {
  const [identifier, setIdentifier] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successData, setSuccessData] = useState<{
    tempPassword: string
    whatsappUrl: string
  } | null>(null)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!identifier.trim()) return

    setIsLoading(true)
    setError(null)
    setSuccessData(null)

    try {
      const tempPassword = await authService.requestPasswordReset(identifier)
      
      // Preparar el mensaje de WhatsApp
      const message = `¡Hola! 👋 Se ha restablecido tu contraseña en Escuelitaz.\n\n👤 Usuario: ${identifier}\n🔑 Nueva Clave: ${tempPassword}\n\nIngresa aquí: ${window.location.origin}/login\n(El sistema te pedirá cambiarla al entrar)`
      const encodedMessage = encodeURIComponent(message)
      const whatsappUrl = `https://wa.me/?text=${encodedMessage}`

      setSuccessData({
        tempPassword,
        whatsappUrl
      })
      setIdentifier('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al resetear la contraseña')
    } finally {
      setIsLoading(false)
    }
  }

  const sendWhatsApp = () => {
    if (successData?.whatsappUrl) {
      window.open(successData.whatsappUrl, '_blank')
    }
  }

  return (
    <Card className="border-primary/20 shadow-sm">
      <CardHeader className="pb-3 border-b bg-muted/20">
        <CardTitle className="text-lg flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-primary" />
          Restablecer Contraseña
        </CardTitle>
        <CardDescription>
          Genera una nueva contraseña para un {targetRoleName} mediante su usuario o correo.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {!successData ? (
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-identifier">Usuario o Correo del {targetRoleName}</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="reset-identifier"
                  placeholder="Ej. juancarlos"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  disabled={isLoading}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={!identifier.trim() || isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Restablecer y Generar Clave'
              )}
            </Button>
          </form>
        ) : (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="bg-emerald-50 text-emerald-900 p-4 rounded-lg border border-emerald-200">
              <div className="flex items-center gap-2 font-bold mb-2 text-emerald-700">
                <CheckCircle2 className="h-5 w-5" />
                <span>¡Contraseña Reseteada!</span>
              </div>
              <p className="text-sm mb-3">
                Comunica esta clave temporal al {targetRoleName}. Deberá cambiarla al iniciar sesión.
              </p>
              <div className="bg-white/60 p-3 rounded text-center font-mono text-lg font-bold tracking-wider border border-emerald-100 shadow-sm">
                {successData.tempPassword}
              </div>
            </div>

            <Button 
              className="w-full h-12 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold" 
              onClick={sendWhatsApp}
            >
              <MessageSquareText className="h-5 w-5 mr-2" />
              Enviar por WhatsApp
            </Button>

            <Button 
              variant="ghost" 
              className="w-full text-sm text-muted-foreground" 
              onClick={() => setSuccessData(null)}
            >
              Realizar otro reseteo
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
