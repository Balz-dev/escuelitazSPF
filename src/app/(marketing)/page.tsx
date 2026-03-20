import React from 'react'
import { Button } from '@/components/ui/button'
import { ShieldCheck, Zap, BarChart3, Users } from 'lucide-react'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Navbar simplificada */}
      <header className="px-6 lg:px-12 py-6 flex items-center justify-between border-b">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="bg-primary text-primary-foreground p-1 rounded-md">🏫</div>
          <span>Escuelitaz SPF</span>
        </div>
        <nav className="hidden md:flex gap-8 text-sm font-medium">
          <a href="#features" className="hover:text-primary transition-colors">Funciones</a>
          <a href="#demo" className="hover:text-primary transition-colors">Demo</a>
          <a href="#pricing" className="hover:text-primary transition-colors">Precios</a>
        </nav>
        <div className="flex gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Acceder</Link>
          </Button>
          <Button asChild>
            <Link href="/demo" className="bg-primary shadow-lg shadow-primary/20 hover:shadow-primary/30">
              Ver Demo Gratis
            </Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-24 px-6 lg:px-12 max-w-7xl mx-auto flex flex-col items-center text-center space-y-8">
          <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20 animate-pulse">
            Nueva Version 2.0 con IA
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight max-w-4xl leading-tight">
            La plataforma líder para <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-secondary">Sociedades de Padres</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Digitaliza la transparencia, simplifica las cuotas y fortalece la comunicación escolar con nuestra arquitectura offline-first de alto rendimiento.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Button size="lg" className="px-10 h-14 text-lg bg-primary hover:scale-105 transition-transform" asChild>
              <Link href="/demo">No esperes, prueba la Demo</Link>
            </Button>
            <Button variant="outline" size="lg" className="px-10 h-14 text-lg hover:bg-accent transition-colors" asChild>
              <Link href="/register">Registrar mi Escuela</Link>
            </Button>
          </div>
          <div className="pt-12 w-full max-w-5xl rounded-2xl border bg-card/50 overflow-hidden shadow-[0_0_50px_-12px_rgba(var(--primary),0.2)]">
            <div className="bg-muted h-8 w-full border-b flex px-4 items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-destructive/60"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-500/60"></div>
              <div className="h-3 w-3 rounded-full bg-green-500/60"></div>
            </div>
            <div className="aspect-video bg-zinc-950/40 backdrop-blur-sm flex items-center justify-center text-zinc-500 font-medium tracking-widest text-sm uppercase">
              Interactive Dashboard Preview
            </div>
          </div>
        </section>

        {/* Features Minimalistas */}
        <section className="py-20 bg-muted/30 border-y" id="features">
          <div className="px-6 lg:px-12 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <FeatureCard icon={ShieldCheck} title="Transparencia Total" desc="Reportes financieros automáticos para todos los padres de familia." />
            <FeatureCard icon={Zap} title="Offline-First" desc="Registra pagos y asistencia sin conexión internet en la escuela." />
            <FeatureCard icon={BarChart3} title="Multi-Tenant" desc="Seguridad aislada al 100% para cada institución escolar." />
            <FeatureCard icon={Users} title="Roles Dinámicos" desc="Vistas personalizadas para Directores, Maestros y Padres." />
          </div>
        </section>
      </main>

      <footer className="py-12 border-t px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-muted-foreground bg-card">
        <p>© 2026 Escuelitaz SPF. Todos los derechos reservados.</p>
        <div className="flex gap-8">
          <a href="#" className="hover:text-primary transition-colors">Términos</a>
          <a href="#" className="hover:text-primary transition-colors">Privacidad</a>
          <a href="#" className="hover:text-primary transition-colors">Soporte</a>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="space-y-4 p-2">
      <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center shadow-inner">
        <Icon size={24} className="text-primary" />
      </div>
      <h3 className="font-bold text-xl tracking-tight">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  )
}
