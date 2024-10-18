import jwt from 'jsonwebtoken';

export default function handler(req, res) {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  const token = authorization.split(' ')[1];  // El token viene como "Bearer <token>"

  try {
    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Token válido, puedes acceder a los datos del usuario en `decoded`
    res.status(200).json({ message: 'Acceso permitido', decoded });
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
}
