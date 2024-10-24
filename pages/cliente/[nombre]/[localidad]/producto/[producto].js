import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../../../../../styles/info-product.module.css';
import jwt from 'jsonwebtoken';

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

// getServerSideProps actualizado
export async function getServerSideProps(context) {
  const { req } = context;
  const token = req.cookies['auth-token'];

  if (!token) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const propietarioCorreo = decoded.correo;
    const nombreUsuario = decoded.nombreUsuario || null; // Extraer el nombre de usuario del token
    const localidad = decoded.localidad || null; // Extraer localidad

    return {
      props: { propietarioCorreo, nombreUsuario, localidad }, // Pasar el correo como prop
    };
  } catch (error) {
    console.error('Error al verificar el token:', error);
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
}