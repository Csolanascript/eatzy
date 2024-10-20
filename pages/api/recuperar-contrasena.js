// /pages/api/recuperar-contrasena.js

import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { correo } = req.body;

    if (!correo) {
      return res.status(400).json({ message: 'Correo es requerido.' });
    }

    try {
      // Buscar el usuario por correo
      const usuario = await prisma.usuario.findUnique({
        where: { correo },
      });

      if (!usuario) {
        return res.status(200).json({ message: 'Este correo no está asignado a ninguna cuenta' });
      }

      // Generar un token JWT específico para el restablecimiento de contraseña
      const resetToken = jwt.sign(
        { correo: usuario.correo },
        process.env.JWT_RESET_SECRET, // Clave secreta diferente para reset
        { expiresIn: '1h' } // Token válido por 1 hora
      );
      console.log('JWT_RESET_SECRET:', process.env.JWT_RESET_SECRET);

      
      // Definir el enlace de restablecimiento
      const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/cambiar-contrasena?token=${resetToken}`;
      console.log(`Enlace de restablecimiento generado: ${resetLink}`);


      // Configurar el transporter de nodemailer
      console.log('Configurando el transporter de Nodemailer...');
      const transporter = nodemailer.createTransport({
        service: 'Gmail', // Puedes usar otro servicio como SendGrid, Mailgun, etc.
        auth: {
          user: process.env.EMAIL_USER, // Tu correo electrónico
          pass: process.env.EMAIL_PASS, // Tu contraseña o app password
        },
      });

      // Verificar la conexión SMTP
      console.log('Verificando la conexión SMTP...');
      await transporter.verify();
      console.log('Conexión SMTP exitosa.');


      // Configurar el correo electrónico
      /*const mailOptions = {
        from: process.env.EMAIL_USER,
        to: correo,
        subject: 'Recuperación de Contraseña - Eatzy',
        text: `Hola,

Recibimos una solicitud para restablecer tu contraseña. Haz clic en el siguiente enlace para cambiarla:

${resetLink}

Este enlace expirará en 1 hora.

Si no solicitaste esto, por favor ignora este correo.

Saludos,
El equipo de Eatzy`,
      };
*/

      // Configurar el correo electrónico
// Configurar el correo electrónico
const mailOptions = {
  from: process.env.EMAIL_USER,
  to: correo,
  subject: 'Recuperación de Contraseña - Eatzy',
  html: `
    <p>Hola,</p>
    <p>Recibimos una solicitud para restablecer tu contraseña. Haz clic en el siguiente enlace para cambiarla:</p>
    <p>
      <a href="${resetLink}" style="color: blue; text-decoration: underline;">
        Restablecer Contraseña
      </a>
    </p>
    <p>Este enlace expirará en 1 hora.</p>
    <p>Si no solicitaste esto, por favor ignora este correo.</p>
    <p>Saludos,<br/>El equipo de Eatzy</p>
  `,
};



      console.log(`Enviando correo a: ${correo}`);
      // Enviar el correo electrónico
      await transporter.sendMail(mailOptions);
      console.log('Correo enviado exitosamente.');

      return res.status(200).json({ message: 'Se ha enviado un enlace para restablecer la contraseña.' });
    } catch (error) {
      console.error('Error en la recuperación de contraseña:', error);
      return res.status(500).json({ message: 'Error del servidor.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Método ${req.method} no permitido.` });
  }
}

