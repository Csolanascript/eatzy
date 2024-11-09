import { useEffect } from 'react';
import { useRouter } from 'next/router';
import jwt from 'jsonwebtoken';
import styles from '../styles/Configuracion.module.css';

export default function Configuracion({ usuario }) {
  const router = useRouter();

  useEffect(() => {
    if (!usuario) {
      router.push('/login');
    }
  }, [usuario, router]);

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Configuración de Usuario</h1>
      {usuario && (
        <div className={styles.clientInfo}>
          <p><strong>Correo:</strong> {usuario.correo}</p>
          <p><strong>Nombre de usuario:</strong> {usuario.nombre_usuario}</p>
          <p><strong>Localidad:</strong> {usuario.localidad || 'No especificado'}</p>
          <p><strong>Calle:</strong> {usuario.calle || 'No especificado'}</p>
          <p><strong>Piso:</strong> {usuario.piso || 'No especificado'}</p>
          <p><strong>Número:</strong> {usuario.numero || 'No especificado'}</p>
          <p><strong>Código Postal:</strong> {usuario.codigo_postal || 'No especificado'}</p>
          <p><strong>Tipo de Usuario:</strong> {usuario.tipo}</p>
        </div>
      )}
    </div>
  );
}


// Obtener los datos del usuario en el servidor
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
    const correo = decoded.correo;
    const tipoUsuario = decoded.tipo;

    const usuario = await prisma.usuario.findUnique({
      where: { correo },
      select: {
        correo: true,
        nombre_usuario: true,
        localidad: true,
        calle: true,
        piso: true,
        numero: true,
        codigo_postal: true,
        tipo: true,
      },
    });

    if (!usuario) {
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      };
    }

    return {
      props: { usuario, tipoUsuario },
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
