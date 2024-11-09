import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Main-feed.module.css'; 
import jwt from 'jsonwebtoken';
import { FaUserCircle, FaClipboardList } from 'react-icons/fa'; // Asegúrate de tener react-icons instalado

export default function MainFeed({ propietarioCorreo, nombreUsuario, localidad }) {
  const [restaurantes, setRestaurantes] = useState([]);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchRestaurantes = async () => {
      try {
        const response = await fetch(`/api/restaurantes?propietarioCorreo=${encodeURIComponent(propietarioCorreo)}`);
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

  const handleRestaurantClick = (restauranteNombre, restauranteLocalidad) => {
    // Asegúrate de pasar tanto el nombre como la localidad
    router.push(`/restaurante/${encodeURIComponent(restauranteNombre)}/${encodeURIComponent(restauranteLocalidad)}/carta`);
  };
  
  const handleCartaClick = (restauranteNombre, restauranteLocalidad) => {
    // Aquí también aseguramos pasar ambos valores
    router.push(`/restaurante/${encodeURIComponent(restauranteNombre)}/${encodeURIComponent(restauranteLocalidad)}/carta`);
  };

  const handlePedidosClick = (restauranteNombre, restauranteLocalidad) => {
    // Redirigir a la gestión de pedidos del restaurante
    router.push(`/restaurante/${encodeURIComponent(restauranteNombre)}/${encodeURIComponent(restauranteLocalidad)}/gestionPedidosRestaurante`);
  };

  const handleAddRestaurant = () => {
    router.push('/add-restaurant'); // Redirige a la página de agregar restaurante
  };

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <p className={styles.subtitle}>¡Has iniciado sesión correctamente!</p>
        </div>

        <div className={styles.content}>
          <h2 className={styles.restaurantsTitle}>Mis Restaurantes</h2>
          {error ? (
            <p className={styles.error}>{error}</p>
          ) : restaurantes.length > 0 ? (
            <ul className={styles.restaurantsList}>
              {restaurantes.map((restaurante) => (
                <li 
                  key={restaurante.nombre} 
                  className={styles.restaurantItem}
                >
                  {/* Aseguramos que se pasa el nombre y la localidad al hacer clic */}
                  <span onClick={() => handleRestaurantClick(restaurante.nombre, restaurante.localidad)}>
                    {restaurante.nombre} - {restaurante.localidad}
                  </span>

                  {/* Icono para gestionar la carta */}
                  <FaClipboardList 
                    className={styles.iconCarta} 
                    onClick={() => handleCartaClick(restaurante.nombre, restaurante.localidad)}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.noRestaurants}>No tienes restaurantes registrados.</p>
          )}

          {/* Botón para añadir nuevo restaurante */}
          <button className={styles.addButton} onClick={handleAddRestaurant}>
            Añadir Restaurante
          </button>
        </div>
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
