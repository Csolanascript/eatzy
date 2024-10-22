import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../../../../../styles/info-product.module.css';

export default function InfoProducto() {
  const router = useRouter();
  const { nombre, localidad, producto } = router.query;

  // Colocar un log dentro del return para ver si el componente se renderiza
  console.log('Renderizando InfoProducto:', nombre, localidad, producto);

  const [productoInfo, setProductoInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("Nombre:", nombre);
    console.log("Localidad:", localidad);
    console.log("Producto:", producto);

    if (nombre && localidad && producto) {
      const fetchProductoInfo = async () => {
        try {
          const response = await fetch(`/api/productos?nombreRestaurante=${encodeURIComponent(nombre)}&localidad=${encodeURIComponent(localidad)}&producto=${encodeURIComponent(producto)}`);
          const data = await response.json();

          if (response.ok) {
            const prodEncontrado = data.find(prod => prod.nombre_producto === producto);
            if (prodEncontrado) {
              setProductoInfo(prodEncontrado);
            } else {
              setError('Producto no encontrado');
            }
          } else {
            setError('Error al obtener los detalles del producto');
          }
        } catch (error) {
          setError('Error al obtener los detalles del producto');
        }
      };

      fetchProductoInfo();
    }
  }, [nombre, localidad, producto]);

  return (
    <div className={styles.container}>
      {error ? (
        <p className={styles.error}>{error}</p>
      ) : productoInfo ? (
        <div className={styles.productDetails}>
          <h1 className={styles.productName}>{productoInfo.nombre_producto}</h1>
          <p className={styles.productDescription}>{productoInfo.descripcion}</p>
          <button className={styles.addButton}>
            Añadir producto al carrito
          </button>
        </div>
      ) : (
        <p className={styles.loading}>Cargando detalles del producto...</p>
      )}
    </div>
  );
}
