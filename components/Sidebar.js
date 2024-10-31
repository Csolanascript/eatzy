// components/Sidebar.js
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Sidebar({ isSidebarOpen, toggleSidebar }) {
  const router = useRouter();

  const handleNavigation = (path) => {
    toggleSidebar(); // Cierra el sidebar después de navegar
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
          <li onClick={() => handleNavigation('/cliente/gestion-pedidos')}>Mis pedidos</li>
          <li onClick={() => handleNavigation('/cliente/configuracion')}>Configuración</li>
          <li onClick={() => handleLogout()}>Cerrar Sesión</li>
        </ul>
      </nav>
    </aside>
  );
}
