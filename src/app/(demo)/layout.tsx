"use client"

import React from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { db } from '@/infrastructure/offline/db'
import { RefreshCcw, Home, Info, ArrowLeft } from 'lucide-react'

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isResetting, setIsResetting] = React.useState(false)

  const handleReset = async () => {
    setIsResetting(true)
    await db.alumnos.clear()
    await db.transacciones.clear()
    window.location.reload()
  }

  const isSelector = pathname === '/demo'

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Demo Bar */}
      <nav className="h-14 border-b bg-card/50 backdrop-blur-md sticky top-0 z-50 px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {!isSelector && (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/demo">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Cambiar Rol
              </Link>
            </Button>
          )}
          <div className="flex items-center gap-2">
            <span className="text-xs font-black bg-primary text-primary-foreground px-2 py-0.5 rounded-full tracking-tighter uppercase italic">
              MODO DEMO
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleReset} 
            disabled={isResetting}
            title="Reiniciar base de datos local"
          >
            <RefreshCcw className={`h-4 w-4 mr-2 ${isResetting ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Reiniciar Datos</span>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Salir</span>
            </Link>
          </Button>
        </div>
      </nav>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto py-4">
           {children}
        </div>
      </main>

      {/* Bottom Info Bar */}
      <footer className="h-10 border-t bg-muted/30 flex items-center justify-center px-4">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase font-medium tracking-widest">
          <Info size={12} />
          <span>Los datos mostrados son ficticios y solo persisten localmente en este navegador.</span>
        </div>
      </footer>
    </div>
  )
}
