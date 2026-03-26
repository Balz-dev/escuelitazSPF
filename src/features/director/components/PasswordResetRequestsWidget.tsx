"use client"

import React, { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SupabaseAuthService } from '@/infrastructure/supabase/services/SupabaseAuthService'
import { SupabaseDirectorService } from '@/infrastructure/supabase/services/SupabaseDirectorService'
import { Loader2, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { PasswordResetRequest } from '@/core/domain/entities/PasswordResetRequest'

interface Props {
  schoolId: string
}

const directorService = new SupabaseDirectorService()
const authService = new SupabaseAuthService()

export function PasswordResetRequestsWidget({ schoolId }: Props) {
  const [requests, setRequests] = useState<PasswordResetRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isResetting, setIsResetting] = useState<string | null>(null)
  const [tempPasswordModal, setTempPasswordModal] = useState<{
    isOpen: boolean,
    userName: string,
    tempPassword?: string
  }>({ isOpen: false, userName: '' })

  const fetchRequests = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await directorService.getPendingPasswordResetRequests(schoolId)
      setRequests(data)
    } catch (err) {
      console.error('Error fetching password reset requests:', err)
      alert('No se pudieron cargar las solicitudes de contraseña')
    } finally {
      setIsLoading(false)
    }
  }, [schoolId])

  useEffect(() => {
    if (!schoolId) return
    fetchRequests()
  }, [schoolId, fetchRequests])

  const handleResetPassword = async (request: PasswordResetRequest) => {
    setIsResetting(request.id)
    try {
      const tempPassword = await authService.resetUserPassword(request.userId)
      
      const userName = request.profiles?.fullName || request.profiles?.username || request.profiles?.phone || 'Usuario'
      
      setTempPasswordModal({
        isOpen: true,
        tempPassword: tempPassword,
        userName
      })
      
      // Refresh list to remove the resolved request
      await fetchRequests()
      
    } catch (e) {
      console.error(e)
      alert(`Error al resetear contraseña: ${e instanceof Error ? e.message : 'Error desconocido'}`)
    } finally {
      setIsResetting(null)
    }
  }

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Solicitudes de Contraseña</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (requests.length === 0) {
    return null; // Don't show the widget if there are no pending requests, to save space
  }

  return (
    <>
      <Card className="border-orange-200 shadow-sm">
        <CardHeader className="bg-orange-50/50 pb-4">
          <CardTitle className="flex items-center gap-2 text-orange-800 text-lg">
            <KeyRound className="w-5 h-5" />
            Recuperación de Contraseñas
          </CardTitle>
          <CardDescription className="text-orange-700/80">
            Los siguientes usuarios han solicitado ayuda para acceder a su cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {requests.map(req => {
              const profile = req.profiles
              const name = profile?.fullName || 'Usuario Sin Nombre'
              const contact = profile?.username || profile?.phone || 'Sin contacto'
              const date = new Date(req.createdAt).toLocaleDateString()

              return (
                <div key={req.id} className="p-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center hover:bg-muted/50 transition-colors">
                  <div>
                    <h4 className="font-medium text-sm">{name}</h4>
                    <p className="text-xs text-muted-foreground">{contact} • {date}</p>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleResetPassword(req)}
                    disabled={isResetting === req.id}
                    className="shrink-0"
                  >
                    {isResetting === req.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <KeyRound className="w-4 h-4 mr-2" />}
                    Generar Clave
                  </Button>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={tempPasswordModal.isOpen} onOpenChange={(open: boolean) => !open && setTempPasswordModal(prev => ({ ...prev, isOpen: false }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary">
              <CheckCircle2 className="w-5 h-5" />
              Contraseña Generada
            </DialogTitle>
            <DialogDescription>
              Comparte esta clave temporal de forma segura con <strong>{tempPasswordModal.userName}</strong>.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-muted p-6 rounded-md my-4 flex justify-center items-center">
             <span className="text-4xl font-mono tracking-wider font-bold text-foreground">
               {tempPasswordModal.tempPassword}
             </span>
          </div>

          <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-sm flex gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>Al iniciar sesión con esta clave temporal, se le pedirá al usuario que cree una nueva contraseña definitiva.</p>
          </div>

          <DialogFooter>
            <Button className="w-full mt-2" onClick={() => setTempPasswordModal(prev => ({ ...prev, isOpen: false }))}>
               Hecho, ya la compartí
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
