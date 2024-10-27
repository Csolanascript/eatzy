import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { correo, contrasena } = req.body;

    try {
      // Buscar el usuario en la base de datos por correo
      const user = await prisma.usuario.findUnique({
        where: { correo },
        select: {
          correo: true,
          tipo: true,
          nombre_usuario: true, 
          localidad: true,    
          contrasena: true,
        },
      });

      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      // Hashear la contraseña ingresada
      const hashedPassword = crypto.createHash('sha256').update(contrasena).digest('hex');

      // Comparar la contraseña hasheada con la almacenada en la base de datos
      if (hashedPassword !== user.contrasena) {
        return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
      }

      // Generar el token JWT si la autenticación es exitosa
      const token = jwt.sign(
        { 
          correo: user.correo, 
          tipo: user.tipo,
          nombreUsuario: user.nombre_usuario, 
          localidad: user.localidad,
        },  
        process.env.JWT_SECRET,  
        { expiresIn: '1d' }  
      );

      // Responder con el token y tipo de usuario
      return res.status(200).json({
        message: 'Autenticación exitosa',
        token,  
        tipo: user.tipo,
      });

    } catch (error) {
      console.error('Error en el servidor:', error);
      return res.status(500).json({ message: 'Error del servidor' });
    }
  } else {
    return res.status(405).json({ message: 'Método no permitido' });
  }
}
