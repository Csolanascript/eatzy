import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';  // Necesitamos usar useRouter para obtener nombre y localidad
import styles from '../../../../styles/gestionPedidosRestaurante.module.css';

export default function GestionPedidosRestaurante({ restauranteCorreo }) {
  const router = useRouter();
  const { nombre, localidad } = router.query;  // Capturamos nombre y localidad de la URL

  const [pedidos, setPedidos] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!nombre || !localidad) return;  // Esperar a que nombre y localidad estén disponibles
  
    const fetchPedidos = async () => {
      try {
        // Corregir la URL: Usar "?" para iniciar el query string
        const response = await fetch(`/api/pedidosRestaurante?nombre=${encodeURIComponent(nombre)}&localidad=${encodeURIComponent(localidad)}`);
        const data = await response.json();
  
        if (response.ok) {
          setPedidos(data);
        } else {
          setError(data.error || 'Error al obtener los pedidos');
        }
      } catch (error) {
        setError('Error al obtener los pedidos');
      }
    };
  
    fetchPedidos();
  }, [restauranteCorreo, nombre, localidad]);
  
  const actualizarEstado = async (id, nuevoEstado) => {
    try {
      const response = await fetch(`/api/pedidos`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, estado: nuevoEstado, nombre, localidad }),
      });

      const data = await response.json();
      if (response.ok) {
        // Actualiza el estado local del pedido
        setPedidos((pedidos) =>
          pedidos.map((pedido) => (pedido.id === id ? { ...pedido, estado: nuevoEstado } : pedido))
        );
      } else {
        setError(data.error || 'Error al actualizar el estado del pedido');
      }
    } catch (error) {
      setError('Error al actualizar el estado del pedido');
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Gestión de Pedidos del Restaurante</h1>
      {error ? (
        <p className={styles.error}>{error}</p>
      ) : pedidos.length > 0 ? (
        <ul className={styles.orderList}>
          {pedidos.map((pedido) => (
            <li key={pedido.id} className={styles.orderItem}>
              <h2>Pedido #{pedido.id}</h2>
              <p className={styles.orderDate}>Realizado el {new Date(pedido.fecha).toLocaleDateString()}</p>
              <p className={styles.orderTotal}>Total: {pedido.precio_total}€</p>
              <p className={styles.orderStatus}>
                Estado: <span className={styles[pedido.estado]}>{pedido.estado}</span>
              </p>

              <h3>Productos:</h3>
              <ul className={styles.productList}>
                {pedido.contiene.map((producto) => (
                  <li key={producto.nombre_producto} className={styles.productItem}>
                    {producto.nombre_producto}: {producto.unidades} x {producto.precio}€
                  </li>
                ))}
              </ul>

              {/* Opciones de cambio de estado */}
              {pedido.estado === 'en_cocina' && (
                <button
                  onClick={() => actualizarEstado(pedido.id, 'en_camino')}
                  className={styles.updateButton}
                >
                  Marcar como "En Camino"
                </button>
              )}
              {pedido.estado === 'en_camino' && (
                <button
                  onClick={() => actualizarEstado(pedido.id, 'completado')}
                  className={styles.updateButton}
                >
                  Marcar como "Completado"
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.noOrders}>No hay pedidos realizados.</p>
      )}
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
    const tipoUsuario = decoded.tipo || null;

    // Retornar los props a la página con la información necesaria
    return {
      props: { propietarioCorreo, nombreUsuario, localidad, tipoUsuario },
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

