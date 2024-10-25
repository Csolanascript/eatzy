import multer from 'multer';
import prisma from '../../prisma';
import path from 'path';
import fs from 'fs';

// Configurar la carpeta de almacenamiento y el nombre de los archivos subidos
const storage = multer.diskStorage({
  destination: './public/uploads', // Carpeta donde se guardarán las imágenes
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Crear el middleware para manejar la subida de un solo archivo 'foto'
const uploadMiddleware = upload.single('foto');

export const config = {
  api: {
    bodyParser: false, // Desactivar el body parser para manejar el archivo correctamente
  },
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Usar el middleware para manejar la subida del archivo
    uploadMiddleware(req, res, async (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error al subir la imagen' });
      }

      try {
        // Desestructurar los datos de la solicitud (incluye el archivo en `req.file`)
        const { nombreProducto, precio, descripcion, restauranteNombre, localidad } = req.body;

        // Validar que los campos requeridos estén presentes
        if (!nombreProducto || !precio || !restauranteNombre || !localidad) {
          return res.status(400).json({ error: 'Faltan datos obligatorios' });
        }

        // Obtener la ruta del archivo subido
        const fotoPath = req.file ? `/uploads/${req.file.filename}` : null;

        // Validar que el archivo fue subido
        if (!fotoPath) {
          return res.status(400).json({ error: 'Error al subir la foto' });
        }

        // Buscar el restaurante para asegurarse de que existe
        const restaurante = await prisma.restaurante.findUnique({
          where: {
            nombre_localidad: {
              nombre: restauranteNombre,
              localidad: localidad,
            }
          },
        });

        if (!restaurante) {
          // Si el restaurante no existe, elimina la foto subida para evitar archivos huérfanos
          fs.unlinkSync(path.join('./public', fotoPath));
          return res.status(404).json({ error: 'Restaurante no encontrado' });
        }

        // Crear el producto en la base de datos
        const nuevoProducto = await prisma.productos.create({
          data: {
            nombre_producto: nombreProducto,
            precio: parseFloat(precio),
            descripcion,
            nombre: restauranteNombre,
            localidad: localidad,
            foto: fotoPath, // Guardar la ruta de la imagen en la base de datos
          },
        });

        // Responder con el producto recién creado
        return res.status(201).json(nuevoProducto);
      } catch (error) {
        console.error('Error al añadir producto:', error);
        return res.status(500).json({ error: 'Error al añadir el producto' });
      }
    });
  } else {
    // Solo permitir solicitudes POST
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Método ${req.method} no permitido`);
  }
}
