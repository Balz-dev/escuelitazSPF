import React from 'react'
import { Building2 } from 'lucide-react'

export interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden w-1/2 flex-col justify-between bg-zinc-950 p-12 text-zinc-50 lg:flex dark:border-r">
        <div className="flex items-center gap-2 font-medium">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Building2 size={18} />
          </div>
          Escuelitaz SPF
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Plataforma Inteligente</h1>
          <p className="text-lg text-zinc-400">
            SaaS moderno para la administración de Sociedades de Padres de Familia. Transparencia impulsada por datos.
          </p>
        </div>
        <div className="text-sm text-zinc-500">
          © {new Date().getFullYear()} Escuelitaz SPF. Arquitectura Avanzada.
        </div>
      </div>
      
      <div className="flex flex-1 flex-col items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-6">
          <div className="flex flex-col space-y-2 text-center lg:text-left">
            <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
