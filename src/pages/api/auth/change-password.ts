import type { APIRoute } from 'astro';
import { db, User } from 'astro:db';
import { eq } from 'astro:db';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Verificar sesión
    const sessionCookie = cookies.get('session');
    if (!sessionCookie) {
      return new Response(JSON.stringify({ 
        message: 'No autorizado' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let session;
    try {
      session = JSON.parse(sessionCookie.value);
    } catch (e) {
      return new Response(JSON.stringify({ 
        message: 'Sesión inválida' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return new Response(JSON.stringify({ 
        message: 'Contraseñas requeridas' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Buscar usuario
    const users = await db.select().from(User).where(eq(User.id, session.id));
    
    if (users.length === 0) {
      return new Response(JSON.stringify({ 
        message: 'Usuario no encontrado' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const user = users[0];

    // Verificar contraseña actual
    if (user.contrasena !== currentPassword) {
      return new Response(JSON.stringify({ 
        message: 'Contraseña actual incorrecta' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Actualizar contraseña
    await db.update(User)
      .set({ contrasena: newPassword })
      .where(eq(User.id, user.id));

    return new Response(JSON.stringify({ 
      message: 'Contraseña actualizada exitosamente'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    return new Response(JSON.stringify({ 
      message: 'Error al cambiar contraseña' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
