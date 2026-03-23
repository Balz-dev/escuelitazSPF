// @ts-ignore: Deno library
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore: Deno library
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// @ts-ignore: Deno Request type
serve(async (req: any) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const adminClient = createClient(
      // @ts-ignore: Deno.env
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore: Deno.env
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { identifier } = await req.json();

    if (!identifier) {
      return new Response(
        JSON.stringify({ error: 'Falta parámetro: identifier' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // 1. Obtener el user_id usando nuestra RPC
    const { data: userId, error: rpcError } = await adminClient.rpc('get_user_id_by_identifier', { 
      p_identifier: identifier 
    });

    if (rpcError || !userId) {
      // Por seguridad, retornamos success aunque falle para evitar enumeración de usuarios
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Si el usuario existe y pertenece a una escuela, su director ha sido notificado.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // 2. Obtener las escuelas del usuario
    const { data: memberships, error: memberError } = await adminClient
      .from('school_members')
      .select('school_id')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (memberError || !memberships || memberships.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Si el usuario existe y pertenece a una escuela, su director ha sido notificado.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // 3. Crear una solicitud por cada escuela a la que pertenece
    const resetRequests = memberships.map((m: any) => ({
      user_id: userId,
      school_id: m.school_id,
      status: 'pending'
    }));

    await adminClient
      .from('password_reset_requests')
      .insert(resetRequests);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Si el usuario existe y pertenece a una escuela, su director ha sido notificado.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    const err = error as Error;
    // En recuperación de contraseña, NO arrojamos 400 si no encontramos al usuario por razones de seguridad
    console.error('Password reset request error:', err.message);
    return new Response(
      JSON.stringify({ 
         success: true, 
         message: 'Si el usuario existe y pertenece a una escuela, su director ha sido notificado.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  }
});
