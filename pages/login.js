import { useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Login.module.css';
import Cookies from 'js-cookie';  // Importamos js-cookie para manejar cookies
import Image from 'next/image';

export default function LoginComponent() {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/login', {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo, contrasena }),
    });
  
    const data = await res.json();
    if (res.ok) {
      Cookies.set('auth-token', data.token, { expires: 1 });
      if (data.tipo === 'Cliente') {
        router.push('/main-feed');
      } else if (data.tipo === 'Propietario') {
        router.push('/main-feed-propietario');
      }
    } else {
      setError(data.message);
    }

    
  };

  //Funcion para llevarte a registro
  const handleRegistro = async (e) => {
    e.preventDefault(); // Prevenir el comportamiento por defecto (recarga de página)
    router.push('/registro');
  };

  //Funcion para llevarte a recuperar contraseña
  const handleRecuperar = async (e) => {
    e.preventDefault(); // Prevenir el comportamiento por defecto (recarga de página)
    router.push('/recuperar-contrasena');
  };

  return (
    <div className={styles.pagina}>
      {/* Video de fondo */}
      <video autoPlay loop muted className={styles.videoBackground}>
        <source src="/video/fondo.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Contenido de la página */}
      <div className={styles.imageContainer}>
        <Image 
          src="/images/imagen.png"
          alt="Banner de Eatzy"
          width={500}
          height={360}
        />
      </div>

      <div className={styles.container}>
        <div className={styles.formContainer}>
          <h1>Iniciar Sesión</h1>
          {error && <p className={styles.error}>{error}</p>}
    
          <form onSubmit={handleLogin}>
            <div className={styles.inputGroup}>
              <label htmlFor="correo">Correo</label>
              <input 
                type="email" 
                id="correo" 
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
                className={styles.inputField} 
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="contrasena">Contraseña</label>
              <input 
                type="password" 
                id="contrasena" 
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
                className={styles.inputField} 
              />
            </div>

            <button type="submit" className={styles.loginButton}>
              Iniciar Sesión
            </button>
          </form>
          <div className={styles.linksContainer}>
            <button onClick={handleRegistro} className={styles.linkButtonSmall}>Registrarse</button>
            <button onClick={handleRecuperar} className={styles.linkButtonSmall}>He olvidado mi contraseña</button>
          </div>
        </div>
      </div>
    </div>
  );
}
