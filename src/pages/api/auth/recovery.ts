import type { APIRoute } from 'astro';
import { db, User } from 'astro:db';
import { eq } from 'astro:db';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { correo } = await request.json();

    if (!correo) {
      return new Response(JSON.stringify({ 
        message: 'Correo requerido' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Buscar usuario por correo
    const users = await db.select().from(User).where(eq(User.correo, correo));
    
    if (users.length === 0) {
      return new Response(JSON.stringify({ 
        message: 'No se encontró una cuenta con ese correo' 
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
      tempPassword: tempPassword,
      usuario: user.usuario
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
