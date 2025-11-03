import { db } from 'astro:db';

// https://astro.build/db/seed
export default async function seed() {
	// No crear usuarios por defecto por seguridad
	// La base de datos en .astro/content.db persiste entre reinicios
	console.log('ℹ️  Base de datos lista. Los datos persisten en .astro/content.db');
}
