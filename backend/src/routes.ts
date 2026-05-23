import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from './lib/prisma';

const routes = Router();

// 1. ROTA DE CADASTRO (Apenas para criarmos nosso primeiro usuário)
routes.post('/registro', async (req, res) => {
  const { nome, email, senha, cargo } = req.body;

  try {
    // Verifica se o email já existe no banco
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ error: "Este email já está em uso." });
    }

    // Criptografa a senha antes de salvar
    const hashSenha = await bcrypt.hash(senha, 10);

    // Cria o usuário no banco
    const newUser = await prisma.user.create({
      data: {
        nome,
        email,
        senha: hashSenha,
        cargo
      }
    });

    // Retorna o usuário criado (sem a senha, por segurança)
    return res.status(201).json({
      id: newUser.id,
      nome: newUser.nome,
      email: newUser.email,
      cargo: newUser.cargo
    });

  } catch (error) {
    return res.status(500).json({ error: "Erro interno no servidor." });
  }
});

// 2. ROTA DE LOGIN
routes.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    // Busca o usuário pelo email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Email ou senha incorretos." });
    }

    // Compara a senha digitada com a hash salva no banco
    const senhaValida = await bcrypt.compare(senha, user.senha);
    if (!senhaValida) {
      return res.status(401).json({ error: "Email ou senha incorretos." });
    }

    // Gera o Token JWT (o "crachá" de acesso)
    const token = jwt.sign(
      { id: user.id, cargo: user.cargo }, // Dados que vão dentro do token
      process.env.JWT_SECRET as string,   // A chave do .env
      { expiresIn: '1d' }                 // Tempo de validade do token (1 dia)
    );

    // Retorna os dados do usuário + o token
    return res.json({
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        cargo: user.cargo
      },
      token
    });

  } catch (error) {
    return res.status(500).json({ error: "Erro interno no servidor." });
  }
});

// Adicione as importações do middleware e do AuthRequest lá no topo do routes.ts:
import { authMiddleware, AuthRequest } from './middlewares/authMiddleware';

// ... (suas rotas de registro e login continuam aqui) ...

// 3. ROTA PROTEGIDA (O Segurança está na porta!)
routes.get('/perfil', authMiddleware, async (req: AuthRequest, res) => {
  try {
    // Graças ao middleware, o req.userId agora existe e é confiável!
    const user = await prisma.user.findUnique({
      where: { id: req.userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    // Devolvemos os dados de quem está logado
    return res.json({
      id: user.id,
      nome: user.nome,
      email: user.email,
      cargo: user.cargo,
      mensagem: "Parabéns! Você passou pelo segurança usando um JWT válido!"
    });
    
  } catch (error) {
    return res.status(500).json({ error: "Erro interno no servidor." });
  }
});

export default routes;