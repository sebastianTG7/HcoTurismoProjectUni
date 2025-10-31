import type { APIRoute } from 'astro';
import { db, User } from 'astro:db';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { nombre, usuario, correo, contrasena } = await request.json();

    // Validación básica
    if (!nombre || !usuario || !correo || !contrasena) {
      return new Response(JSON.stringify({ 
        message: 'Todos los campos son requeridos' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verificar si el usuario ya existe
    const allUsers = await db.select().from(User);
    const existingUser = allUsers.filter(u => u.usuario === usuario);
    if (existingUser.length > 0) {
      return new Response(JSON.stringify({ 
        message: 'El usuario ya existe' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verificar si el correo ya existe
    const existingEmail = allUsers.filter(u => u.correo === correo);
    if (existingEmail.length > 0) {
      return new Response(JSON.stringify({ 
        message: 'El correo ya está registrado' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Obtener el último ID
    const newId = allUsers.length > 0 ? Math.max(...allUsers.map(u => u.id)) + 1 : 1;

    // Crear nuevo usuario (en producción, encriptar la contraseña)
    await db.insert(User).values({
      id: newId,
      nombre,
      usuario,
      correo,
      contrasena, // En producción usar bcrypt para hashear
      createdAt: new Date()
    });

    return new Response(JSON.stringify({ 
      message: 'Usuario registrado exitosamente' 
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error al registrar usuario:', error);
    return new Response(JSON.stringify({ 
      message: 'Error al registrar usuario' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
