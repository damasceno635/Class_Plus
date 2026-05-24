import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { Prisma } from '@prisma/client';

import prisma from './lib/prisma';
import { authMiddleware, AuthRequest } from './middlewares/authMiddleware';
import { multerConfig } from './config/multer';

const routes = Router();
const upload = multer(multerConfig);

// TIPAGEM DO PRISMA
type AlunoCompleto = Prisma.AlunoGetPayload<{
  include: {
    user: true;
    responsaveis: true;
    deficiencias: true;
    alergias: true;
  };
}>;

// =========================
// 1. REGISTRO
// =========================

routes.post('/registro', async (req, res: Response) => {
  const { nome, email, senha, cargo } = req.body;

  try {
    const userExists = await prisma.user.findUnique({
      where: { email }
    });

    if (userExists) {
      return res.status(400).json({
        error: 'Este email já está em uso.'
      });
    }

    const hashSenha = await bcrypt.hash(senha, 10);

    const newUser = await prisma.user.create({
      data: {
        nome,
        email,
        senha: hashSenha,
        cargo
      }
    });

    return res.status(201).json({
      id: newUser.id,
      nome: newUser.nome,
      email: newUser.email,
      cargo: newUser.cargo
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: 'Erro interno no servidor.'
    });
  }
});

// =========================
// 2. LOGIN
// =========================

routes.post('/login', async (req, res: Response) => {
  const { email, senha } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        error: 'Email ou senha incorretos.'
      });
    }

    const senhaValida = await bcrypt.compare(senha, user.senha);

    if (!senhaValida) {
      return res.status(401).json({
        error: 'Email ou senha incorretos.'
      });
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error('JWT_SECRET não definida.');
    }

    const token = jwt.sign(
      {
        id: user.id,
        cargo: user.cargo
      },
      jwtSecret,
      {
        expiresIn: '1d'
      }
    );

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
    console.error(error);

    return res.status(500).json({
      error: 'Erro interno no servidor.'
    });
  }
});

// =========================
// 3. PERFIL
// =========================

routes.get(
  '/perfil',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: req.userId
        }
      });

      if (!user) {
        return res.status(404).json({
          error: 'Usuário não encontrado.'
        });
      }

      return res.json({
        id: user.id,
        nome: user.nome,
        email: user.email,
        cargo: user.cargo,
        mensagem:
          'Parabéns! Você passou pelo segurança usando um JWT válido!'
      });

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error: 'Erro interno no servidor.'
      });
    }
  }
);

// =========================
// 4. CADASTRAR ALUNO
// =========================

