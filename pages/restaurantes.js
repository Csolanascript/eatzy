import { useEffect, useState } from 'react';
import styles from '../styles/Restaurantes.module.css';

export default function Restaurantes() {
  const [restaurantes, setRestaurantes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurantes = async () => {
      try {
        const res = await fetch('/api/restaurantes');
        const data = await res.json();
        setRestaurantes(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching restaurantes:', error);
        setLoading(false);
      }
    };

    fetchRestaurantes();
  }, []);

  if (loading) return <p className={styles.loading}>Cargando restaurantes...</p>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Lista de Restaurantes</h1>
      <div className={styles.grid}>
        {restaurantes.map((restaurante) => (
          <div key={restaurante.nombre_restaurante} className={styles.card}>
            <h2 className={styles.cardTitle}>{restaurante.nombre_restaurante}</h2>
            <p className={styles.cardText}><strong>Teléfono:</strong> {restaurante.numtelefono}</p>
            <p className={styles.cardText}><strong>Categoría:</strong> {restaurante.categoria}</p>
            <p className={styles.cardText}><strong>Correo:</strong> {restaurante.correo}</p>
            <p className={styles.cardText}><strong>Localidad:</strong> {restaurante.localidad}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
