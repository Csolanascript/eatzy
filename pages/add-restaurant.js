import React, { useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Add-restaurant.module.css'; // Crear un archivo CSS separado
import jwt from 'jsonwebtoken'; 
export default function AddRestaurant({ propietarioCorreo }) {  // Recibe propietarioCorreo como prop
  const [nombre, setNombre] = useState('');
  const [localidad, setLocalidad] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Validación simple
    if (!nombre || !localidad) {
      setError('Todos los campos son obligatorios');
      return;
    }
  
    try {
      const response = await fetch('/api/add-restaurantes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          nombre, 
          localidad, 
          propietarioCorreo  // Usa el valor real pasado como prop
        }),
      });
  
      if (response.ok) {
        router.push('/main-feed-propietario'); // Redirigir al feed de restaurantes después de agregar
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al añadir restaurante');
      }
    } catch (error) {
      setError('Error al añadir restaurante');
    }
  };
  
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Añadir Restaurante</h1>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="nombre">Nombre del Restaurante</label>
          <input
            type="text"
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="localidad">Localidad</label>
          <input
            type="text"
            id="localidad"
            value={localidad}
            onChange={(e) => setLocalidad(e.target.value)}
          />
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <button type="submit" className={styles.submitButton}>
          Añadir Restaurante
        </button>
      </form>
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