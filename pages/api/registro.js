// pages/api/usuario/crear.js

import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const {
      correo,
      nombre_usuario,
      contrasena,
      localidad,
      calle,
      piso,
      numero,
      codigo_postal,
      tipo,
    } = req.body;

    // Verifica si todos los campos están presentes
    if (
      !correo ||
      !nombre_usuario ||
      !contrasena ||
      !localidad ||
      !calle ||
      !piso ||
      !numero ||
      !codigo_postal ||
      !tipo
    ) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    try {
      // Hashear la contraseña utilizando SHA-256
      const hashedPassword = crypto.createHash('sha256').update(contrasena).digest('hex');

      // Crear un nuevo usuario con la contraseña hasheada
      const usuario = await prisma.usuario.create({
        data: {
          correo,
          nombre_usuario,
          contrasena: hashedPassword, // Guardar la contraseña hasheada
          localidad,
          calle,
          piso,
          numero: parseInt(numero), // Convertir a entero
          codigo_postal,
          tipo,
        },
      });

      // Enviar respuesta con el usuario creado
      res.status(201).json(usuario);
    } catch (error) {
      // Manejar errores específicos de Prisma
      if (error.code === 'P2002') {
        // Código de error de Prisma para clave duplicada
        res.status(409).json({
          error: 'El correo ya está en uso. Por favor, usa un correo diferente.',
        });
      } else {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el usuario' });
      }
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Método ${req.method} no permitido`);
  }
}
