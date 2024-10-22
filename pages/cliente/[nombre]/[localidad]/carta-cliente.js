import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../../../../styles/Carta.module.css';

export default function Carta() {
  const router = useRouter();
  const { nombre, localidad } = router.query; // Capturar tanto el nombre como la localidad desde la URL
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

  const handleProductClick = (productoNombre) => {
    // Redirige a la página de información del producto
    router.push(`/cliente/${encodeURIComponent(nombre)}/${encodeURIComponent(localidad)}/producto/${encodeURIComponent(productoNombre)}`);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Carta de {nombre} en {localidad}</h1>
      {error ? (
        <p className={styles.error}>{error}</p>
      ) : productos.length > 0 ? (
        <ul className={styles.productList}>
          {productos.map((producto) => (
            <li
              key={producto.nombre_producto}
              className={styles.productItem}
              onClick={() => handleProductClick(producto.nombre_producto)} // Agregar evento onClick
            >
              <span className={styles.productName}>{producto.nombre_producto}</span>
              <span className={styles.productPrice}>{producto.precio}€</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.noProducts}>No hay productos registrados para este restaurante.</p>
      )}
    </div>
  );
}
