// /pages/api/login.js

import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

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

      console.log('Usuario encontrado:', user); // Agrega este log

      // Si el usuario no existe
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      // Comparar directamente la contraseña ingresada con la almacenada
      if (contrasena !== user.contrasena) {
        return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
      }

      // Si la autenticación es exitosa, generar el token
      const token = jwt.sign(
        { 
          correo: user.correo, 
          tipo: user.tipo,
          nombreUsuario: user.nombre_usuario, // Añadir nombreUsuario al payload
          localidad: user.localidad,         // Incluir localidad en el token
        },  
        process.env.JWT_SECRET,  // Clave secreta del JWT
        { expiresIn: '1d' }  // El token expira en 1 día
      );

      console.log('Token generado:', token);  // Verificar si el token es generado correctamente

      // Responder con el token y tipo de usuario
      return res.status(200).json({
        message: 'Autenticación exitosa',
        token,  // El token JWT que se devolverá
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















/*import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';  // Para generar tokens JWT

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { correo, contrasena } = req.body;

    try {
      // Buscar el usuario en la base de datos por correo
      const user = await prisma.usuario.findUnique({
        where: { correo },
      });

      // Si el usuario no existe
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      // Comparar directamente la contraseña ingresada con la almacenada
      if (contrasena !== user.contrasena) {
        return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
      }

      // Si la autenticación es exitosa, generar el token
      const token = jwt.sign(
        { correo: user.correo, tipo: user.tipo },  // Información del usuario
        process.env.JWT_SECRET,  // Clave secreta del JWT
        { expiresIn: '1d' }  // El token expira en 1 día
      );

      console.log('Token generado:', token);  // Verificar si el token es generado correctamente

      // Responder con el token y tipo de usuario
      return res.status(200).json({
        message: 'Autenticación exitosa',
        token,  // El token JWT que se devolverá
        tipo: user.tipo,
      });

    } catch (error) {
      console.error('Error en el servidor:', error);
      return res.status(500).json({ message: 'Error del servidor' });
    }
  } else {
    return res.status(405).json({ message: 'Método no permitido' });
  }
}*/


