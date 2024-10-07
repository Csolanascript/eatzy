
// pages/api/restaurantes.js
import prisma from '../../prisma';  // Importar la instancia de Prisma desde prisma.js

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const restaurantes = await prisma.restaurante.findMany();
      res.status(200).json(restaurantes);
    } catch (error) {
      console.error('Error al obtener los restaurantes:', error);
      res.status(500).json({ error: 'Error al obtener los restaurantes' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
