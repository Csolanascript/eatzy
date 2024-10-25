// pages/cliente/configuracion.js

import React from 'react';
import jwt from 'jsonwebtoken';
import { useRouter } from 'next/router';
import styles from '../../styles/ConfiguracionCliente.module.css';

export default function ConfiguracionCliente({ cliente }) {
  const router = useRouter();

  // Si no hay datos del cliente, redirige al login
  if (!cliente) {
    if (typeof window !== 'undefined') {
      router.push('/login');
    }
    return null;
  }

  return (
    <div className={styles.container}>
      <h1>Configuración del Cliente</h1>
      <div className={styles.clientInfo}>
        <p><strong>Nombre:</strong> {cliente.nombreUsuario}</p>
        <p><strong>Email:</strong> {cliente.correo}</p>
        <p><strong>Localidad:</strong> {cliente.localidad}</p>
        {/* Añade más campos según sea necesario */}
      </div>
      {/* Puedes agregar formularios para editar la información si lo deseas */}
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

    // Extraer los datos del cliente del token
    const cliente = {
      correo: decoded.correo,
      nombreUsuario: decoded.nombreUsuario || '',
      localidad: decoded.localidad || '',
      // Añade más campos si están disponibles en el token
    };

    return {
      props: { cliente },
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
