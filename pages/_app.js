// pages/_app.js
import '../styles/global.css';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { useState } from 'react';
import { useRouter } from 'next/router';

function MyApp({ Component, pageProps }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  // Define una lista de rutas donde no quieres mostrar el Header y Sidebar
  const rutasExcluidas = ['/login', '/registro', '/recuperar-contrasena']; // Agrega aquí las rutas a excluir

  // Función para alternar la visibilidad del sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Verifica si la ruta actual está en la lista de rutas excluidas
  const mostrarHeaderSidebar = !rutasExcluidas.includes(router.pathname);

  return (
    <>
      {mostrarHeaderSidebar && (
        <>
          <Header nombreUsuario={pageProps.nombreUsuario} />
          <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        </>
      )}
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
