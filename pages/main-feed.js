import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';  // Importar useRouter desde next/router
import styles from '../styles/Main-feed.module.css'; 
import jwt from 'jsonwebtoken';

export default function MainFeed({ propietarioCorreo }) {
  const [restaurantes, setRestaurantes] = useState([]);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchRestaurantes = async () => {
      try {
        const response = await fetch(`/api/restaurantes?propietarioCorreo=${propietarioCorreo}`);
        const data = await response.json();
        
        if (response.ok) {
          setRestaurantes(data);
        } else {
          setError(data.error || 'Error al obtener los restaurantes');
        }
      } catch (error) {
        setError('Error al obtener los restaurantes');
      }
    };

    if (propietarioCorreo) {
      fetchRestaurantes();
    }
  }, [propietarioCorreo]);

  const handleRestaurantClick = (restauranteId) => {
    router.push(`/restaurante/${restauranteId}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>EATZY</h1>
        <p className={styles.subtitle}>¡Has iniciado sesión correctamente!</p>
      </div>

      <div className={styles.content}>
        <h2 className={styles.restaurantsTitle}>Restaurantes en tu localidad</h2>
        {error ? (
          <p className={styles.error}>{error}</p>
        ) : restaurantes.length > 0 ? (
          <ul className={styles.restaurantsList}>
            {restaurantes.map((restaurante) => (
              <li 
                key={restaurante.id} 
                className={styles.restaurantItem}
                onClick={() => handleRestaurantClick(restaurante.id)}
              >
                {restaurante.nombre} - {restaurante.localidad}
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.noRestaurants}>No hay restaurantes en tu localidad.</p>
        )}
      </div>
    </div>
  );
}

// getServerSideProps para proteger la página
export async function getServerSideProps(context) {
  const { req } = context;
  const token = req.cookies['auth-token'];  // Obtener el token de las cookies

  if (!token) {
    // Si no hay token, redirigir al login
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
    const propietarioCorreo = decoded.correo;  // Usar el correo del token

    return {
      props: { propietarioCorreo },  // Pasar el correo como prop
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
