import { useState } from 'react';
import styles from '../styles/registro.module.css'; // Estilos para el formulario
import { useRouter } from 'next/router';  // Importar useRouter desde next/router

export default function Signup() {
  const [formData, setFormData] = useState({
    correo: '',
    nombre_usuario: '',
    contrasena: '',
    localidad: '',
    calle: '',
    piso: '',
    numero: '',
    codigo_postal: '',
    tipo: 'Cliente', // Valor predeterminado
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(null); // Limpiar errores cuando el usuario modifica el formulario
  };

  const validateForm = () => {
    const {
      correo,
      nombre_usuario,
      contrasena,
      localidad,
      calle,
      piso,
      numero,
      codigo_postal,
      tipo,
    } = formData;

    // Validaciones básicas
    if (!correo || !nombre_usuario || !contrasena || !localidad || !calle || !piso || !numero || !codigo_postal) {
      return 'Todos los campos son obligatorios';
    }

    // Validación de correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      return 'Correo electrónico no es válido';
    }

    // Validación de contraseña (ejemplo: mínimo 6 caracteres)
    if (contrasena.length < 2) {
      return 'La contraseña debe tener al menos 2 caracteres';
    }

    // Validar tipo de usuario (solo puede ser "Cliente" o "Propietario")
    if (tipo !== 'Cliente' && tipo !== 'Propietario') {
      return 'El tipo de usuario solo puede ser Cliente o Propietario';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null); // Limpiar errores previos
    setSuccess(null); // Limpiar mensajes previos de éxito

    try {
      const res = await fetch('/api/registro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSuccess('Usuario creado con éxito');
        setFormData({
          correo: '',
          nombre_usuario: '',
          contrasena: '',
          localidad: '',
          calle: '',
          piso: '',
          numero: '',
          codigo_postal: '',
          tipo: 'Cliente',
        }); // Limpiar el formulario tras el éxito
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Hubo un problema al crear el usuario');
      }
    } catch (error) {
      setError('Error de red, por favor inténtalo más tarde');
    }
  };

  return (
    <div className={styles.signupContainer}>
              {/* Video de fondo */}
      <video autoPlay loop muted className={styles.videoBackground}>
        <source src="/video/fondo.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <h1>Registro de Usuario</h1>
      <form onSubmit={handleSubmit} className={styles.signupForm}>
        {error && <p className={styles.errorMessage}>{error}</p>}
        {success && <p className={styles.successMessage}>{success}</p>}
        
        <label>Correo:</label>
        <input
          type="email"
          name="correo"
          value={formData.correo}
          onChange={handleChange}
          placeholder="Correo"
          required
        />

        <label>Nombre de usuario:</label>
        <input
          type="text"
          name="nombre_usuario"
          value={formData.nombre_usuario}
          onChange={handleChange}
          placeholder="Nombre de usuario"
          required
        />

        <label>Contraseña:</label>
        <input
          type="password"
          name="contrasena"
          value={formData.contrasena}
          onChange={handleChange}
          placeholder="Contraseña"
          required
        />

        <label>Localidad:</label>
        <input
          type="text"
          name="localidad"
          value={formData.localidad}
          onChange={handleChange}
          placeholder="Localidad"
          required
        />

        <label>Calle:</label>
        <input
          type="text"
          name="calle"
          value={formData.calle}
          onChange={handleChange}
          placeholder="Calle"
          required
        />

        <label>Piso:</label>
        <input
          type="text"
          name="piso"
          value={formData.piso}
          onChange={handleChange}
          placeholder="Piso"
          required
        />

        <label>Número:</label>
        <input
          type="number"
          name="numero"
          value={formData.numero}
          onChange={handleChange}
          placeholder="Número"
          required
        />

        <label>Código Postal:</label>
        <input
          type="text"
          name="codigo_postal"
          value={formData.codigo_postal}
          onChange={handleChange}
          placeholder="Código Postal"
          required
        />

        <label>Tipo de Usuario:</label>
        <select
          name="tipo"
          value={formData.tipo}
          onChange={handleChange}
          required
        >
          <option value="Cliente">Cliente</option>
          <option value="Propietario">Propietario</option>
        </select>

        <button type="submit" className={styles.signupButton}>
          Registrar Usuario
        </button>
      </form>
    </div>
  );
}