routes.post(
  '/alunos',
  authMiddleware,
  upload.any(),
  async (req: AuthRequest, res: Response) => {
    try {
      const {
        nome,
        email,
        cpf,
        nascimento,
        sexo,
        nivelEnsino,
        anoTurma,
        serieTurma,
        anoLetivo,
        cep,
        cidade,
        estado,
        rua,
        bloco,
        quadra,
        numero,
        responsaveis,
        deficiencias,
        alergias
      } = req.body;

      const files = req.files as Express.Multer.File[];

      let nomeArquivoFoto: string | null = null;

      const caminhosDocumentos: string[] = [];

      if (files && Array.isArray(files)) {
        files.forEach((file) => {
          if (file.fieldname === 'foto') {
            nomeArquivoFoto = file.filename;
          } else {
            caminhosDocumentos.push(file.filename);
          }
        });
      }

      const emailExiste = await prisma.user.findUnique({
        where: { email }
      });

      const cpfExiste = await prisma.aluno.findUnique({
        where: { cpf }
      });

      if (emailExiste || cpfExiste) {
        return res.status(400).json({
          error: 'Email ou CPF já cadastrados no sistema.'
        });
      }

      const anoAtual = new Date().getFullYear();

      const sequencial = Math.floor(
        1000 + Math.random() * 9000
      );

      const matriculaGerada = `${anoAtual}${sequencial}`;

      const listaResponsaveis = responsaveis
        ? JSON.parse(responsaveis)
        : [];

      const listaDeficiencias = deficiencias
        ? JSON.parse(deficiencias)
        : [];

      const listaAlergias = alergias
        ? JSON.parse(alergias)
        : [];

      const hashSenha = await bcrypt.hash(
        matriculaGerada,
        10
      );

      const newUser = await prisma.user.create({
        data: {
          nome,
          email,
          senha: hashSenha,
          cargo: 'student'
        }
      });

      const newAluno = await prisma.aluno.create({
        data: {
          userId: newUser.id,
          matricula: matriculaGerada,
          status: 'Matriculado',
          cpf,
          nascimento,
          sexo,
          nivelEnsino,
          anoTurma,
          serieTurma,
          anoLetivo,
          cep,
          cidade,
          estado,
          rua,
          bloco,
          quadra,
          numero,

          fotoUrl: nomeArquivoFoto,

          documentos: caminhosDocumentos,

          responsaveis: {
            create: listaResponsaveis
          },

          deficiencias: {
            create: listaDeficiencias
          },

          alergias: {
            create: listaAlergias
          }
        }
      });

      return res.status(201).json({
        mensagem: 'Aluno cadastrado com sucesso!',

        aluno: newAluno,

        credenciaisAcesso: {
          email: newUser.email,
          senhaProvisoria: matriculaGerada
        }
      });

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error: 'Erro interno ao cadastrar aluno.'
      });
    }
  }
);

// =========================
// 5. LISTAR ALUNOS
// =========================

routes.get(
  '/alunos',
  authMiddleware,
  async (_req, res: Response) => {
    try {
      const alunos: Prisma.AlunoGetPayload<{
        include: {
          user: true;
        };
      }>[] = await prisma.aluno.findMany({
        include: {
          user: true
        },

        orderBy: {
          criadoEm: 'desc'
        }
      });

      const alunosFormatados = alunos.map((aluno) => ({
        id: aluno.id,
        matricula: aluno.matricula,
        nome: aluno.user.nome,
        status: aluno.status,
        nivel: aluno.nivelEnsino,
        ano: aluno.anoTurma,
        serie: aluno.serieTurma,
        anoLetivo: aluno.anoLetivo
      }));

      return res.json(alunosFormatados);

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error: 'Erro ao buscar alunos.'
      });
    }
  }
);

// =========================
// 6. BUSCAR ALUNO POR ID
// =========================

routes.get(
  '/alunos/:id',
  authMiddleware,
  async (req, res: Response) => {
    try {
      const id = String(req.params.id);

      const aluno: AlunoCompleto | null =
        await prisma.aluno.findUnique({
          where: { id },

          include: {
            user: true,
            responsaveis: true,
            deficiencias: true,
            alergias: true
          }
        });

      if (!aluno) {
        return res.status(404).json({
          error: 'Aluno não encontrado no sistema.'
        });
      }

      const fotoUrl = aluno.fotoUrl
        ? `http://localhost:3333/uploads/${aluno.fotoUrl}`
        : '';

      const alunoFormatado = {
        id: aluno.id,
        matricula: aluno.matricula,
        nome: aluno.user.nome,
        email: aluno.user.email,
        foto: fotoUrl,
        status: aluno.status,
        cpf: aluno.cpf,
        nascimento: aluno.nascimento,
        sexo: aluno.sexo,
        nivel: aluno.nivelEnsino,
        ano: aluno.anoTurma,
        serie: aluno.serieTurma,
        anoLetivo: aluno.anoLetivo,

        endereco: {
          cep: aluno.cep,
          cidade: aluno.cidade,
          estado: aluno.estado,
          rua: aluno.rua,
          bloco: aluno.bloco || '',
          quadra: aluno.quadra || '',
          numero: aluno.numero
        },

        responsaveis: aluno.responsaveis.map((r) => ({
          parentesco: r.parentesco,
          nome: r.nome,
          cpf: r.cpf,
          contato: r.contato,
          email: r.email
        })),

        deficiencias: aluno.deficiencias.map((d) => ({
          nome: d.nome,
          apoio: d.apoio
        })),

        alergias: aluno.alergias.map((a) => a.nome),

        documentos: aluno.documentos.map(
          (doc) =>
            `http://localhost:3333/uploads/${doc}`
        )
      };

      return res.json(alunoFormatado);

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error: 'Erro ao carregar a ficha do aluno.'
      });
    }
  }
);

