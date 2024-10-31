import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Main-feed.module.css';
import jwt from 'jsonwebtoken';
import { FaUserCircle, FaClipboardList } from 'react-icons/fa';
import Image from 'next/image';

export default function MainFeed({ propietarioCorreo, nombreUsuario, localidad }) {
  const [restaurantes, setRestaurantes] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [mensajeInicial, setMensajeInicial] = useState("Recordando los mejores platos de tu zona");
  const router = useRouter();

  useEffect(() => {
    const fetchRestaurantes = async () => {
      try {
        const response = await fetch(`/api/busqueda?localidad=${encodeURIComponent(localidad)}&nombre=${encodeURIComponent(searchTerm)}`);
        const data = await response.json();

        if (response.ok) {
          setRestaurantes(data);
          setError(null); // Reinicia el error si la solicitud es exitosa
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
  }, [propietarioCorreo, localidad, searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (error) {
        setMensajeInicial(error);
      } else if (restaurantes.length === 0 && !searchTerm) {
        setMensajeInicial("No hay restaurantes cerca de tí en los que chuparte los dedos");
      } else if (restaurantes.length === 0 && searchTerm) {
        setMensajeInicial("No se encontraron restaurantes que coincidan con la búsqueda");
      } else {
        setMensajeInicial(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [restaurantes, error, searchTerm]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleRestaurantClick = (restauranteNombre, restauranteLocalidad) => {
    router.push(`/cliente/${encodeURIComponent(restauranteNombre)}/${encodeURIComponent(localidad)}/carta-cliente`);
  };

  return (
      <div className="pagina">
        <div className={styles.mainContent}>
          <div className={styles.content}>
            <h2 className={styles.restaurantsTitle}>Restaurantes en {localidad}</h2>
            <input 
              type="text" 
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Busca un restaurante..."
              className={styles.searchBar}
            />
            
            {mensajeInicial ? (
              <p className={styles.welcomeMessage}>{mensajeInicial}</p>
            ) : restaurantes.length > 0 ? (
              <div className={styles.restaurantsList}>
                {restaurantes.map((restaurante) => (
                  <div 
                    key={`${restaurante.nombre}-${restaurante.localidad}`} 
                    className={styles.restaurantCard}
                    onClick={() => handleRestaurantClick(restaurante.nombre, restaurante.localidad)}
                  >
                    <div className={styles.restaurantImage}>
                      <Image 
                        src={restaurante.foto} 
                        alt={restaurante.nombre} 
                        width={200}
                        height={200}/>
                    </div>
                    <div className={styles.restaurantInfo}>
                      <h3 className={styles.restaurantName}>{restaurante.nombre}</h3>
                      <p className={styles.restaurantCategoria}>{restaurante.categoria}</p>
                      <p className={styles.restaurantNumTelefono}>{restaurante.numtelefono}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.noRestaurants}>No hay restaurantes cerca de ti en los que chuparte los dedos</p>
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
