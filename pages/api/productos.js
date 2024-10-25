import prisma from '../../prisma'; // Make sure this path is correct

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { nombreRestaurante, localidad } = req.query;

      if (!nombreRestaurante || !localidad) {
        return res.status(400).json({ error: 'Falta el nombre o la localidad del restaurante' });
      }

      const productos = await prisma.productos.findMany({
        where: {
          nombre: nombreRestaurante,
          localidad: localidad,
        },
        select: {
          nombre_producto: true,
          descripcion: true,
          precio: true,
          foto: true,
        },
      });

      if (productos.length === 0) {
        return res.status(404).json({ error: 'No se encontraron productos para este restaurante' });
      }

      return res.status(200).json(productos);
    } catch (error) {
      console.error('Error al obtener los productos:', error);
      return res.status(500).json({ error: 'Error al obtener los productos' });
    }
  } 
  
  else if (req.method === 'DELETE') {
    try {
      const { nombre_producto } = req.query; // Get `nombre_producto` from query

      if (!nombre_producto) {
        return res.status(400).json({ error: 'Falta el nombre del producto a eliminar' });
      }

      // Delete the product with the specified name
      const deleteResult = await prisma.productos.deleteMany({
        where: { nombre_producto: nombre_producto },
      });

      if (deleteResult.count === 0) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      return res.status(200).json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
      console.error('Error al eliminar el producto:', error);
      return res.status(500).json({ error: 'Error al eliminar el producto' });
    }
  } 
  
  else {
    res.setHeader('Allow', ['GET', 'DELETE']);
    res.status(405).end(`Método ${req.method} no permitido`);
  }
}
