// /pages/api/cambiar-contrasena.js

import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { token, contrasena } = req.body;

    if (!token || !contrasena) {
      return res.status(400).json({ message: 'Token y nueva contraseña son requeridos.' });
    }

    try {
      // Verificar el token JWT de restablecimiento
      const decoded = jwt.verify(token, process.env.JWT_RESET_SECRET);
      const correo = decoded.correo;

      // Buscar al usuario por correo
      const usuario = await prisma.usuario.findUnique({
        where: { correo },
      });

      if (!usuario) {
        return res.status(400).json({ message: 'Usuario no encontrado.' });
      }

      // Hashear la nueva contraseña
      const hashedPassword = crypto.createHash('sha256').update(contrasena).digest('hex');

      // Actualizar la contraseña del usuario en el campo 'contrasena'
      await prisma.usuario.update({
        where: { correo },
        data: {
          contrasena: hashedPassword, // Actualizamos el campo 'contrasena' con el hash
        },
      });

      return res.status(200).json({ message: 'Contraseña actualizada exitosamente. Redirigiendo al login...' });
    } catch (error) {
      console.error('Error al cambiar la contraseña:', error);
      return res.status(400).json({ message: 'Token inválido o expirado.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Método ${req.method} no permitido.` });
  }
}
