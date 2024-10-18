import React from 'react';
import styles from '../styles/Main-feed.module.css'; 
import jwt from 'jsonwebtoken';  
import { PrismaClient } from '@prisma/client';  // Importar Prisma

const prisma = new PrismaClient();

export default function MainFeed({ restaurantes = [] }) {
  const router = useRouter();

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
                {restaurante.nombre}
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
    const propietarioCorreo = decoded.correo;  // Usar el correo en lugar de userId

    console.log('Correo decodificado:', propietarioCorreo);  // Verifica que el correo sea correcto

    // Obtener restaurantes del propietario desde Prisma usando el correo
    const restaurantes = await prisma.restaurante.findMany({
      where: { correo: propietarioCorreo },
    });

    console.log('Restaurantes obtenidos:', restaurantes);  // Verificar que los restaurantes son correctos

    return {
      props: { restaurantes },  // Pasar los restaurantes como props
    };
  } catch (error) {
    console.error('Error al obtener los restaurantes:', error);
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
}
