// /pages/main-feed.jsx

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
        //const response = await fetch(`/api/restaurantes?propietarioCorreo=${propietarioCorreo}`);
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

    /*if (propietarioCorreo) {
      fetchRestaurantes();
    }
  }, [propietarioCorreo]);
    */

  if (propietarioCorreo && localidad) {
    fetchRestaurantes();
  }
}, [propietarioCorreo, localidad]);

  const handleRestaurantClick = (restauranteId) => {
    router.push(`/restaurante/${restauranteId}`);
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

    if (!localidad) {
      console.warn('Localidad no definida para el usuario:', propietarioCorreo);
      // Puedes manejar este caso como redirigir al usuario para actualizar su perfil
    }
    return {
      props: { propietarioCorreo, nombreUsuario, localidad }, // Pasar el nombre de usuario como prop
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



/*import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Main-feed.module.css'; 
import jwt from 'jsonwebtoken';

export default function MainFeed({ propietarioCorreo }) {
  const [restaurantes, setRestaurantes] = useState([]);
  const [error, setError] = useState(null);
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Estado para el menú lateral

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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={styles.container}>
      {// Botón para togglear el menú lateral }
      <button className={styles.toggleButton} onClick={toggleSidebar}>
        ☰
      </button>

      {// Menú lateral }
      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.open : ''}`}>
        <nav>
          <ul>
            <li onClick={() => router.push('/perfil')}>Perfil</li>
            <li onClick={() => router.push('/configuracion')}>Configuración</li>
            <li onClick={() => router.push('/cerrar-sesion')}>Cerrar Sesión</li>
          </ul>
        </nav>
      </aside>

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
    </div>
  );
}

// getServerSideProps se mantiene igual
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

    return {
      props: { propietarioCorreo },
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
*/
