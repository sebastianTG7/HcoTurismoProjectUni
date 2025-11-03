import type { APIRoute } from 'astro';
import { db, User } from 'astro:db';
import { eq } from 'astro:db';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { usuario } = await request.json();

    if (!usuario) {
      return new Response(JSON.stringify({ 
        message: 'Usuario requerido' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Buscar usuario
    const users = await db.select().from(User).where(eq(User.usuario, usuario));
    
    if (users.length === 0) {
      return new Response(JSON.stringify({ 
        message: 'Usuario no encontrado' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const user = users[0];

    // Generar contraseña temporal (8 caracteres aleatorios)
    const tempPassword = Math.random().toString(36).substring(2, 10).toUpperCase();

    // Actualizar contraseña en la base de datos
    await db.update(User)
      .set({ contrasena: tempPassword })
      .where(eq(User.id, user.id));

    return new Response(JSON.stringify({ 
      message: 'Contraseña temporal generada',
      tempPassword: tempPassword
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error en recuperación:', error);
    return new Response(JSON.stringify({ 
      message: 'Error al generar contraseña temporal' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
