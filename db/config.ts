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

const Comment = defineTable({
  columns: {
    id: column.number({ primaryKey: true, autoIncrement: true }),
    userId: column.number({ references: () => User.columns.id }),
    section: column.text(), // 'historia', 'cultura', 'gastronomia', 'naturaleza', 'turismo'
    content: column.text(),
    likes: column.number({ default: 0 }),
    createdAt: column.date({ default: new Date() }),
    updatedAt: column.date({ optional: true })
  }
});

const CommentReport = defineTable({
  columns: {
    id: column.number({ primaryKey: true, autoIncrement: true }),
    commentId: column.number({ references: () => Comment.columns.id }),
    reportedBy: column.number({ references: () => User.columns.id }),
    reason: column.text(),
    createdAt: column.date({ default: new Date() })
  }
});

const CommentLike = defineTable({
  columns: {
    id: column.number({ primaryKey: true, autoIncrement: true }),
    commentId: column.number({ references: () => Comment.columns.id }),
    userId: column.number({ references: () => User.columns.id }),
    createdAt: column.date({ default: new Date() })
  }
});

// https://astro.build/db/config
export default defineDb({
  tables: { User, Comment, CommentReport, CommentLike }
});
