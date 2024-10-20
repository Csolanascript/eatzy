import prisma from '../../prisma'; // Asegúrate de que el path sea correcto

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { nombreProducto, precio, descripcion, restauranteNombre, localidad } = req.body;

      // Validar que los campos requeridos estén presentes
      if (!nombreProducto || !precio || !restauranteNombre || !localidad) {
        return res.status(400).json({ error: 'Faltan datos obligatorios' });
      }

      // Buscar el restaurante para asegurarse de que existe
      const restaurante = await prisma.restaurante.findUnique({
        where: {
          nombre_localidad: { // Prisma permite utilizar claves compuestas
            nombre: restauranteNombre,
            localidad: localidad,
          }
        },
      });

      if (!restaurante) {
        return res.status(404).json({ error: 'Restaurante no encontrado' });
      }

      // Crear el producto en la base de datos
      const nuevoProducto = await prisma.productos.create({
        data: {
          nombre_producto: nombreProducto,
          precio,
          descripcion,
          nombre: restauranteNombre, // Asociar el producto con el nombre del restaurante
          localidad: localidad, // Asociar el producto con la localidad del restaurante
        },
      });

      // Responder con el producto recién creado
      return res.status(201).json(nuevoProducto);
    } catch (error) {
      console.error('Error al añadir producto:', error);
      return res.status(500).json({ error: 'Error al añadir el producto' });
    }
  } else {
    // Solo permitir solicitudes POST
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Método ${req.method} no permitido`);
  }
}
