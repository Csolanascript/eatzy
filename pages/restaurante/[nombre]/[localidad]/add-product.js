import React, { useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../../../../styles/AddProduct.module.css';

export default function AddProduct() {
  const router = useRouter();
  const { nombre, localidad } = router.query; // Capturamos el nombre y la localidad del restaurante desde la URL
  const [nombreProducto, setNombreProducto] = useState('');
  const [precio, setPrecio] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar que los campos no estén vacíos
    if (!nombreProducto || !precio) {
      setError('El nombre del producto y el precio son obligatorios');
      return;
    }

    try {
      const response = await fetch('/api/add-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombreProducto,
          precio: parseFloat(precio), // Asegurarse de que el precio es un número
          descripcion,
          restauranteNombre: nombre,  // Enviar el nombre del restaurante
          localidad,                 // Enviar también la localidad
        }),
      });

      if (response.ok) {
        router.push(`/restaurante/${nombre}/${localidad}/carta`); // Redirige de nuevo a la página de la carta
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al añadir el producto');
      }
    } catch (error) {
      setError('Error al añadir el producto');
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Añadir Producto a {nombre} ({localidad})</h1>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="nombreProducto">Nombre del Producto</label>
          <input
            type="text"
            id="nombreProducto"
            value={nombreProducto}
            onChange={(e) => setNombreProducto(e.target.value)}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="precio">Precio</label>
          <input
            type="number"
            id="precio"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="descripcion">Descripción (opcional)</label>
          <textarea
            id="descripcion"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <button type="submit" className={styles.submitButton}>
          Añadir Producto
        </button>
      </form>
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