// =========================
// 7. EDITAR ALUNO
// =========================

routes.put(
  '/alunos/:id',
  authMiddleware,
  upload.any(),
  async (req: AuthRequest, res: Response) => {
    try {
      const id = String(req.params.id);

      const {
        nome,
        email,
        cpf,
        nascimento,
        sexo,
        nivelEnsino,
        anoTurma,
        serieTurma,
        anoLetivo,
        cep,
        cidade,
        estado,
        rua,
        bloco,
        quadra,
        numero,
        status,
        responsaveis,
        deficiencias,
        alergias
      } = req.body;

      const alunoAtual = await prisma.aluno.findUnique({
        where: { id },

        include: {
          user: true
        }
      });

      if (!alunoAtual) {
        return res.status(404).json({
          error: 'Aluno não encontrado.'
        });
      }

      const files = req.files as Express.Multer.File[];

      let nomeArquivoFoto: string | null = null;

      const novosDocumentos: string[] = [];

      if (files && Array.isArray(files)) {
        files.forEach((file) => {
          if (file.fieldname === 'foto') {
            nomeArquivoFoto = file.filename;
          } else {
            novosDocumentos.push(file.filename);
          }
        });
      }

      const listaResponsaveis = responsaveis
        ? JSON.parse(responsaveis)
        : [];

      const listaDeficiencias = deficiencias
        ? JSON.parse(deficiencias)
        : [];

      const listaAlergias = alergias
        ? JSON.parse(alergias)
        : [];

      await prisma.user.update({
        where: {
          id: alunoAtual.userId
        },

        data: {
          nome,
          email
        }
      });

      const updatedAluno = await prisma.aluno.update({
        where: { id },

        data: {
          status,
          cpf,
          nascimento,
          sexo,
          nivelEnsino,
          anoTurma,
          serieTurma,
          anoLetivo,
          cep,
          cidade,
          estado,
          rua,
          bloco,
          quadra,
          numero,

          ...(nomeArquivoFoto && {
            fotoUrl: nomeArquivoFoto
          }),

          ...(novosDocumentos.length > 0 && {
            documentos: {
              push: novosDocumentos
            }
          }),

          responsaveis: {
            deleteMany: {},
            create: listaResponsaveis
          },

          deficiencias: {
            deleteMany: {},
            create: listaDeficiencias
          },

          alergias: {
            deleteMany: {},
            create: listaAlergias
          }
        }
      });

      return res.json({
        mensagem: 'Aluno atualizado com sucesso!',
        aluno: updatedAluno
      });

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error: 'Erro interno ao atualizar aluno.'
      });
    }
  }
);

// =========================
// 8. EXCLUIR ALUNO
// =========================

routes.delete(
  '/alunos/:id',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const id = String(req.params.id);

      const aluno = await prisma.aluno.findUnique({
        where: { id }
      });

      if (!aluno) {
        return res.status(404).json({
          error: 'Aluno não encontrado.'
        });
      }

      await prisma.aluno.delete({
        where: { id }
      });

      await prisma.user.delete({
        where: {
          id: aluno.userId
        }
      });

      return res.json({
        mensagem:
          'Aluno e acessos excluídos com sucesso!'
      });

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        error: 'Erro interno ao excluir aluno.'
      });
    }
  }
);

export default routes;