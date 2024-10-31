// components/Header.js
import Image from 'next/image';
import { FaUserCircle } from 'react-icons/fa';

const Header = ({ nombreUsuario }) => {
  return (
    <header className="cabecera">
      <div className="inCabecera">
        <div className="banner">
          <Image src="/images/imagen.png" alt="Banner de Eatzy" width={200} height={150} />
        </div>
        <div className="userBox">
          <span className="userName">{nombreUsuario}</span>
          <FaUserCircle className="userIcon" />
        </div>
      </div>
    </header>
  );
};

export default Header;
