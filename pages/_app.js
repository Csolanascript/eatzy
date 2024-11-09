import '../styles/global.css';
import Header from '../components/Header';
import SidebarCliente from '../components/SidebarCliente';
import SidebarProp from '../components/SidebarProp';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

function MyApp({ Component, pageProps }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  // Define rutas donde no quieres mostrar Header y Sidebar
  const rutasExcluidas = ['/login', '/registro', '/recuperar-contrasena'];

  // Función para alternar el sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Verifica si la ruta actual está en la lista de rutas excluidas
  const mostrarHeaderSidebar = !rutasExcluidas.includes(router.pathname);

  useEffect(() => {
    console.log('Tipo de usuario en _app.js:', pageProps.tipoUsuario);
  }, [pageProps.tipoUsuario]);

  // Determina qué Sidebar usar según el tipo de usuario
  const SidebarComponent = pageProps.tipoUsuario === 'Cliente' ? SidebarCliente : SidebarProp;

  return (
    <>
      {mostrarHeaderSidebar && (
        <>
          <Header nombreUsuario={pageProps.nombreUsuario} />
          <SidebarComponent isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        </>
      )}
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
