"use client"

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/infrastructure/supabase/client'
import { SupabaseAuthService } from '@/infrastructure/supabase/services/SupabaseAuthService'
import { Loader2, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Database } from '@/infrastructure/supabase/database.types'

type PasswordResetRequest = Database['public']['Tables']['password_reset_requests']['Row'] & {
  profiles?: { full_name: string | null; email: string | null; phone: string | null } | null
}

interface Props {
  schoolId: string
}

export function PasswordResetRequestsWidget({ schoolId }: Props) {
  const [requests, setRequests] = useState<PasswordResetRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isResetting, setIsResetting] = useState<string | null>(null)
  const [tempPasswordModal, setTempPasswordModal] = useState<{isOpen: boolean, password: string, userName: string}>({
    isOpen: false,
    password: '',
    userName: ''
  })

  // We define it as a reusable function so we can refresh after resetting
  const fetchRequests = async () => {
    try {
        const supabase = createClient()
        // We join with profiles to show the user's name
        const { data, error } = await supabase
            .from('password_reset_requests')
            .select(`
                *,
                profiles:user_id(full_name, email, phone)
            `)
            .eq('school_id', schoolId)
            .eq('status', 'pending')
            .order('created_at', { ascending: false })

        if (error) throw error
        setRequests(data as any)
    } catch (e) {
        console.error("Error fetching password reset requests:", e)
    } finally {
        setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!schoolId) return
    fetchRequests()
  }, [schoolId])

  const handleResetPassword = async (request: PasswordResetRequest) => {
    setIsResetting(request.id)
    try {
      const authService = new SupabaseAuthService()
      const tempPassword = await authService.resetUserPassword(request.user_id)
      
      const userName = request.profiles?.full_name || request.profiles?.email || request.profiles?.phone || 'Usuario'
      
      setTempPasswordModal({
        isOpen: true,
        password: tempPassword,
        userName
      })
      
      // Refresh list to remove the resolved request
      await fetchRequests()
      
    } catch (e) {
      console.error(e)
      // Provide an error fallback if there's no toast system
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
              const name = profile?.full_name || 'Usuario Sin Nombre'
              const contact = profile?.email || profile?.phone || 'Sin contacto'
              const date = new Date(req.created_at).toLocaleDateString()

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
               {tempPasswordModal.password}
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
