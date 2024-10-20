// /pages/cambiar-contrasena.jsx

import { useState } from 'react';
import styles from '../styles/cambiar-contrasena.module.css';
import { useRouter } from 'next/router';
import Image from 'next/image';

export default function CambiarContrasena({ tokenValido, errorMensaje, token }) {
  const router = useRouter();

  const [contrasena, setContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState(errorMensaje || '');

  const handleCambiar = async (e) => {
    e.preventDefault();

    // Validar que las contraseñas coinciden
    if (contrasena !== confirmarContrasena) {
      setError('Las contraseñas no coinciden.');
      setMensaje('');
      return;
    }

    // Opcional: Validar la fortaleza de la contraseña
    if (contrasena.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      setMensaje('');
      return;
    }

    try {
      const res = await fetch('/api/cambiar-contrasena', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, contrasena }),
      });

      const data = await res.json();

      if (res.ok) {
        setMensaje(data.message);
        setError('');
        // Opcional: Redirigir al login después de un tiempo
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(data.message);
        setMensaje('');
      }
    } catch (err) {
      console.error('Error al cambiar la contraseña:', err);
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
          <h1>Cambiar Contraseña</h1>
          {mensaje && <p className={styles.success}>{mensaje}</p>}
          {error && <p className={styles.error}>{error}</p>}

          {tokenValido ? (
            <form onSubmit={handleCambiar}>
              <div className={styles.inputGroup}>
                <label htmlFor="contrasena">Nueva Contraseña</label>
                <input 
                  type="password" 
                  id="contrasena" 
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  required
                  className={styles.inputField} 
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="confirmarContrasena">Confirmar Nueva Contraseña</label>
                <input 
                  type="password" 
                  id="confirmarContrasena" 
                  value={confirmarContrasena}
                  onChange={(e) => setConfirmarContrasena(e.target.value)}
                  required
                  className={styles.inputField} 
                />
              </div>

              <button type="submit" className={styles.cambiarButton}>
                Cambiar Contraseña
              </button>
            </form>
          ) : (
            <p className={styles.error}>No se puede procesar la solicitud de restablecimiento.</p>
          )}

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

// Importamos jwt para usarlo en getServerSideProps
import jwt from 'jsonwebtoken';

export async function getServerSideProps(context) {
  const { token } = context.query;

  let tokenValido = false;
  let errorMensaje = '';

  if (!token) {
    errorMensaje = 'Token no proporcionado.';
  } else {
    try {
      // Verificar el token en el servidor
      jwt.verify(token, process.env.JWT_RESET_SECRET);
      tokenValido = true;
    } catch (err) {
      console.error('Error al verificar el token JWT:', err);
      errorMensaje = 'Token inválido o expirado.';
    }
  }

  return {
    props: {
      tokenValido,
      errorMensaje,
      token: token || null, // Pasamos el token al componente
    },
  };
}
