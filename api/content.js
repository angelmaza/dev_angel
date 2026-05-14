// api/content.js
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const contents = await sql`SELECT * FROM content`;
    return res.status(200).json(contents);
  }
  
  if (req.method === 'POST') {
    const { title, type, rating } = req.body;
    await sql`INSERT INTO content (title, type, rating) VALUES (${title}, ${type}, ${rating})`;
    return res.status(201).json({ message: 'Añadido' });
  }
}