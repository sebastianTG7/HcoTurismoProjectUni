import type { APIRoute } from 'astro';
import { db, Comment, eq } from 'astro:db';

export const prerender = false;

export const PUT: APIRoute = async ({ request, cookies }) => {
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

    const { commentId, content } = await request.json();

    if (!commentId || !content) {
      return new Response(JSON.stringify({ 
        message: 'ID de comentario y contenido son requeridos' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (content.trim().length < 1) {
      return new Response(JSON.stringify({ 
        message: 'El comentario no puede estar vacío' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (content.length > 1000) {
      return new Response(JSON.stringify({ 
        message: 'El comentario no puede exceder 1000 caracteres' 
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

    // Permitir edición si es el dueño O si es admin
    if (comment.userId !== session.id && session.rol !== 'admin') {
      return new Response(JSON.stringify({ 
        message: 'No tienes permiso para editar este comentario' 
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Actualizar comentario
    await db.update(Comment)
      .set({ 
        content: content.trim(),
        updatedAt: new Date()
      })
      .where(eq(Comment.id, commentId));

    return new Response(JSON.stringify({ 
      message: 'Comentario actualizado exitosamente'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error al actualizar comentario:', error);
    return new Response(JSON.stringify({ 
      message: 'Error al actualizar comentario' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
