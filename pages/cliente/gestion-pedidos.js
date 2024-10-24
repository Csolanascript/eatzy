import React, { useEffect, useState } from 'react';
import styles from '../../styles/gestionPedidos.module.css';
import jwt from 'jsonwebtoken';

export default function GestionPedidos({ propietarioCorreo }) {
  const [pedidos, setPedidos] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        // Llamar a la API y pasar el correo del cliente autenticado
        const response = await fetch(`/api/pedidos?correo=${encodeURIComponent(propietarioCorreo)}`);
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
  }, [propietarioCorreo]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Gestión de Pedidos</h1>
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
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.noOrders}>No hay pedidos realizados.</p>
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
    const nombreUsuario = decoded.nombreUsuario || null;
    const localidad = decoded.localidad || null;

    return {
      props: { propietarioCorreo, nombreUsuario, localidad },
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
