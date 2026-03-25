// @ts-ignore: Deno library
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore: Deno library
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Obtener el primer nombre en minúsculas y sin espacios
function getFirstName(fullName: string) {
  return fullName.trim().split(" ")[0].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Generar 4 dígitos aleatorios
function generateDigits() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// @ts-ignore: Deno Request type
serve(async (req: any) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      // @ts-ignore: Deno.env
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore: Deno.env
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { emailOrPhone, role, schoolId, metadata = {} } = await req.json();

    if (!emailOrPhone || !role || !schoolId || !metadata.full_name) {
      return new Response(
        JSON.stringify({ error: 'Faltan parámetros: emailOrPhone, role, schoolId, full_name' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const isEmail = emailOrPhone.includes('@');
    const firstName = getFirstName(metadata.full_name);
    const digits = generateDigits();
    
    // El "Usuario" para el mensaje es el nombre, pero para Supabase usamos el contacto (email/tel)
    // La "Clave" es nombre + 4 dígitos
    const tempPassword = `${firstName}${digits}`;

    // ESTRATEGIA PHANTOM EMAIL:
    // Si no es un email, creamos un email ficticio tipo "tel@escuelitaz.local"
    // Esto permite que el usuario use su celular como Identificador pero Supabase lo vea como Email.
    const phantomEmail = isEmail ? emailOrPhone : `${emailOrPhone.replace(/\D/g, '')}@escuelitaz.local`;
    
    // Crear el usuario con la contraseña dinámica
    const { data: userData, error: authError } = await supabaseClient.auth.admin.createUser({
      email: phantomEmail,
      // No mandamos phone a auth.users para evitar usar el provider de SMS de Supabase (que es de pago)
      password: tempPassword,
      email_confirm: true,
      user_metadata: { 
        full_name: metadata.full_name,
        username_display: firstName, // Guardamos el nombre "de usuario" en metadata
        phone_original: isEmail ? undefined : emailOrPhone, // Guardamos el tel original para referencia
        must_change_password: true 
      },
      app_metadata: {
        role, 
        school_id: schoolId
      }
    });

    if (authError) {
      console.error('Error in auth step:', authError);
      return new Response(
        JSON.stringify({ error: authError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const userId = userData.user.id;

    // 2. Vincular usuario con la escuela
    const { data: memberData, error: memberError } = await supabaseClient
      .from('school_members')
      .insert({
         school_id: schoolId,
         user_id: userId,
         is_active: true
      })
      .select('id')
      .single();

    if (memberError) {
      console.error('Error linking member:', memberError);
      // No fallamos toda la función si esto falla, pero lo logueamos
    } else if (memberData) {
      const { error: roleError } = await supabaseClient
        .from('member_roles')
        .insert({
           member_id: memberData.id,
           role: role
        });
      if (roleError) console.error('Error assigning role:', roleError);
    }

    // 3. Insertar registro en user_invitations (para historial/seguimiento)
    await supabaseClient
      .from('user_invitations')
      .insert({
         email: isEmail ? emailOrPhone : null,
         phone: isEmail ? null : emailOrPhone,
         role: role,
         school_id: schoolId,
         status: 'pending'
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        userId, 
        username: firstName,
        loginIdentifier: emailOrPhone,
        tempPassword,
        // @ts-ignore: Deno.env
        loginUrl: `${Deno.env.get('PUBLIC_URL') || 'https://escuelitazspf.pages.dev'}/login`
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
