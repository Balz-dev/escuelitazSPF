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

    // 2. Obtener las escuelas del usuario y sus roles
    const { data: memberships, error: memberError } = await adminClient
      .from('school_members')
      .select('school_id, schools(name, contact_phone), member_roles(role)')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (memberError || !memberships || memberships.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Si el usuario existe en el sistema, la petición ha sido registrada.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Determinar la primera escuela para el link de WhatsApp
    const primaryMembership = memberships[0] as any;
    // member_roles is an array when returned through join
    const rolesArray = primaryMembership.member_roles;
    const role = (Array.isArray(rolesArray) && rolesArray.length > 0) ? rolesArray[0].role : 'padre';
    const schoolName = primaryMembership.schools?.name || 'la escuela';
    const schoolPhone = primaryMembership.schools?.contact_phone;

    // Obtener información del usuario real (nombre) para el mensaje
    const { data: profile } = await adminClient
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single();
    
    const userName = profile?.full_name || identifier;

    let targetPhone = '';
    let message = '';

    // Lógica de ruteo WhatsApp Client-side
    if (role === 'director') {
      // @ts-ignore: Deno.env
      targetPhone = Deno.env.get('SUPPORT_PHONE') || '+522351086785'; // Teléfono del Soporte
      message = `Hola Soporte. Soy ${userName}, director(a) de ${schoolName}. Solicito un reseteo de mi contraseña, por favor.`;
    } else if (role === 'docente') {
      targetPhone = schoolPhone || ''; // Teléfono de contacto de la escuela (Director)
      message = `Hola Director(a). Soy ${userName}, docente. Solicito un reseteo de mi contraseña para ingresar a la plataforma, por favor.`;
    } else {
      targetPhone = schoolPhone || ''; // El mismo teléfono de la escuela sirve como canal general
      message = `Hola. Soy ${userName}, mi rol es padre de familia/estudiante. Solicito un reseteo de mi contraseña, por favor.`;
    }
    
    // Formatear la URL final
    let whatsappUrl = null;
    if (targetPhone) {
      const cleanPhone = targetPhone.replace(/\D/g, ''); // Quitar '+' y espacios
      const encodedMessage = encodeURIComponent(message);
      whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    }

    // 3. Crear una solicitud por cada escuela a la que pertenece
    const resetRequests = memberships.map((m: any) => ({
      user_id: userId,
      school_id: m.school_id,
      requester_role: role,
      status: 'pending'
    }));

    await adminClient
      .from('password_reset_requests')
      .insert(resetRequests);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: '¡Petición enviada! Por favor, avisa a tu superior o soporte por WhatsApp pulsando el botón a continuación.',
        whatsappUrl 
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
