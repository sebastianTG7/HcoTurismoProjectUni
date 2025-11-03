import type { APIRoute } from 'astro';
import { db, Comment, CommentLike, CommentReport, eq } from 'astro:db';

export const prerender = false;

export const DELETE: APIRoute = async ({ request, cookies }) => {
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

    const { commentId } = await request.json();

    if (!commentId) {
      return new Response(JSON.stringify({ 
        message: 'ID de comentario requerido' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verificar que el comentario existe y pertenece al usuario
    const comments = await db.select().from(Comment).where(eq(Comment.id, commentId));
    
    if (comments.length === 0) {
      return new Response(JSON.stringify({ 
        message: 'Comentario no encontrado' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const comment = comments[0];

    // Permitir eliminación si es el dueño O si es admin
    if (comment.userId !== session.id && session.rol !== 'admin') {
      return new Response(JSON.stringify({ 
        message: 'No tienes permiso para eliminar este comentario' 
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Eliminar likes del comentario
    await db.delete(CommentLike).where(eq(CommentLike.commentId, commentId));

    // Eliminar reportes del comentario
    await db.delete(CommentReport).where(eq(CommentReport.commentId, commentId));

    // Eliminar comentario
    await db.delete(Comment).where(eq(Comment.id, commentId));

    return new Response(JSON.stringify({ 
      message: 'Comentario eliminado exitosamente'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error al eliminar comentario:', error);
    return new Response(JSON.stringify({ 
      message: 'Error al eliminar comentario' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
