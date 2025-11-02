import type { APIRoute } from 'astro';
import { db, Comment, CommentReport, eq, and } from 'astro:db';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Verificar sesión
    const sessionCookie = cookies.get('session');
    if (!sessionCookie) {
      return new Response(JSON.stringify({ 
        message: 'Debes iniciar sesión' 
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

    const { commentId, reason } = await request.json();

    if (!commentId || !reason) {
      return new Response(JSON.stringify({ 
        message: 'ID de comentario y motivo son requeridos' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (reason.trim().length < 5) {
      return new Response(JSON.stringify({ 
        message: 'El motivo debe tener al menos 5 caracteres' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (reason.length > 500) {
      return new Response(JSON.stringify({ 
        message: 'El motivo no puede exceder 500 caracteres' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verificar que el comentario existe
    const comments = await db.select().from(Comment).where(eq(Comment.id, commentId));
    
    if (comments.length === 0) {
      return new Response(JSON.stringify({ 
        message: 'Comentario no encontrado' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verificar si ya reportó este comentario
    const existingReports = await db.select().from(CommentReport).where(
      and(
        eq(CommentReport.commentId, commentId),
        eq(CommentReport.reportedBy, session.id)
      )
    );

    if (existingReports.length > 0) {
      return new Response(JSON.stringify({ 
        message: 'Ya has reportado este comentario' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Crear reporte
    const allReports = await db.select().from(CommentReport);
    const maxId = allReports.length > 0 
      ? Math.max(...allReports.map(r => r.id))
      : 0;
    const newId = maxId + 1;

    await db.insert(CommentReport).values({
      id: newId,
      commentId,
      reportedBy: session.id,
      reason: reason.trim(),
      createdAt: new Date()
    });

    return new Response(JSON.stringify({ 
      message: 'Comentario reportado exitosamente. Gracias por ayudarnos a mantener la comunidad segura.'
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error al reportar comentario:', error);
    return new Response(JSON.stringify({ 
      message: 'Error al reportar comentario' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
