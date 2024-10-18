import React, { useEffect, useState } from 'react';
import styles from '../styles/Main-feed.module.css'; 
import { useRouter } from 'next/router';  // Importa useRouter desde next/router
import jwt from 'jsonwebtoken';

export default function MainFeed({ propietarioCorreo }) {
  const router = useRouter();
  const [restaurantes, setRestaurantes] = useState([]);

  useEffect(() => {
    // Si no hay correo, redirigimos al login
    if (!propietarioCorreo) {
      router.push('/login');
      return;
    }

    // Hacemos una solicitud a la API para obtener los restaurantes
    const fetchRestaurantes = async () => {
      try {
        const response = await fetch(`/api/restaurantes?propietarioCorreo=${propietarioCorreo}`);
        const data = await response.json();
        setRestaurantes(data);
      } catch (error) {
        console.error('Error al obtener los restaurantes:', error);
      }
    };

    fetchRestaurantes();
  }, [propietarioCorreo, router]);

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
        <h2 className={styles.restaurantsTitle}>Mis Restaurantes</h2>
        {restaurantes.length > 0 ? (
          <ul className={styles.restaurantsList}>
            {restaurantes.map((restaurante) => (
              <li 
                key={restaurante.id} 
                className={styles.restaurantItem}
                onClick={() => handleRestaurantClick(restaurante.id)}
              >
                {restaurante.nombre || 'Sin nombre'}  {/* Mostrar el nombre del restaurante */}
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.noRestaurants}>No tienes restaurantes registrados.</p>
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
