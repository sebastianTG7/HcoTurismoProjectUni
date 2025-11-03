import type { APIRoute } from 'astro';
import { db, User } from 'astro:db';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { usuario, password } = await request.json();

    if (!usuario || !password) {
      return new Response(JSON.stringify({ 
        message: 'Usuario y contraseña son requeridos' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Buscar usuario
    const allUsers = await db.select().from(User);
    const users = allUsers.filter(u => u.usuario === usuario);
    
    if (users.length === 0) {
      return new Response(JSON.stringify({ 
        message: 'Usuario o contraseña incorrectos' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const user = users[0];

    // Verificar contraseña (en producción usar bcrypt.compare)
    if (user.contrasena !== password) {
      return new Response(JSON.stringify({ 
        message: 'Usuario o contraseña incorrectos' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Crear sesión (almacenar en cookie)
    cookies.set('session', JSON.stringify({
      id: user.id,
      usuario: user.usuario,
      nombre: user.nombre,
      rol: user.rol || 'usuario'
    }), {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 días
      httpOnly: true,
      secure: import.meta.env.PROD
    });

    return new Response(JSON.stringify({ 
      message: 'Inicio de sesión exitoso',
      user: {
        id: user.id,
        nombre: user.nombre,
        usuario: user.usuario,
        rol: user.rol || 'usuario'
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    return new Response(JSON.stringify({ 
      message: 'Error al iniciar sesión' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
