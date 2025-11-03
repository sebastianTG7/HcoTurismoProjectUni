import { db, User } from 'astro:db';

// https://astro.build/db/seed
export default async function seed() {
	// Crear usuario admin por defecto
	await db.insert(User).values([
		{
			id: 1,
			nombre: 'Administrador',
			usuario: 'admin',
			correo: 'admin@huanuco.com',
			contrasena: 'admin', // En producción usar hash
			rol: 'admin',
			createdAt: new Date()
		}
	]);
	
	console.log('✅ Usuario admin creado: usuario=admin, contraseña=admin');
}
