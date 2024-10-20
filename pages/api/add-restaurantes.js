import prisma from '../../prisma';  // Asegúrate de que la instancia de Prisma está configurada correctamente

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { nombre, localidad, propietarioCorreo, categoria, numtelefono } = req.body;

      // Verificar que los datos estén presentes
      if (!nombre || !localidad || !propietarioCorreo) {
        return res.status(400).json({ error: 'Todos los campos obligatorios no están presentes' });
      }

      // Crear el restaurante en la base de datos usando claves compuestas
      const nuevoRestaurante = await prisma.restaurante.create({
        data: {
          nombre,
          localidad,
          correo: propietarioCorreo,  // Relacionar el restaurante con el propietario
          categoria: categoria || null,  // Si proporcionas más datos
          numtelefono: numtelefono || null, // Si proporcionas más datos
        },
      });

      // Responder con el restaurante recién creado
      return res.status(201).json(nuevoRestaurante);
    } catch (error) {
      console.error('Error al añadir restaurante:', error);
      return res.status(500).json({ error: 'Error al añadir restaurante' });
    }
  } else {
    // Si el método no es POST, devolver un error 405
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
