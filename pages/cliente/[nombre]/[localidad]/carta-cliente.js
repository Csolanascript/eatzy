import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../../../../styles/Carta.module.css';
import Image from 'next/image';
import Link from 'next/link';
import jwt from 'jsonwebtoken';
import Header from '/components/Header'; // Importa el nuevo componente

export default function Carta({nombreUsuario}) {
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

  const handleProductClick = (productoNombre) => {
    router.push(`/cliente/${encodeURIComponent(nombre)}/${encodeURIComponent(localidad)}/producto/${encodeURIComponent(productoNombre)}`);
  };

  return (
    <div className="pagina">
      <Header nombreUsuario={nombreUsuario} /> {/* Reemplaza la cabecera por el componente Header */}
      <div className={styles.container}>
        <h1 className={styles.title}>{nombre} -- {localidad}</h1>
        {error ? (
          <p className={styles.error}>{error}</p>
        ) : productos.length > 0 ? (
          <ul className={styles.productList}>
            {productos.map((producto) => (
              <li key={producto.nombre_producto} className={styles.productItem}>
                {producto.foto && (
                  <Image
                    src={producto.foto}
                    alt={producto.nombre_producto}
                    className={styles.productImage} // Añadir la clase de estilos para la imagen
                    width={300}
                    height={300}
                  />
                )}
                <span className={styles.productName}>{producto.nombre_producto}</span>
                <span className={styles.productPrice}>{producto.precio}€</span>
                <button 
                  className={styles.viewButton} 
                  onClick={() => handleProductClick(producto.nombre_producto)}
                >
                  Ver descripción
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.noProducts}>No hay productos registrados para este restaurante.</p>
        )}

        {/* Enlace a la pantalla de hacer pedido */}
        <Link href={`/cliente/${encodeURIComponent(nombre)}/${encodeURIComponent(localidad)}/HacerPedido`}>
          <button className={styles.orderButton}>
            Hacer pedido
          </button>
        </Link>
      </div>
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
    const tipoUsuario = decoded.tipo || null;

    return {
      props: { propietarioCorreo, nombreUsuario, localidad, tipoUsuario }, // Pasar el correo como prop
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
