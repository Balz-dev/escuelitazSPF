// @ts-ignore: Deno library
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore: Deno library
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generar clave temporal
function generateTempPassword() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let pass = 'temp';
  for (let i = 0; i < 4; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

// @ts-ignore: Deno Request type
serve(async (req: any) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Falta token de autenticación');
    }

    // Cliente que asume la identidad de quien llama para verificar permisos
    const userRoleClient = createClient(
      // @ts-ignore: Deno.env
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore: Deno.env
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Cliente Service Role para operaciones admin
    const adminClient = createClient(
      // @ts-ignore: Deno.env
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore: Deno.env
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { targetUserId } = await req.json();

    if (!targetUserId) {
      return new Response(
        JSON.stringify({ error: 'Falta parámetro: targetUserId' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // 1. Obtener el usuario que está haciendo la solicitud
    const { data: { user: caller }, error: callerError } = await userRoleClient.auth.getUser();
    if (callerError || !caller) {
      throw new Error('No autorizado');
    }

    // 2. Verificar si el caller es superadmin
    const isSuperAdmin = await adminClient
      .from('profiles')
      .select('id')
      .eq('id', caller.id)
      // Supongamos que validamos por el rol, o podríamos usar app_metadata del usuario
      // Actually `app_metadata` usually contains a custom claim for superadmin
      .single();

    const callerRole = caller.app_metadata?.role;
    
    // Si no es superadmin, entonces verificar jerarquía escolar
    if (callerRole !== 'superadmin' && callerRole !== 'director') {
      throw new Error('No tienes permisos suficientes (Requiere ser Director o SuperAdmin)');
    }

    // Opcional: Validar que el `targetUserId` pertenezca a la escuela del `director`, etc.
    // Solo para simplificar el MVP, validaremos que es un rol permitido. En producción
    // debemos verificar `school_members`.
    if (callerRole === 'director') {
      const { data: mySchools } = await adminClient
        .from('school_members')
        .select('school_id')
        .eq('user_id', caller.id);

      const schoolIds = mySchools?.map((s: any) => s.school_id) || [];
      
      const { data: targetMembership } = await adminClient
        .from('school_members')
        .select('id')
        .eq('user_id', targetUserId)
        .in('school_id', schoolIds)
        .single();
        
      if (!targetMembership) {
        throw new Error('El usuario objetivo no pertenece a tu escuela');
      }
    }

    const tempPassword = generateTempPassword();

    // 3. Resetear contraseña del targetUser usando API Admin
    const { data: updatedUser, error: updateError } = await adminClient.auth.admin.updateUserById(
      targetUserId,
      { 
        password: tempPassword,
        user_metadata: { must_change_password: true }
      }
    );

    if (updateError) {
      throw updateError;
    }

    // También forzar must_change_password public
    await adminClient
      .from('profiles')
      .update({ must_change_password: true })
      .eq('id', targetUserId);

    // Marcar como resueltas las peticiones pendientes
    await adminClient
      .from('password_reset_requests')
      .update({ 
        status: 'resolved', 
        resolved_at: new Date().toISOString(), 
        resolved_by: caller.id 
      })
      .eq('user_id', targetUserId)
      .eq('status', 'pending');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Contraseña reseteada exitosamente',
        tempPassword 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    const err = error as Error;
    return new Response(
      JSON.stringify({ error: err.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
