import prisma from '../../prisma';  // Importar la instancia de Prisma desde prisma.js

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { propietarioCorreo, searchQuery, localidad } = req.query;  // Obtener correctamente 'localidad'

      console.log('Propietario Correo:', propietarioCorreo);  // Verificar el correo
      console.log('Localidad:', localidad);  // Verificar la localidad

      // 1. Obtener restaurantes de un propietario específico por correo
      if (propietarioCorreo) {
        const restaurantes = await prisma.restaurante.findMany({
          where: {
            correo: propietarioCorreo || undefined, // Filtrar por correo del propietario si existe
          },
        });

        console.log('Restaurantes obtenidos:', restaurantes);  // Verificar los datos obtenidos

        if (restaurantes.length === 0) {
          return res.status(404).json({ error: 'No se encontraron restaurantes para el propietario dado' });
        }

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

        if (restaurantes.length === 0) {
          return res.status(404).json({ error: 'No se encontraron restaurantes que coincidan con la búsqueda' });
        }

        return res.status(200).json(restaurantes);
      }

      // 3. Filtrar restaurantes por ubicación (localidad)
      if (localidad) {
        const restaurantes = await prisma.restaurante.findMany({
          where: {
            localidad: {
              equals: localidad,  // Comparar ubicación exacta
            },
          },
        });

        if (restaurantes.length === 0) {
          return res.status(404).json({ error: 'No se encontraron restaurantes en la localidad dada' });
        }

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
