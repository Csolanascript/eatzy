import { useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Login.module.css';
import Cookies from 'js-cookie';  // Importamos js-cookie para manejar cookies

export default function LoginComponent() {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  // Función que maneja el envío del formulario
  const handleLogin = async (e) => {
    e.preventDefault(); // Prevenir el comportamiento por defecto (recarga de página)
    
    // Realizar la solicitud a la API de login
    const res = await fetch('/api/login', {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo, contrasena }),
    });
  
    const data = await res.json();
  
    // Agrega logs para depurar la respuesta
    console.log('Respuesta de la API:', data);
    console.log('Código de estado:', res.status);
  
    if (res.ok) {
      // Si la autenticación es exitosa, guardar el token en la cookie
      Cookies.set('auth-token', data.token, { expires: 1 });
  
      // Redirigir según el tipo de usuario
      if (data.tipo === 'Cliente') {
        console.log('Redirigiendo a /main-feed');
        router.push('/main-feed');  // Redirigir a main-feed para Clientes
      } else if (data.tipo === 'Propietario') {
        console.log('Redirigiendo a /main-feed-propietario');
        router.push('/main-feed-propietario');  // Redirigir a main-feed-propietario para Propietarios
      }
    } else {
      // Si hay error, mostrar el mensaje de error
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
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>EATZY (imagen)</h1>
        </div>
        <div className={styles.formContainer}>
          <h1>Iniciar Sesión</h1>

          {/* Mostrar mensaje de error si lo hay */}
          {error && <p className={styles.error}>{error}</p>}
    
        <form onSubmit={handleLogin}>
          <div className={styles.inputGroup}>
            <label htmlFor="correo">Correo</label>
            <input 
              type="email" 
              id="correo" 
              name="correo" 
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
              name="contrasena"
              alue={contrasena}
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
            <p onClick={handleRegistro}>Registrarse</p>
            <p onClick={handleRecuperar}>He olvidado mi contraseña</p>
          </div>
        </div>
      </div>
    </div>
  );

}
