import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { correo, contrasena } = req.body;

    try {
      // Busca el usuario en la base de datos por correo
      const user = await prisma.usuario.findUnique({
        where: { correo },
      });

      // Si el usuario no existe
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      // Verifica si la contraseña es correcta
      if (user.contrasena === contrasena) {
        // Devuelve el tipo de usuario: Cliente o Propietario
        return res.status(200).json({ 
          message: 'Autenticación exitosa', 
          tipo: user.tipo  // Aquí se devuelve el tipo de usuario
        });
      } else {
        return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
      }
    } catch (error) {
      console.error("Error en el servidor:", error); // Log detallado del error
      return res.status(500).json({ message: 'Error del servidor', error: error.message });
    }
  } else {
    return res.status(405).json({ message: 'Método no permitido' });
  }
}
