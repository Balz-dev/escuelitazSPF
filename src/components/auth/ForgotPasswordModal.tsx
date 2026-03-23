"use client"

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SupabaseAuthService } from '@/infrastructure/supabase/services/SupabaseAuthService'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

interface ForgotPasswordModalProps {
  isOpen: boolean
  onClose: () => void
  initialIdentifier?: string
}

const authService = new SupabaseAuthService()

export function ForgotPasswordModal({ isOpen, onClose, initialIdentifier = '' }: ForgotPasswordModalProps) {
  const [identifier, setIdentifier] = useState(initialIdentifier)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset state when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setIdentifier(initialIdentifier)
      setIsSuccess(false)
      setError(null)
    }
  }, [isOpen, initialIdentifier])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!identifier.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      await authService.requestPasswordReset(identifier)
      setIsSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al solicitar el restablecimiento')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Recuperar Contraseña</DialogTitle>
          <DialogDescription>
            Ingresa tu usuario, correo electrónico o teléfono celular.
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-6 text-center">
            <CheckCircle2 className="h-12 w-12 text-primary" />
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Solicitud Enviada</h3>
              <p className="text-sm text-muted-foreground">
                Si el usuario existe y pertenece a una escuela, el director ha sido notificado. 
                Por favor, contacta a la dirección de tu escuela para recibir tu contraseña temporal.
              </p>
            </div>
            <Button className="w-full" onClick={onClose} variant="outline">
              Entendido
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-identifier">Usuario, Correo o Teléfono</Label>
              <Input
                id="reset-identifier"
                placeholder="ejemplo@correo.com o WhatsApp"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                disabled={isLoading}
                autoFocus
                required
              />
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
                Cancelar
              </Button>
              <Button type="submit" isLoading={isLoading} disabled={!identifier.trim()}>
                Solicitar Acceso
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
