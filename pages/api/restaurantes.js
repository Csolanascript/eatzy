import prisma from '../../prisma';  // Importar la instancia de Prisma desde prisma.js

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { propietarioCorreo, searchQuery, ubicacion } = req.query;

      console.log('Propietario Correo:', propietarioCorreo);  // Para verificar el correo del propietario

      // 1. Obtener restaurantes de un propietario específico por correo
      if (propietarioCorreo) {
        const restaurantes = await prisma.restaurante.findMany({
          where: {
            correo: propietarioCorreo, // Filtrar por correo del propietario
          },
        });

        console.log('Restaurantes obtenidos:', restaurantes);  // Verificar los datos obtenidos

        return res.status(200).json(restaurantes);
      }

      // 2. Búsqueda por coincidencia de letras en el nombre
      if (searchQuery) {
        const restaurantes = await prisma.restaurante.findMany({
          where: {
            nombre: {
              contains: searchQuery, // Coincidencias parciales en el nombre
              mode: 'insensitive',   // Búsqueda insensible a mayúsculas/minúsculas
            },
          },
        });
        return res.status(200).json(restaurantes);
      }

      // 3. Filtrar restaurantes por ubicación
      if (ubicacion) {
        const restaurantes = await prisma.restaurante.findMany({
          where: {
            ubicacion: {
              equals: ubicacion,  // Comparar ubicación exacta
            },
          },
        });
        return res.status(200).json(restaurantes);
      }

      // Si no se proporcionan filtros, obtener todos los restaurantes
      const restaurantes = await prisma.restaurante.findMany();
      return res.status(200).json(restaurantes);
    } catch (error) {
      console.error('Error al obtener los restaurantes:', error);
      return res.status(500).json({ error: 'Error al obtener los restaurantes' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
