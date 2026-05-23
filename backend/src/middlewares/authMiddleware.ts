import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Isso é um "macete" do TypeScript para podermos injetar o ID do usuário na requisição
interface TokenPayload {
  id: string;
  cargo: string;
  iat: number;
  exp: number;
}

export interface AuthRequest extends Request {
  userId?: string;
  userCargo?: string;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  // 1. O Token vem no cabeçalho da requisição (Headers)
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
  }

  // O formato que chega é: "Bearer hsdfhushdfuh83y823y8273yr..."
  // Vamos separar a palavra "Bearer" do código do token
  const parts = authHeader.split(' ');
  if (parts.length !== 2) {
    return res.status(401).json({ error: 'Erro de Token.' });
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ error: 'Token mal formatado.' });
  }

  try {
    // 2. A Mágica acontece aqui: o JWT tenta abrir o token usando a sua senha secreta
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as TokenPayload;

    // 3. Se deu certo, colamos o ID e o Cargo do usuário na requisição
    req.userId = decoded.id;
    req.userCargo = decoded.cargo;

    // 4. Liberamos a passagem! Pode continuar para a rota.
    return next();
    
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
}