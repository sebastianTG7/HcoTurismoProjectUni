import type { APIRoute } from 'astro';
import { db, Comment, User, CommentLike } from 'astro:db';
import { eq } from 'astro:db';

export const prerender = false;

export const GET: APIRoute = async ({ url, cookies }) => {
  try {
    const section = url.searchParams.get('section');

    if (!section) {
      return new Response(JSON.stringify({ 
        message: 'Sección requerida' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Obtener sesión del usuario actual
    const sessionCookie = cookies.get('session');
    let currentUserId = null;
    if (sessionCookie) {
      try {
        const session = JSON.parse(sessionCookie.value);
        currentUserId = session.id;
      } catch (e) {
        // Sesión inválida
      }
    }

    // Obtener comentarios de la sección
    const comments = await db.select().from(Comment).where(eq(Comment.section, section));
    
    // Obtener usuarios
    const users = await db.select().from(User);
    const userMap = new Map(users.map(u => [u.id, u]));

    // Obtener likes
    const likes = await db.select().from(CommentLike);
    const likesMap = new Map<number, Set<number>>();
    likes.forEach(like => {
      if (!likesMap.has(like.commentId)) {
        likesMap.set(like.commentId, new Set());
      }
      likesMap.get(like.commentId)?.add(like.userId);
    });

    // Construir respuesta con información del usuario
    const commentsWithUser = comments.map(comment => {
      const user = userMap.get(comment.userId);
      const commentLikes = likesMap.get(comment.id) || new Set();
      const likedByCurrentUser = currentUserId ? commentLikes.has(currentUserId) : false;
      
      return {
        id: comment.id,
        content: comment.content,
        likes: commentLikes.size,
        likedByUser: likedByCurrentUser,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        user: {
          id: user?.id,
          nombre: user?.nombre,
          usuario: user?.usuario
        },
        isOwner: currentUserId === comment.userId
      };
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return new Response(JSON.stringify({ 
      comments: commentsWithUser 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error al obtener comentarios:', error);
    return new Response(JSON.stringify({ 
      message: 'Error al obtener comentarios' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
