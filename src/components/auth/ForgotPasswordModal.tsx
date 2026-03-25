"use client"

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Info, Contact2 } from 'lucide-react'

interface ForgotPasswordModalProps {
  isOpen: boolean
  onClose: () => void
  initialIdentifier?: string
}

export function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Contact2 className="h-5 w-5 text-primary" />
            Recuperar Contraseña
          </DialogTitle>
          <DialogDescription>
            Sigue las siguientes instrucciones según tu rol en la escuela para solicitar una nueva contraseña:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 text-sm text-muted-foreground">
          <div className="flex gap-3 bg-muted/50 p-3 rounded-lg border border-border/50">
            <Info className="h-5 w-5 shrink-0 text-blue-500 mt-0.5" />
            <div>
              <strong className="text-foreground block mb-1">Si eres Padre de familia o Estudiante:</strong>
              Ponte en contacto con tu Maestro/Maestra titular. Ellos tienen la facultad de resetear tu contraseña y enviártela por WhatsApp.
            </div>
          </div>

          <div className="flex gap-3 bg-muted/50 p-3 rounded-lg border border-border/50">
            <Info className="h-5 w-5 shrink-0 text-blue-500 mt-0.5" />
            <div>
              <strong className="text-foreground block mb-1">Si eres Docente:</strong>
              Avisa directamente a tu Director(a). El director podrá restablecer tu acceso desde su panel de control administrativo.
            </div>
          </div>

          <div className="flex gap-3 bg-muted/50 p-3 rounded-lg border border-border/50">
            <Info className="h-5 w-5 shrink-0 text-blue-500 mt-0.5" />
            <div>
              <strong className="text-foreground block mb-1">Si eres Director(a):</strong>
              Comunícate con el Administrador del sistema para verificar tu identidad y restaurar tu clave de acceso.
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={onClose} variant="default" className="w-full sm:w-auto">
            Entendido
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
