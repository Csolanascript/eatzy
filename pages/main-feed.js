import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Main-feed.module.css'; 
import jwt from 'jsonwebtoken';
import { FaUserCircle, FaClipboardList } from 'react-icons/fa';

export default function MainFeed({ propietarioCorreo, nombreUsuario, localidad }) {
  const [restaurantes, setRestaurantes] = useState([]);
  const [error, setError] = useState(null);
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchRestaurantes = async () => {
      try {
        const response = await fetch(`/api/restaurantes?localidad=${encodeURIComponent(localidad)}`);
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

    if (propietarioCorreo && localidad) {
      fetchRestaurantes();
    }
  }, [propietarioCorreo, localidad]);

  const handleLogout = () => {
    // Elimina la cookie del token de autenticación
    document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    router.push('/login'); // Redirige al usuario al login
  };

  const handleRestaurantClick = (restauranteNombre, restauranteLocalidad) => {
    router.push(`/cliente/${encodeURIComponent(restauranteNombre)}/${encodeURIComponent(localidad)}/carta-cliente`);
  };

  const handleCartaClick = (restauranteNombre, restauranteLocalidad) => {
    router.push(`/cliente/${encodeURIComponent(restauranteNombre)}/${encodeURIComponent(restauranteLocalidad)}/carta-cliente`);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleNavigation = (path) => {
    router.push(path);
    setIsSidebarOpen(false); // Cierra el menú al navegar
  };

  return (
    <div className={styles.container}>
      <button className={styles.toggleButton} onClick={toggleSidebar}>
        ☰
      </button>

      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.open : ''}`}>
        <nav>
          <ul>
            <li onClick={() => handleNavigation('/cliente/gestion-pedidos')}>Mis pedidos</li>
            <li onClick={() => handleNavigation('/cliente/configuracion')}>Configuración</li>
            <li onClick={handleLogout}>Cerrar Sesión</li>
          </ul>
        </nav>
      </aside>

      <div className={styles.userBox}>
        <FaUserCircle className={styles.userIcon} />
        <span className={styles.userName}>{nombreUsuario}</span>
      </div>

      <div className={styles.mainContent}>
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
                >
                  <span onClick={() => handleRestaurantClick(restaurante.nombre, restaurante.localidad)}>
                    {restaurante.nombre} - {restaurante.localidad}
                  </span>
                  <FaClipboardList 
                    className={styles.iconCarta} 
                    onClick={() => handleCartaClick(restaurante.nombre, restaurante.localidad)}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.noRestaurants}>No hay restaurantes en tu localidad.</p>
          )}
        </div>
      </div>
    </div>
  );
}

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

    if (!localidad) {
      console.warn('Localidad no definida para el usuario:', propietarioCorreo);
    }
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
