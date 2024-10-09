// pages/index.js
export async function getServerSideProps(context) {
    return {
      redirect: {
        destination: '/login', // Redirigir a /login
        permanent: false, // No hacer redirección permanente
      },
    };
  }
  
  export default function Home() {
    return null; // No se muestra nada, ya que el usuario es redirigido
  }
  