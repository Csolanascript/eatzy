import React, { useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Add-restaurant.module.css';
import jwt from 'jsonwebtoken';

export default function AddRestaurant({ propietarioCorreo }) {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [localidad, setLocalidad] = useState('');
  const [categoria, setCategoria] = useState('');
  const [numtelefono, setNumtelefono] = useState('');
  const [foto, setFoto] = useState(null); // Estado para almacenar la imagen seleccionada
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación de los campos obligatorios
    if (!nombre || !localidad || !propietarioCorreo || !foto) {
      setError('Todos los campos obligatorios deben ser llenados');
      return;
    }

    try {
      // Crear un FormData para enviar la imagen y los datos
      const formData = new FormData();
      formData.append('nombre', nombre);
      formData.append('localidad', localidad);
      formData.append('propietarioCorreo', propietarioCorreo);
      if (categoria){
        formData.append('categoria', categoria);
      }
      if (numtelefono){
        formData.append('numtelefono', numtelefono);
      }
      formData.append('foto', foto); // Añadir la imagen al FormData


      const response = await fetch('/api/add-restaurantes', {
        method: 'POST',
        body: formData, // Enviar FormData en lugar de JSON
      });

      if (response.ok) {
        router.push('/main-feed-propietario'); // Redirige después de añadir el restaurante
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al añadir el restaurante');
      }
    } catch (error) {
      setError('Error al añadir el restaurante');
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Añadir Restaurante</h1>
      <form className={styles.form} onSubmit={handleSubmit} encType="multipart/form-data">
        <div className={styles.formGroup}>
          <label htmlFor="nombre">Nombre del Restaurante</label>
          <input
            type="text"
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="localidad">Localidad</label>
          <input
            type="text"
            id="localidad"
            value={localidad}
            onChange={(e) => setLocalidad(e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="categoria">Categoría (opcional)</label>
          <input
            type="text"
            id="categoria"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="numtelefono">Número de Teléfono (opcional)</label>
          <input
            type="text"
            id="numtelefono"
            value={numtelefono}
            onChange={(e) => setNumtelefono(e.target.value)}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="foto">Foto del Restaurante</label>
          <input
            type="file"
            id="foto"
            accept="image/*"
            onChange={(e) => setFoto(e.target.files[0])}
            required
          />
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <button type="submit" className={styles.submitButton}>
          Añadir Restaurante
        </button>
      </form>
    </div>
  );
}

// Configuración para asegurar que el usuario esté autenticado y obtener el correo del propietario


export async function getServerSideProps(context) {
  const { req } = context;
  const token = req.cookies['auth-token'];

  // Si no hay token, redirigir al login
  if (!token) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  try {
    // Verificar el token y obtener el correo del propietario
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const propietarioCorreo = decoded.correo; // Extraer el correo del token

    // Retornar los props a la página
    return {
      props: { propietarioCorreo },
    };
  } catch (error) {
    console.error('Error al verificar el token:', error);

    // Si ocurre algún error al verificar el token, redirigir al login
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
}
