import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../../../../styles/HacerPedido.module.css';
import jwt from 'jsonwebtoken';

export default function HacerPedido({ propietarioCorreo }) {  // Recibe el correo como prop
  const router = useRouter();
  const { nombre, localidad } = router.query; // Obtener nombre y localidad desde la URL
  const [productos, setProductos] = useState([]);
  const [pedido, setPedido] = useState({});
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

  const handleQuantityChange = (productoNombre, cantidad) => {
    setPedido((prevPedido) => ({
      ...prevPedido,
      [productoNombre]: cantidad,
    }));
  };

  const incrementarCantidad = (productoNombre) => {
    const cantidadActual = pedido[productoNombre] || 0;
    handleQuantityChange(productoNombre, cantidadActual + 1);
  };

  const decrementarCantidad = (productoNombre) => {
    const cantidadActual = pedido[productoNombre] || 0;
    if (cantidadActual > 0) {
      handleQuantityChange(productoNombre, cantidadActual - 1);
    }
  };

  const calcularTotal = () => {
    return productos.reduce((total, producto) => {
      const cantidad = pedido[producto.nombre_producto] || 0;
      return total + (cantidad * producto.precio);
    }, 0).toFixed(2);
  };

  const handleHacerPedido = async () => {
    const productosSeleccionados = productos.filter(producto => pedido[producto.nombre_producto] > 0)
      .map(producto => ({
        nombre_producto: producto.nombre_producto,
        cantidad: pedido[producto.nombre_producto],
        precio: producto.precio,
        nombre_restaurante: nombre,
        localidad: localidad,
      }));

    if (productosSeleccionados.length > 0) {
      const response = await fetch('/api/hacer-pedido', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productos: productosSeleccionados,
          precioTotal: calcularTotal(),
          correo: propietarioCorreo, // Aquí es donde pasamos el correo
        }),
      });

      if (response.ok) {
        alert("Pedido realizado correctamente");
        router.push(`/cliente/gestion-pedidos`);
      } else {
        alert("Error al realizar el pedido");
      }
    } else {
      alert("No se ha seleccionado ningún producto");
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Hacer pedido en {nombre} ({localidad})</h1>
      {error ? (
        <p className={styles.error}>{error}</p>
      ) : productos.length > 0 ? (
        <ul className={styles.productList}>
          {productos.map((producto) => (
            <li key={producto.nombre_producto} className={styles.productItem}>
              <span className={styles.productName}>{producto.nombre_producto}</span>
              <span className={styles.productPrice}>{producto.precio}€</span>
              <div className={styles.quantityControls}>
                <button className={styles.quantityButton} onClick={() => decrementarCantidad(producto.nombre_producto)}>-</button>
                <span className={styles.quantity}>{pedido[producto.nombre_producto] || 0}</span>
                <button className={styles.quantityButton} onClick={() => incrementarCantidad(producto.nombre_producto)}>+</button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.noProducts}>No hay productos disponibles.</p>
      )}
      <div className={styles.summary}>
        <h2>Resumen del Pedido</h2>
        <ul>
          {productos.filter(producto => pedido[producto.nombre_producto] > 0).map(producto => (
            <li key={producto.nombre_producto}>
              {producto.nombre_producto}: {pedido[producto.nombre_producto]} x {producto.precio}€ = {(pedido[producto.nombre_producto] * producto.precio).toFixed(2)}€
            </li>
          ))}
        </ul>
        <h3>Total: {calcularTotal()}€</h3>
        <button 
          className={styles.confirmButton} 
          onClick={handleHacerPedido}
        >
          Confirmar pedido
        </button>
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
    const tipoUsuario = decoded.tipo || null;

    return {
      props: { propietarioCorreo, tipoUsuario }, // Pasar el correo como prop
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
