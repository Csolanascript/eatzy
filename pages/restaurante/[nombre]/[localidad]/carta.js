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

  const handleAddProductClick = () => {
    // Redirige a la página para añadir productos
    router.push(`/restaurante/${encodeURIComponent(nombre)}/${encodeURIComponent(localidad)}/add-product`);
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
              <span className={styles.productName}>{producto.nombre_producto}</span>
              <span className={styles.productPrice}>{producto.precio}€</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.noProducts}>No hay productos registrados para este restaurante.</p>
      )}

      {/* Botón para añadir un nuevo producto */}
      <button className={styles.addButton} onClick={handleAddProductClick}>
        Añadir Producto
      </button>
    </div>
  );
}

import jwt from 'jsonwebtoken';

export async function getServerSideProps(context) {
  const { req } = context;
  const token = req.cookies['auth-token'];

  // Si no hay token, redirigir al login
  if (!token) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  try {
    // Verificar el token y obtener el correo del propietario
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const propietarioCorreo = decoded.correo;  // Extraer el correo del token
    const nombreUsuario = decoded.nombreUsuario || null;  // Extraer el nombre de usuario del token
    const localidad = decoded.localidad || null;  // Extraer la localidad del token

    // Retornar los props a la página con la información necesaria
    return {
      props: { propietarioCorreo, nombreUsuario, localidad },
    };
  } catch (error) {
    console.error('Error al verificar el token:', error);

    // Si ocurre algún error al verificar el token, redirigir al login
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
}

