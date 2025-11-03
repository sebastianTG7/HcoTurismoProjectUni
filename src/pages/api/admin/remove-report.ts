import type { APIRoute } from 'astro';
import { db, CommentReport } from 'astro:db';
import { eq } from 'astro:db';

export const prerender = false;

export const DELETE: APIRoute = async ({ request, cookies }) => {
  try {
    // Verificar que el usuario es admin
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

    if (session.rol !== 'admin') {
      return new Response(JSON.stringify({ 
        message: 'Acceso denegado - Solo administradores' 
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { reportId } = await request.json();

    if (!reportId) {
      return new Response(JSON.stringify({ 
        message: 'ID de reporte requerido' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Eliminar el reporte
    await db.delete(CommentReport).where(eq(CommentReport.id, reportId));

    return new Response(JSON.stringify({ 
      message: 'Reporte eliminado exitosamente'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error al eliminar reporte:', error);
    return new Response(JSON.stringify({ 
      message: 'Error al eliminar reporte' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
