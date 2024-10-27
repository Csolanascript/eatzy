import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { productos, precioTotal, correo } = req.body;

    // Verificar que los datos requeridos estén presentes
    if (!productos || !precioTotal || !correo) {
      return res.status(400).json({ message: 'Faltan datos requeridos en la solicitud' });
    }

    try {
      // Crear un nuevo pedido junto con los productos relacionados en la tabla `contiene`
      const nuevoPedido = await prisma.pedido.create({
        data: {
          fecha: new Date(),
          precio_total: parseFloat(precioTotal), // Asegúrate de que sea un número decimal válido
          correo, // Correo del cliente autenticado
          contiene: {
            create: productos.map((producto) => ({
              nombre_producto: producto.nombre_producto,
              unidades: producto.cantidad,
              nombre: producto.nombre_restaurante,
              localidad: producto.localidad,
            })),
          },
        },
        include: { contiene: true }, // Incluir la relación con `contiene` para obtener los productos asociados
      });

      // Enviar correo al propietario del restaurante
      const transporter = nodemailer.createTransport({
        service: 'Gmail', // Puedes usar Gmail o cualquier otro servicio de email
        auth: {
          user: process.env.EMAIL_USER, // Dirección de correo del remitente
          pass: process.env.EMAIL_PASS, // Contraseña o App Password
        },
      });

      // Obtener el correo del propietario del restaurante desde la base de datos usando nombre_restaurante y localidad
      const propietarioCorreo = await prisma.restaurante.findUnique({
        where: {
          nombre_localidad: {
            nombre: productos[0].nombre_restaurante, // Nombre del restaurante en el producto
            localidad: productos[0].localidad,        // Localidad del restaurante en el producto
          }
        },
        select: {
          usuario: {
            select: {
              correo: true  // Seleccionar solo el correo del propietario
            }
          }
        }
      });

      // Extraer el correo del propietario si existe
      const correoPropietario = propietarioCorreo?.usuario?.correo;

      if (!correoPropietario) {
        return res.status(400).json({ message: 'Correo del propietario no encontrado' });
      }

      // Configuración del correo
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: correoPropietario,
        subject: 'Nuevo Pedido Recibido - Eatzy',
        html: `
          <p>Estimado propietario,</p>
          <p>Ha recibido un nuevo pedido de un cliente. Los detalles del pedido son los siguientes:</p>
          <ul>
            ${productos.map(
              (producto) => `
              <li>${producto.cantidad}x ${producto.nombre_producto} en ${producto.nombre_restaurante}</li>`
            ).join('')}
          </ul>
          <p>Total del pedido: €${precioTotal}</p>
          <p>Por favor, revise su sistema para gestionar el pedido.</p>
          <p>Saludos,<br/>Eatzy</p>
        `,
      };

      // Enviar el correo
      await transporter.sendMail(mailOptions);

      // Respuesta exitosa
      res.status(200).json({ message: 'Pedido creado exitosamente y notificación enviada', pedido: nuevoPedido });
    } catch (error) {
      console.error('Error al crear el pedido o enviar la notificación:', error);
      res.status(500).json({ message: 'Error al crear el pedido', error: error.message });
    }
  } else if (req.method === 'GET') {
    const { correo } = req.query;

    if (!correo) {
      return res.status(400).json({ error: 'Correo del cliente no proporcionado' });
    }

    try {
      // Obtener los pedidos del cliente autenticado, incluyendo los productos relacionados
      const pedidos = await prisma.pedido.findMany({
        where: {
          correo,
        },
        include: {
          contiene: true, // Incluir los productos asociados al pedido
        },
      });

      // Respuesta con los pedidos del cliente
      res.status(200).json(pedidos);
    } catch (error) {
      console.error('Error al obtener los pedidos:', error);
      res.status(500).json({ error: 'Error al obtener los pedidos', error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Método no permitido' });
  }
}
