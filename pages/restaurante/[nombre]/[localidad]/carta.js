import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../../../../styles/Carta.module.css';

export default function Carta() {
  const router = useRouter();
  const { nombre, localidad } = router.query;
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await fetch(`/api/productos?nombreRestaurante=${encodeURIComponent(nombre)}&localidad=${encodeURIComponent(localidad)}`);
        const data = await response.json();

        if (response.ok) {
          setProductos(data);
        } else {
          setError(data.error || 'Error al obtener los productos');
        }
      } catch (error) {
        setError('Error al obtener los productos');
      }
    };

    if (nombre && localidad) {
      fetchProductos();
    }
  }, [nombre, localidad]);

  const handleAddProductClick = () => {
    router.push(`/restaurante/${encodeURIComponent(nombre)}/${encodeURIComponent(localidad)}/add-product`);
  };

  const handleDeleteProductClick = async (nombreProducto) => {
    try {
      const response = await fetch(`/api/productos?nombre_producto=${encodeURIComponent(nombreProducto)}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Error al eliminar el producto');
        return;
      }
  
      // Filter out the deleted product
      setProductos((prevProductos) => prevProductos.filter((producto) => producto.nombre_producto !== nombreProducto));
    } catch (error) {
      setError('Error de red al intentar eliminar el producto');
    }
  };
  


  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Carta de {nombre} en {localidad}</h1>
      {error ? (
        <p className={styles.error}>{error}</p>
      ) : productos.length > 0 ? (
        <ul className={styles.productList}>
          {productos.map((producto) => (
            <li key={producto.nombre_producto} className={styles.productItem}>
              {producto.foto && (
                <img
                  src={producto.foto}
                  alt={producto.nombre_producto}
                  className={styles.productImage}
                />
              )}
              <span className={styles.productName}>{producto.nombre_producto}</span>
              <span className={styles.productPrice}>{producto.precio}€</span>
              <button
                className={styles.deleteButton}
                onClick={() => handleDeleteProductClick(producto.nombre_producto)}
              >
                Eliminar Producto
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.noProducts}>No hay productos registrados para este restaurante.</p>
      )}

      <button className={styles.addButton} onClick={handleAddProductClick}>
        Añadir Producto
      </button>
    </div>
  );
}
