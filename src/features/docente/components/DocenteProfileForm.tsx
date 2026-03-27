'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SupabaseDocenteService } from '@/infrastructure/supabase/services/SupabaseDocenteService'
import { SupabaseAuthService } from '@/infrastructure/supabase/services/SupabaseAuthService'
import { Loader2, Save, User as UserIcon, Phone, GraduationCap, Building2 } from 'lucide-react'

const docenteService = new SupabaseDocenteService()
const authService = new SupabaseAuthService()

export function DocenteProfileForm() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [userId, setUserId] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [groupName, setGroupName] = useState('')
  const [schoolName, setSchoolName] = useState('')

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const user = await authService.getCurrentUser()
        if (user) {
          setUserId(user.id)
          setFullName(user.fullName || '')
          setPhone(user.phone || '')
          
          const context = await docenteService.getTeacherContext(user.id)
          if (context) {
            setSpecialty(context.specialty || '')
            setGroupName(context.groupName || 'Sin grupo asignado')
            setSchoolName(context.schoolName || 'Sin escuela')
          }
        }
      } catch (err) {
        console.error('Error cargando perfil:', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadProfile()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    setIsSaving(true)
    try {
      await docenteService.updateProfile(userId, {
        fullName,
        phone,
        specialty
      })
      alert('Perfil actualizado correctamente')
    } catch (err) {
      alert('Error: No se pudo actualizar el perfil. Intenta de nuevo.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="shadow-sm border-muted/20">
        <CardContent className="p-12 flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground animate-pulse">Cargando tu información...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-sm border-muted/20 max-w-2xl mx-auto">
      <CardHeader className="bg-muted/5 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <UserIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Mi Perfil Profesional</CardTitle>
            <CardDescription>Datos personales y asignación académica.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <form onSubmit={handleSave}>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="school" className="text-xs uppercase font-bold text-muted-foreground">Institución</Label>
              <div className="flex items-center gap-2 p-2 bg-muted/20 rounded-md border border-muted/30 text-sm font-medium">
                <Building2 className="w-4 h-4 text-primary/60" />
                {schoolName}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="group" className="text-xs uppercase font-bold text-muted-foreground">Grupo Asignado</Label>
              <div className="flex items-center gap-2 p-2 bg-muted/20 rounded-md border border-muted/30 text-sm font-medium">
                <GraduationCap className="w-4 h-4 text-blue-500/60" />
                {groupName}
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-muted/10">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-sm font-semibold">Nombre Completo</Label>
              <Input 
                id="name" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                placeholder="Tu nombre completo"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone" className="text-sm font-semibold flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5" /> Teléfono / WhatsApp
                </Label>
                <Input 
                  id="phone" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder="Ej. +52 55..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="specialty" className="text-sm font-semibold flex items-center gap-2">
                  <GraduationCap className="w-3.5 h-3.5" /> Especialidad
                </Label>
                <Input 
                  id="specialty" 
                  value={specialty} 
                  onChange={(e) => setSpecialty(e.target.value)} 
                  placeholder="Ej. Matemáticas, Primaria"
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/5 border-t p-4 flex justify-end">
          <Button type="submit" disabled={isSaving || !fullName} className="gap-2 shadow-sm min-w-[140px]">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Guardar Cambios
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
