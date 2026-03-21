"use client"

import React from 'react'
import { createClient } from '@/infrastructure/supabase/client'
import { SupabaseAdminService } from '@/infrastructure/supabase/services/SupabaseAdminService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, XCircle, MessageCircle, MessageSquareText, ExternalLink, RefreshCcw, Edit, Eye, Trash, Search, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'

const adminService = new SupabaseAdminService()

export default function AdminRequestsPage() {
  const [requests, setRequests] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [actionLoading, setActionLoading] = React.useState<string | null>(null)
  const [approvedData, setApprovedData] = React.useState<any>(null)
  const [activeTab, setActiveTab] = React.useState<'pending' | 'approved' | 'rejected'>('pending')
  const [rejectingReq, setRejectingReq] = React.useState<any | null>(null)
  const [rejectionReason, setRejectionReason] = React.useState('')
  const [searchTerm, setSearchTerm] = React.useState('')

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

  const handleReject = async () => {
    if (!rejectingReq) return
    setActionLoading(rejectingReq.id)
    try {
      await adminService.rejectRequest(rejectingReq.id, rejectionReason)
      setRejectingReq(null)
      setRejectionReason('')
      await loadRequests()
    } catch (error) {
      alert('Error al rechazar')
    } finally {
      setActionLoading(null)
    }
  }

  const filteredRequests = requests.filter(req => {
    const matchesTab = req.status === activeTab
    const matchesSearch = 
      req.school_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.director_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.contact_phone?.includes(searchTerm)
    return matchesTab && matchesSearch
  })

  // Estadísticas rápidas
  const stats = {
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length
  }

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center h-screen items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
             <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 text-xs px-2 py-0">ADMIN</Badge>
             Gestión de Escuelas
          </h1>
          <p className="text-muted-foreground mt-1">Cola de solicitudes de onboarding y activación de servicios.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" size="sm" onClick={loadRequests} disabled={isLoading}>
             <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading && 'animate-spin'}`} />
             Actualizar
           </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Pendientes', count: stats.pending, color: 'bg-amber-500', icon: Loader2, tab: 'pending' },
          { label: 'Aprobadas', count: stats.approved, color: 'bg-emerald-500', icon: CheckCircle, tab: 'approved' },
          { label: 'Rechazadas', count: stats.rejected, color: 'bg-rose-500', icon: XCircle, tab: 'rejected' }
        ].map((s) => (
          <Card 
            key={s.label} 
            className={`cursor-pointer transition-all hover:ring-2 hover:ring-primary/20 ${activeTab === s.tab ? 'ring-2 ring-primary border-primary/50 shadow-md' : 'opacity-80'}`}
            onClick={() => setActiveTab(s.tab as any)}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                 <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
                 <p className="text-2xl font-bold">{s.count}</p>
              </div>
              <div className={`${s.color} p-2 rounded-lg text-white`}>
                <s.icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {approvedData && (
        <Card className="border-primary bg-primary/5 border-2 shadow-xl ring-2 ring-primary/20 animate-in slide-in-from-top-4 duration-500">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <CheckCircle className="h-6 w-6" />
              ¡Escuela Activada Exitosamente!
            </CardTitle>
            <CardDescription className="text-primary/70">
              La escuela <strong>{approvedData.school.name}</strong> ya tiene una instancia activa.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-background/80 backdrop-blur p-4 rounded-xl border-dashed border-2 border-primary/30 text-sm font-mono space-y-2">
              <p className="flex justify-between"><strong>Usuario:</strong> <span>{approvedData.credentials.username}</span></p>
              <p className="flex justify-between"><strong>Password:</strong> <span>{approvedData.credentials.tempPassword}</span></p>
              <p className="flex justify-between border-t pt-2 mt-2"><strong>ID:</strong> <span className="opacity-60">{approvedData.credentials.loginIdentifier}</span></p>
            </div>
            <Button 
              className="w-full h-14 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold shadow-lg text-lg group" 
              asChild 
              disabled={!approvedData.school.contact_phone}
            >
              <a 
                href={`https://wa.me/${approvedData.school.contact_phone?.replace(/\D/g, '') || ''}?text=${encodeURIComponent(`¡Hola! 👋 La escuela *${approvedData.school.name}* ha sido activada en Escuelitaz SPF.\n\nTus datos de acceso como Director son:\n👤 Usuario: ${approvedData.credentials.username}\n🔑 Contraseña: ${approvedData.credentials.tempPassword}\n\nIngresa aquí:\n${approvedData.credentials.loginUrl}\n\n(Deberás cambiar tu contraseña al entrar)`)}`} 
                target="_blank"
              >
                <MessageSquareText className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform" />
                {approvedData.school.contact_phone ? 'Enviar Credenciales por WhatsApp' : 'Sin teléfono de contacto'}
              </a>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setApprovedData(null)} className="w-full text-muted-foreground">
              Descartar notificación
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="relative group">
         <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
         <Input 
           placeholder="Buscar por escuela, director o teléfono..." 
           className="pl-10 h-10 bg-background/50 border-muted-foreground/20 focus-visible:ring-primary"
           value={searchTerm}
           onChange={(e) => setSearchTerm(e.target.value)}
         />
      </div>

      <div className="grid gap-4">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-20 bg-muted/10 rounded-2xl border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center space-y-3">
            <div className="p-4 bg-muted/20 rounded-full">
              <Search className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground font-medium">No se encontraron solicitudes en "{activeTab}"</p>
          </div>
        ) : (
          filteredRequests.map((req) => (
            <Card key={req.id} className={`group overflow-hidden transition-all hover:border-primary/30 hover:shadow-lg ${req.status === 'approved' ? 'bg-muted/5' : ''}`}>
              <CardContent className="p-0">
                <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-xl tracking-tight">{req.school_name}</h3>
                      <Badge variant={req.status === 'pending' ? 'default' : req.status === 'approved' ? 'secondary' : 'destructive'}>
                        {req.status === 'pending' ? 'Pendiente' : req.status === 'approved' ? 'Aprobada' : 'Rechazada'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm">
                      <div className="flex items-start gap-2">
                         <div className="mt-1 p-1 bg-primary/10 rounded text-primary">
                           <UserIcon className="h-3 w-3" />
                         </div>
                         <div>
                           <p className="font-semibold">{req.requester_name}</p>
                           <p className="text-muted-foreground text-xs uppercase tracking-wider">{req.requester_role}</p>
                         </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                         <div className="mt-1 p-1 bg-emerald-500/10 rounded text-emerald-600">
                           <PhoneIcon className="h-3 w-3" />
                         </div>
                         <div>
                           <p className="font-semibold">{req.contact_phone}</p>
                           <p className="text-muted-foreground text-xs truncate max-w-[150px]">{req.contact_email || 'Sin email'}</p>
                         </div>
                      </div>
                    </div>

                    {req.status === 'rejected' && req.rejection_reason && (
                      <div className="mt-3 p-3 bg-rose-500/5 border border-rose-500/20 rounded-lg flex gap-2 items-start">
                         <AlertCircle className="h-4 w-4 text-rose-500 mt-0.5 shrink-0" />
                         <p className="text-sm text-rose-700 italic">" {req.rejection_reason} "</p>
                      </div>
                    )}
                    
                    <p className="text-[10px] text-muted-foreground/60 uppercase font-bold tracking-tighter pt-2">
                      Recibida: {new Date(req.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-0 border-muted/20">
                    {(req.status === 'pending' || req.status === 'rejected') && (
                      <div className="flex gap-2 w-full md:w-auto">
                        {req.status === 'pending' && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="bg-muted hover:bg-rose-500 hover:text-white transition-colors"
                            onClick={() => setRejectingReq(req)}
                            disabled={actionLoading === req.id}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <Button 
                          className="flex-1 md:flex-none shadow-md"
                          onClick={() => handleApprove(req)}
                          disabled={actionLoading === req.id}
                        >
                          {actionLoading === req.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              {req.status === 'rejected' ? 'Re-activar y Aprobar' : 'Aprobar y Activar'}
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                    
                    {req.status === 'approved' && (
                       <Badge variant="secondary" className="flex items-center gap-2 py-1 px-3 bg-emerald-500/10 text-emerald-700 border-emerald-500/20">
                         <ExternalLink className="h-3 w-3" />
                         Instancia Activa
                       </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Mini-Modal de Rechazo (Simplificado sin Dialog component) */}
      {rejectingReq && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
             <CardHeader>
               <CardTitle className="flex items-center gap-2 text-rose-600">
                 <XCircle className="h-5 w-5" />
                 Rechazar Solicitud
               </CardTitle>
               <CardDescription>
                 Proporciona un motivo para rechazar a <strong>{rejectingReq.school_name}</strong>. Esto ayudará a llevar un mejor control interno.
               </CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
               <textarea 
                 autoFocus
                 className="w-full min-h-[100px] bg-muted/30 border rounded-md p-3 text-sm focus:ring-2 ring-primary outline-none transition-all"
                 placeholder="Ej. El teléfono de contacto no es válido o la escuela ya está registrada..."
                 value={rejectionReason}
                 onChange={(e) => setRejectionReason(e.target.value)}
               />
               <div className="flex gap-2 pt-2">
                 <Button variant="ghost" className="flex-1" onClick={() => setRejectingReq(null)}>Cancelar</Button>
                 <Button 
                   className="flex-1 bg-rose-600 hover:bg-rose-700 shadow-md" 
                   disabled={actionLoading === rejectingReq.id}
                   onClick={handleReject}
                 >
                   {actionLoading === rejectingReq.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirmar Rechazo'}
                 </Button>
               </div>
             </CardContent>
           </Card>
        </div>
      )}
    </div>
  )
}

function UserIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function PhoneIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}
