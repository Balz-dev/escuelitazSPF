import React from 'react'
import { AuthLayout } from '@/components/layout/auth-layout'
import { Button } from '@/components/ui/button'
import { MessageCircle, ShieldAlert } from 'lucide-react'
import Link from 'next/link'
import { APP_CONFIG } from '@/config/constants'

export default function SuspendedPage() {
  return (
    <AuthLayout
      title="Acceso Restringido"
      subtitle="Tu institución no tiene un periodo de acceso activo."
    >
      <div className="space-y-6 text-center py-4">
        <div className="bg-destructive/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="h-10 w-10 text-destructive" />
        </div>

        <p className="text-muted-foreground">
          Parece que el periodo de prueba de tu escuela ha finalizado o tu cuenta ha sido suspendida temporalmente por un administrador.
        </p>

        <div className="bg-muted p-4 rounded-lg text-sm text-left border">
          <p className="font-semibold mb-1">¿Qué puedes hacer?</p>
          <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
            <li>Contactar al director de tu institución.</li>
            <li>Solicitar la renovación de la licencia.</li>
            <li>Verificar el estado de tus pagos si eres el director.</li>
          </ul>
        </div>

        <div className="pt-4">
          <Button className="w-full h-12 bg-[#25D366] hover:bg-[#20ba5a] text-white" asChild>
            <a href={`https://wa.me/${APP_CONFIG.supportPhone.replace(/\D/g, '')}?text=Hola! Mi escuela aparece como suspendida. ¿Podrían ayudarme?`} target="_blank">
              <MessageCircle className="h-5 w-5 mr-2" />
              Contactar a Soporte Técnico
            </a>
          </Button>
        </div>

        <Button variant="link" asChild className="w-full">
          <Link href="/login">Volver al inicio de sesión</Link>
        </Button>
      </div>
    </AuthLayout>
  )
}
