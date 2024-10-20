import prisma from '../../prisma'; // Asegúrate de que el path sea correcto

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { nombreRestaurante, localidad } = req.query;

      if (!nombreRestaurante || !localidad) {
        return res.status(400).json({ error: 'Falta el nombre o la localidad del restaurante' });
      }

      // Consultar los productos asociados a un restaurante por nombre y localidad
      const productos = await prisma.productos.findMany({
        where: {
          nombre: nombreRestaurante,
          localidad: localidad,
        },
      });

      if (productos.length === 0) {
        return res.status(404).json({ error: 'No se encontraron productos para este restaurante' });
      }

      return res.status(200).json(productos);
    } catch (error) {
      console.error('Error al obtener los productos:', error);
      return res.status(500).json({ error: 'Error al obtener los productos' });
    }
  } else {
    // Si no es una solicitud GET, devolver un error 405
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Método ${req.method} no permitido`);
  }
}
