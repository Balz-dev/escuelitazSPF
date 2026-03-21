"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/infrastructure/supabase/client'
import { Button } from '@/components/ui/button'
import { User } from '@supabase/supabase-js'
import { ShieldAlert, LogOut, MessageSquare, Clock } from 'lucide-react'

export default function UnauthorizedPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = React.useState<User | null>(null)

  React.useEffect(() => {
    const getUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUserData()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4">
      <div className="max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Header con gradiente */}
          <div className="h-32 bg-linear-to-r from-amber-500 to-amber-600 flex items-center justify-center relative">
            <div className="absolute -bottom-6 bg-white p-4 rounded-2xl shadow-lg border border-amber-100">
              <ShieldAlert className="h-12 w-12 text-amber-500" />
            </div>
          </div>

          <div className="pt-12 pb-8 px-8 text-center space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                Acceso Pendiente
              </h1>
              <p className="text-gray-500 text-sm leading-relaxed">
                Hola {user?.user_metadata?.full_name || user?.email}, tu cuenta ha sido creada exitosamente, pero <strong>aún no tienes acceso a ninguna escuela</strong>.
              </p>
            </div>

            <div className="bg-amber-50 rounded-2xl p-4 flex items-start gap-4 text-left border border-amber-100/50">
              <Clock className="h-5 w-5 text-amber-600 mt-1 shrink-0" />
              <p className="text-xs text-amber-800 leading-snug">
                Tu acceso debe ser autorizado por el Director o Administrador de tu escuela a través de una invitación oficial.
              </p>
            </div>

            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full h-12 rounded-xl text-gray-700 hover:bg-gray-50 border-gray-200 flex items-center justify-center gap-2 transition-all"
                onClick={() => window.open('https://wa.me/something', '_blank')}
              >
                <MessageSquare className="h-4 w-4" />
                Contactar Soporte
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full h-12 rounded-xl text-rose-600 hover:bg-rose-50 hover:text-rose-700 flex items-center justify-center gap-2"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
                Cerrar Sesión / Cambiar de cuenta
              </Button>
            </div>
          </div>

          <div className="bg-gray-50 py-4 px-8 border-t border-gray-100">
            <p className="text-[10px] text-gray-400 text-center uppercase font-bold tracking-widest leading-none">
              Escuelitaz SPF • Plataforma de Gestión
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
