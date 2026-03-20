/**
 * Configuración global de la aplicación.
 * Centraliza valores que pueden cambiar según el entorno o la administración.
 */

export const APP_CONFIG = {
  // Número de WhatsApp de soporte técnico / asesor comercial
  // Se intenta leer de una variable de entorno, con un fallback predeterminado.
  supportPhone: process.env.NEXT_PUBLIC_SUPPORT_PHONE || '522791109820',
  
  // URL base de la aplicación para enlaces de invitación
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  
  // Nombre de la marca / aplicación
  brandName: 'Escuelitaz SPF',
}
