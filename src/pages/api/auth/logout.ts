import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ cookies }) => {
  try {
    // Eliminar la cookie de sesión
    cookies.delete('session', {
      path: '/'
    });

    return new Response(JSON.stringify({ 
      message: 'Sesión cerrada exitosamente' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    return new Response(JSON.stringify({ 
      message: 'Error al cerrar sesión' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
