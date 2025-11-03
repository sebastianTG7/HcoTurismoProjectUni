import type { APIRoute } from 'astro';
import { db, Comment, User, CommentReport } from 'astro:db';
import { eq } from 'astro:db';

export const prerender = false;

export const GET: APIRoute = async ({ url, cookies }) => {
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

    const section = url.searchParams.get('section');

    if (!section) {
      return new Response(JSON.stringify({ 
        message: 'Sección requerida' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Obtener comentarios, usuarios y reportes
    const [comments, users, reports] = await Promise.all([
      db.select().from(Comment).where(eq(Comment.section, section)),
      db.select().from(User),
      db.select().from(CommentReport)
    ]);

    const userMap = new Map(users.map(u => [u.id, u]));
    
    // Agrupar reportes por comentario
    const reportsMap = new Map();
    reports.forEach(report => {
      if (!reportsMap.has(report.commentId)) {
        reportsMap.set(report.commentId, []);
      }
      const reportedByUser = userMap.get(report.reportedBy);
      reportsMap.get(report.commentId).push({
        id: report.id,
        reason: report.reason,
        reportedByUser: reportedByUser?.nombre || 'Usuario desconocido',
        createdAt: report.createdAt
      });
    });

    // Construir respuesta
    const commentsWithReports = comments.map(comment => {
      const user = userMap.get(comment.userId);
      const commentReports = reportsMap.get(comment.id) || [];
      
      return {
        id: comment.id,
        content: comment.content,
        likes: comment.likes,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        user: {
          id: user?.id,
          nombre: user?.nombre,
          usuario: user?.usuario
        },
        reports: commentReports
      };
    }).sort((a, b) => {
      // Primero los reportados, luego por fecha
      if (a.reports.length > 0 && b.reports.length === 0) return -1;
      if (a.reports.length === 0 && b.reports.length > 0) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return new Response(JSON.stringify({ 
      comments: commentsWithReports 
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
