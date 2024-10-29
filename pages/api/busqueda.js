import prisma from '../../prisma';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { localidad, nombre } = req.query;

  if (!localidad) {
    return res.status(400).json({ error: 'El parámetro localidad es obligatorio' });
  }

  try {
    const restaurantes = await prisma.restaurante.findMany({
      where: {
        localidad: {
          equals: localidad,
        },
        nombre: {
          startsWith: nombre, // Filtra los nombres que comienzan con el término de búsqueda
          mode: 'insensitive', // Ignora mayúsculas/minúsculas
        },
      },
      select: {
        nombre: true,
        localidad: true,
        numtelefono: true,
        categoria: true,
        correo: true,
      },
    });

    res.status(200).json(restaurantes);
  } catch (error) {
    console.error('Error al obtener restaurantes:', error);
    res.status(500).json({ error: 'Error al obtener los restaurantes' });
  }
}
