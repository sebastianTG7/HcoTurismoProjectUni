import { defineDb, defineTable, column } from 'astro:db';

const User = defineTable({
  columns: {
    id: column.number({ primaryKey: true }),
    nombre: column.text(),
    usuario: column.text({ unique: true }),
    correo: column.text({ unique: true }),
    contrasena: column.text(),
    createdAt: column.date({ default: new Date() })
  }
});

// https://astro.build/db/config
export default defineDb({
  tables: { User }
});
