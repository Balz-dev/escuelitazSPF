'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { UserPlus } from 'lucide-react'
import { InvitationSender } from './InvitationSender'
import { Group } from '@/core/domain/entities/Group'

interface RegisterTeacherDialogProps {
  schoolId: string
  userId: string
  groups: Group[]
  onSuccess?: () => void
}

export function RegisterTeacherDialog({ schoolId, userId, groups, onSuccess }: RegisterTeacherDialogProps) {
  const [open, setOpen] = React.useState(false)

  const handleSuccess = () => {
    // No cerramos el modal automáticamente para que el usuario pueda ver las credenciales
    // y usar el botón de WhatsApp de InvitationSender.
    if (onSuccess) onSuccess()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="bg-primary hover:bg-primary/90">
          <UserPlus className="h-4 w-4 mr-2" />
          Registrar Docente
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Registrar Nuevo Docente</DialogTitle>
          <DialogDescription>
            Ingresa los datos del docente para generar sus accesos y asignarlo a un grupo.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <InvitationSender
            schoolId={schoolId}
            invitedBy={userId}
            allowedRoles={['docente']}
            groups={groups}
            hideCard={true}
            onSuccess={handleSuccess}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
