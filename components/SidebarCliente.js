import { useRouter } from 'next/router';

export default function SidebarCliente({ isSidebarOpen, toggleSidebar }) {
  const router = useRouter();

  const handleNavigation = (path) => {
    toggleSidebar();
    router.push(path);
  };

  const handleLogout = () => {
    document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    router.push('/login');
  };

  return (
    <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
      <button className="toggleButton" onClick={toggleSidebar}>☰</button>
      <nav>
        <ul>
          <li onClick={() => handleNavigation('/main-feed')}>Inicio</li>
          <li onClick={() => handleNavigation('/cliente/gestion-pedidos')}>Mis pedidos</li>
          <li onClick={() => handleNavigation('/configuracion')}>Configuración</li>
          <li onClick={handleLogout}>Cerrar Sesión</li>
        </ul>
      </nav>
    </aside>
  );
}
