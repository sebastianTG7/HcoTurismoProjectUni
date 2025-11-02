import type { APIRoute } from 'astro';
import { db, Comment } from 'astro:db';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Verificar sesión
    const sessionCookie = cookies.get('session');
    if (!sessionCookie) {
      return new Response(JSON.stringify({ 
        message: 'Debes iniciar sesión para comentar' 
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

    const { section, content } = await request.json();

    if (!section || !content) {
      return new Response(JSON.stringify({ 
        message: 'Sección y contenido son requeridos' 
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

    // Validar sección
    const validSections = ['historia', 'cultura', 'gastronomia', 'naturaleza', 'turismo'];
    if (!validSections.includes(section)) {
      return new Response(JSON.stringify({ 
        message: 'Sección inválida' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Obtener el último ID para generar uno nuevo
    const allComments = await db.select().from(Comment);
    const maxId = allComments.length > 0 
      ? Math.max(...allComments.map(c => c.id))
      : 0;
    const newId = maxId + 1;

    // Insertar comentario
    const result = await db.insert(Comment).values({
      id: newId,
      userId: session.id,
      section,
      content: content.trim(),
      likes: 0,
      createdAt: new Date()
    }).returning();

    return new Response(JSON.stringify({ 
      message: 'Comentario creado exitosamente',
      comment: result[0]
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error al crear comentario:', error);
    return new Response(JSON.stringify({ 
      message: 'Error al crear comentario' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
