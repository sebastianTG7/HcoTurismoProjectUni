import type { APIRoute } from 'astro';
import { db, User } from 'astro:db';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { correo } = await request.json();

    if (!correo) {
      return new Response(JSON.stringify({ 
        message: 'El correo es requerido' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Buscar usuario por correo
    const allUsers = await db.select().from(User);
    const users = allUsers.filter(u => u.correo === correo);
    
    if (users.length === 0) {
      return new Response(JSON.stringify({ 
        message: 'No se encontró una cuenta con ese correo' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // En producción, aquí deberías:
    // 1. Generar un token de recuperación
    // 2. Guardarlo en la base de datos con fecha de expiración
    // 3. Enviar un correo con el enlace de recuperación
    
    // Por ahora, solo simulamos el envío
    console.log(`Enviar correo de recuperación a: ${correo}`);

    return new Response(JSON.stringify({ 
      message: 'Se ha enviado un correo con instrucciones para recuperar tu contraseña' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error al recuperar contraseña:', error);
    return new Response(JSON.stringify({ 
      message: 'Error al procesar la solicitud' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
