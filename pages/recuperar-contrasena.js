// /pages/recuperar-contrasena.jsx

import { useState } from 'react';
import styles from '../styles/recuperar-contrasena.module.css';
import { useRouter } from 'next/router';
import Image from 'next/image';

export default function RecuperarContrasena() {
  const [correo, setCorreo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRecuperar = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/recuperar-contrasena', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo }),
      });

      const data = await res.json();

      if (res.ok) {
        setMensaje(data.message);
        setError('');
      } else {
        setError(data.message);
        setMensaje('');
      }
    } catch (err) {
      setError('Error de red, por favor inténtalo más tarde.');
      setMensaje('');
    }
  };

  return (
    <div className={styles.pagina}>
      {/* Video de fondo */}
      <video autoPlay loop muted className={styles.videoBackground}>
        <source src="/video/fondo.mp4" type="video/mp4" />
        Tu navegador no soporta el video.
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
          <h1>Recuperar Contraseña</h1>
          {mensaje && <p className={styles.success}>{mensaje}</p>}
          {error && <p className={styles.error}>{error}</p>}

          <form onSubmit={handleRecuperar}>
            <div className={styles.inputGroup}>
              <label htmlFor="correo">Correo Electrónico</label>
              <input 
                type="email" 
                id="correo" 
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
                className={styles.inputField} 
              />
            </div>

            <button type="submit" className={styles.recuperarButton}>
              Enviar Instrucciones
            </button>
          </form>

          <div className={styles.linksContainer}>
            <button onClick={() => router.push('/login')} className={styles.linkButtonSmall}>
              Volver al Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
