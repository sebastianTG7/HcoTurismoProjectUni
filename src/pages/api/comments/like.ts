import type { APIRoute } from 'astro';
import { db, Comment, CommentLike, eq, and } from 'astro:db';

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

    const { commentId } = await request.json();

    if (!commentId) {
      return new Response(JSON.stringify({ 
        message: 'ID de comentario requerido' 
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

    // Verificar si ya dio like
    const existingLikes = await db.select().from(CommentLike).where(
      and(
        eq(CommentLike.commentId, commentId),
        eq(CommentLike.userId, session.id)
      )
    );

    if (existingLikes.length > 0) {
      // Ya dio like, remover (toggle)
      await db.delete(CommentLike).where(
        and(
          eq(CommentLike.commentId, commentId),
          eq(CommentLike.userId, session.id)
        )
      );

      return new Response(JSON.stringify({ 
        message: 'Like removido',
        liked: false
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      // Dar like
      await db.insert(CommentLike).values({
        commentId,
        userId: session.id,
        createdAt: new Date()
      });

      return new Response(JSON.stringify({ 
        message: 'Like agregado',
        liked: true
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('Error al dar like:', error);
    return new Response(JSON.stringify({ 
      message: 'Error al dar like' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
