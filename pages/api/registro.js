// pages/api/usuario/crear.js

import { PrismaClient } from '@prisma/client';

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
      // Intentar crear un nuevo usuario
      const usuario = await prisma.usuario.create({
        data: {
          correo,
          nombre_usuario,
          contrasena,
          localidad,
          calle,
          piso,
          numero: parseInt(numero), // Asegúrate de convertirlo a entero
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
