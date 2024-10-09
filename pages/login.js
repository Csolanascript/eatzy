import { useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Login.module.css';

export default function LoginComponent() {
  const [correo, setCorreo] = useState(''); // Estado para almacenar el correo
  const [contrasena, setContrasena] = useState(''); // Estado para almacenar la contraseña
  const [error, setError] = useState(''); // Estado para errores
  const router = useRouter(); // Utilizamos el router para redirigir después del login

  // Función que maneja el envío del formulario
  const handleLogin = async (e) => {
    e.preventDefault(); // Prevenir el comportamiento por defecto (recarga de página)
    
    // Realizar la solicitud a la API de login
    const res = await fetch('/api/login', {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, // Enviamos los datos como JSON
      body: JSON.stringify({ correo, contrasena }), // Datos enviados en el body
    });

    const data = await res.json(); // Convertir la respuesta en JSON

    if (res.ok) {
      // Si la autenticación es exitosa, redirigir según el tipo de usuario
      if (data.tipo === 'Cliente') {
        router.push('/main-feed');  // Redirigir a main-feed para Clientes
      } else if (data.tipo === 'Propietario') {
        router.push('/main-feed-propietario');  // Redirigir a main-feed-propietario para Propietarios
      }
    } else {
      // Si hay error, mostrar el mensaje de error
      setError(data.message);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Iniciar Sesión</h1>
      
      {/* Mostrar mensaje de error si lo hay */}
      {error && <p className={styles.error}>{error}</p>}

      {/* Formulario de inicio de sesión */}
      <form onSubmit={handleLogin} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="correo">Correo:</label>
          <input
            type="email"
            id="correo"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
            className={styles.input}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="contrasenia">Contraseña:</label>
          <input
            type="password"
            id="contrasenia"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
            className={styles.input}
          />
        </div>

        <button type="submit" className={styles.button}>
          Iniciar Sesión
        </button>
      </form>
    </div>
  );
}
