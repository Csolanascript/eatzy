import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Main-feed.module.css'; 
import jwt from 'jsonwebtoken';
import { FaUserCircle } from 'react-icons/fa'; // Asegúrate de tener react-icons instalado

export default function MainFeed({ propietarioCorreo, nombreUsuario, localidad }) {
  const [restaurantes, setRestaurantes] = useState([]);
  const [error, setError] = useState(null);
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  const handleRestaurantClick = (restauranteNombre) => {
    router.push(`/${restauranteNombre}/carta`);  // Redirige a la página de gestionar la carta
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleNavigation = (path) => {
    router.push(path);
    setIsSidebarOpen(false); // Cerrar el menú al navegar
  };

  return (
    <div className={styles.container}>
      {/* Botón para togglear el menú lateral */}
      <button className={styles.toggleButton} onClick={toggleSidebar}>
        ☰
      </button>

      {/* Menú lateral */}
      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.open : ''}`}>
        <nav>
          <ul>
            <li onClick={() => handleNavigation('/perfil')}>Perfil</li>
            <li onClick={() => handleNavigation('/configuracion')}>Configuración</li>
            <li onClick={() => handleNavigation('/cerrar-sesion')}>Cerrar Sesión</li>
          </ul>
        </nav>
      </aside>

      {/* Recuadrito de Usuario */}
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
          <h2 className={styles.restaurantsTitle}>Mis Restaurantes</h2>
          {error ? (
            <p className={styles.error}>{error}</p>
          ) : restaurantes.length > 0 ? (
            <ul className={styles.restaurantsList}>
              {restaurantes.map((restaurante) => (
                <li 
                  key={restaurante.nombre} 
                  className={styles.restaurantItem}
                  onClick={() => handleRestaurantClick(restaurante.nombre)} // Redirigir al hacer clic en el restaurante
                >
                  {restaurante.nombre} - {restaurante.localidad}
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.noRestaurants}>No tienes restaurantes registrados.</p>
          )}
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
