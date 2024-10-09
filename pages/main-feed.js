import React from 'react';
import styles from '../styles/Main-feed.module.css'; 

export default function MainFeed() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>EATZY</h1>
      <p className={styles.subtitle}>¡Has iniciado sesión correctamente!</p>

      <div className={styles.content}>
        <p>Este es el contenido del main feed.</p>
        <p>Puedes personalizar esta página con lo que necesites mostrar.</p>ç
        
      </div>
    </div>
  );
}
