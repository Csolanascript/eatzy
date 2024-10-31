import prisma from '../../prisma';
import multer from 'multer';
import path from 'path';

// Configuración de multer para la subida de imágenes
const storage = multer.diskStorage({
  destination: './public/uploads', // Carpeta para guardar las imágenes subidas
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({ storage });
const uploadMiddleware = upload.single('foto');

export const config = {
  api: {
    bodyParser: false, // Desactivar el body parser para manejar el archivo correctamente
  },
};

// Endpoint para crear un restaurante
export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Ejecutar el middleware de subida antes de procesar el body
    uploadMiddleware(req, res, async (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error al subir la imagen' });
      }

      try {
        // Desestructurar los datos del body después de que multer los procese
        const { nombre, localidad, propietarioCorreo, categoria, numtelefono } = req.body;

        // Validación de los campos requeridos
        if (!nombre || !localidad || !propietarioCorreo) {
          return res.status(400).json({ error: 'Todos los campos obligatorios no están presentes' });
        }

        // Opcionalmente, obtener la ruta del archivo subido
        const fotoPath = req.file ? `/uploads/${req.file.filename}` : null;

        // Crear el restaurante en la base de datos
        const nuevoRestaurante = await prisma.restaurante.create({
          data: {
            nombre,
            localidad,
            correo: propietarioCorreo,
            categoria: categoria || null,
            numtelefono: numtelefono || null,
            foto: fotoPath, // Guardar la ruta de la imagen en la BD, si existe
          },
        });

        return res.status(201).json(nuevoRestaurante);
      } catch (error) {
        console.error('Error al añadir restaurante:', error);
        return res.status(500).json({ error: 'Error al añadir restaurante' });
      }
    });
  } else {
    // Solo permitir el método POST
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Método ${req.method} no permitido`);
  }
}
