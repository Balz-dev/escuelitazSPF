"use client"

import React from 'react'
import { createClient } from '@/infrastructure/supabase/client'
import { SupabaseAdminService } from '@/infrastructure/supabase/services/SupabaseAdminService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, XCircle, MessageCircle, ExternalLink } from 'lucide-react'

const adminService = new SupabaseAdminService()

export default function AdminRequestsPage() {
  const [requests, setRequests] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [actionLoading, setActionLoading] = React.useState<string | null>(null)
  const [approvedData, setApprovedData] = React.useState<any>(null)

  const loadRequests = async () => {
    setIsLoading(true)
    try {
      const data = await adminService.getOnboardingRequests()
      setRequests(data)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    loadRequests()
  }, [])

  const handleApprove = async (req: any) => {
    setActionLoading(req.id)
    try {
      const result = await adminService.approveRequest(req.id, {
        schoolName: req.school_name,
        directorName: req.director_name,
        contactPhone: req.contact_phone,
        contactEmail: req.contact_email,
        requesterRole: req.requester_role,
        requesterName: req.requester_name
      })
      setApprovedData(result)
      await loadRequests()
    } catch (error) {
      alert('Error al aprobar: ' + (error as Error).message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (id: string) => {
    if (!confirm('¿Seguro que quieres rechazar esta solicitud?')) return
    setActionLoading(id)
    try {
      await adminService.rejectRequest(id)
      await loadRequests()
    } catch (error) {
      alert('Error al rechazar')
    } finally {
      setActionLoading(null)
    }
  }

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Solicitudes de Onboarding</h1>
          <p className="text-muted-foreground">Gestiona las nuevas escuelas que quieren unirse a la plataforma.</p>
        </div>
        <Badge variant="outline" className="text-sm px-3 py-1">SuperAdmin Panel</Badge>
      </div>

      {approvedData && (
        <Card className="border-primary bg-primary/5 animate-in fade-in zoom-in duration-300">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <CheckCircle className="h-6 w-6" />
              ¡Escuela Activada Exitosamente!
            </CardTitle>
            <CardDescription>
              La escuela <strong>{approvedData.school.name}</strong> ya tiene acceso. Envía las credenciales al director.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-background p-4 rounded-md border text-sm font-mono space-y-2">
              <p><strong>Usuario:</strong> {approvedData.credentials.username}</p>
              <p><strong>Clave Temporal:</strong> {approvedData.credentials.tempPassword}</p>
              <p><strong>ID de Acceso:</strong> {approvedData.credentials.loginIdentifier}</p>
            </div>
            <Button className="w-full bg-[#25D366] hover:bg-[#20ba5a]" asChild disabled={!approvedData.school.contact_phone}>
              <a 
                href={`https://wa.me/${approvedData.school.contact_phone?.replace(/\D/g, '') || ''}?text=¡Hola! Tu escuela ha sido activada en Escuelitaz SPF.%0A%0AAccede aquí: ${approvedData.credentials.loginUrl}%0A%0AUsuario: ${approvedData.credentials.username}%0AClave: ${approvedData.credentials.tempPassword}%0A%0AAl ingresar, el sistema te pedirá cambiar tu clave.`} 
                target="_blank"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                {approvedData.school.contact_phone ? 'Enviar Credenciales por WhatsApp' : 'Sin teléfono de contacto'}
              </a>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setApprovedData(null)} className="w-full">
              Cerrar Notificación
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {requests.length === 0 ? (
          <div className="text-center py-12 bg-muted/20 rounded-xl border-2 border-dashed">
            <p className="text-muted-foreground">No hay solicitudes pendientes.</p>
          </div>
        ) : (
          requests.map((req) => (
            <Card key={req.id} className={req.status === 'approved' ? 'opacity-60' : ''}>
              <CardContent className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg">{req.school_name}</h3>
                    <Badge variant={req.status === 'pending' ? 'default' : req.status === 'approved' ? 'outline' : 'destructive'}>
                      {req.status === 'pending' ? 'Pendiente' : req.status === 'approved' ? 'Aprobada' : 'Rechazada'}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-medium text-primary">Solicitante: {req.requester_name} ({req.requester_role})</p>
                    {req.requester_role !== 'director' && (
                      <p className="text-sm text-muted-foreground italic">Director Destinado: {req.director_name}</p>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">Contacto: {req.contact_phone} {req.contact_email && `| ${req.contact_email}`}</p>
                  <p className="text-xs text-muted-foreground">Recibida: {new Date(req.created_at).toLocaleString()}</p>
                </div>

                {req.status === 'pending' && (
                  <div className="flex gap-2 w-full md:w-auto">
                    <Button 
                      variant="outline" 
                      className="flex-1 md:flex-none text-destructive hover:bg-destructive/10"
                      onClick={() => handleReject(req.id)}
                      disabled={actionLoading === req.id}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Rechazar
                    </Button>
                    <Button 
                      className="flex-1 md:flex-none"
                      onClick={() => handleApprove(req)}
                      disabled={actionLoading === req.id}
                    >
                      {actionLoading === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                      Aprobar y Activar
                    </Button>
                  </div>
                )}
                
                {req.status === 'approved' && (
                   <Badge variant="secondary" className="flex items-center gap-1">
                     <ExternalLink className="h-3 w-3" />
                     Ya existe instancia
                   </Badge>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
