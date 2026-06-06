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

// Tipagem do Prisma para Aluno
type AlunoCompleto = Prisma.AlunoGetPayload<{
  include: {
    user: true;
    responsaveis: true;
    deficiencias: true;
    alergias: true;
  };
}>;

// Tipagem do Prisma para Funcionário (com todas as relações)
type FuncionarioCompleto = Prisma.FuncionarioGetPayload<{
  include: {
    user: true;
    formacoes: true;
    experiencias: true;
    alocacoes: { include: { turma: true } };
  };
}>;

// =========================
// 1. REGISTRO
// =========================
routes.post('/registro', async (req, res: Response) => {
  const { nome, email, senha, cargo } = req.body;

  try {
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ error: 'Este email já está em uso.' });
    }

    const hashSenha = await bcrypt.hash(senha, 10);
    const newUser = await prisma.user.create({
      data: { nome, email, senha: hashSenha, cargo }
    });

    return res.status(201).json({
      id: newUser.id,
      nome: newUser.nome,
      email: newUser.email,
      cargo: newUser.cargo
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

// =========================
// 2. LOGIN
// =========================
routes.post('/login', async (req, res: Response) => {
  const { email, senha } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Email ou senha incorretos.' });
    }

    const senhaValida = await bcrypt.compare(senha, user.senha);
    if (!senhaValida) {
      return res.status(401).json({ error: 'Email ou senha incorretos.' });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) throw new Error('JWT_SECRET não definida.');

    const token = jwt.sign({ id: user.id, cargo: user.cargo }, jwtSecret, { expiresIn: '1d' });

    return res.json({
      user: { id: user.id, nome: user.nome, email: user.email, cargo: user.cargo },
      token
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

// =========================
// 3. PERFIL
// =========================
routes.get('/perfil', authMiddleware, async (req: AuthRequest, res) => {
  try {
    // Fazemos um "include" para trazer a ficha de aluno ou funcionário ligada a este login
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        aluno: true,
        funcionario: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    // MÁGICA: Prioriza a foto do Perfil. Se não tiver, puxa a foto do cadastro original!
    let fotoFinal = user.fotoUrl;
    if (!fotoFinal && user.aluno?.fotoUrl) fotoFinal = user.aluno.fotoUrl;
    if (!fotoFinal && user.funcionario?.fotoUrl) fotoFinal = user.funcionario.fotoUrl;

    return res.json({
      id: user.id,
      nome: user.nome,
      email: user.email,
      cargo: user.cargo,
      fotoUrl: fotoFinal ? `http://localhost:3333/uploads/${fotoFinal}` : null,
    });
    
  } catch (error) {
    return res.status(500).json({ error: "Erro interno no servidor." });
  }
});

// =========================
// 4. CADASTRAR ALUNO
// =========================
routes.post('/alunos', authMiddleware, upload.any(), async (req: AuthRequest, res: Response) => {
  try {
    const {
      nome, email, cpf, nascimento, sexo, nivelEnsino, anoTurma, serieTurma, anoLetivo,
      cep, cidade, estado, rua, bloco, quadra, numero, responsaveis, deficiencias, alergias
    } = req.body;

    const files = req.files as Express.Multer.File[];
    let nomeArquivoFoto: string | null = null;
    const caminhosDocumentos: string[] = [];

    if (files && Array.isArray(files)) {
      files.forEach((file) => {
        if (file.fieldname === 'foto') nomeArquivoFoto = file.filename;
        else caminhosDocumentos.push(file.filename);
      });
    }

    const emailExiste = await prisma.user.findUnique({ where: { email } });
    const cpfExiste = await prisma.aluno.findUnique({ where: { cpf } });
    if (emailExiste || cpfExiste) {
      return res.status(400).json({ error: 'Email ou CPF já cadastrados no sistema.' });
    }

    const anoAtual = new Date().getFullYear();
    const sequencial = Math.floor(1000 + Math.random() * 9000);
    const matriculaGerada = `${anoAtual}${sequencial}`;

    const listaResponsaveis = responsaveis ? JSON.parse(responsaveis) : [];
    const listaDeficiencias = deficiencias ? JSON.parse(deficiencias) : [];
    const listaAlergias = alergias ? JSON.parse(alergias) : [];

    const hashSenha = await bcrypt.hash(matriculaGerada, 10);

    const newUser = await prisma.user.create({
      data: { nome, email, senha: hashSenha, cargo: 'student' }
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
        responsaveis: { create: listaResponsaveis },
        deficiencias: { create: listaDeficiencias },
        alergias: { create: listaAlergias }
      }
    });

    return res.status(201).json({
      mensagem: 'Aluno cadastrado com sucesso!',
      aluno: newAluno,
      credenciaisAcesso: { email: newUser.email, senhaProvisoria: matriculaGerada }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno ao cadastrar aluno.' });
  }
});

// =========================
// 5. LISTAR ALUNOS
// =========================
routes.get('/alunos', authMiddleware, async (_req, res: Response) => {
  try {
    const alunos = await prisma.aluno.findMany({
      include: { user: true },
      orderBy: { criadoEm: 'desc' }
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
    return res.status(500).json({ error: 'Erro ao buscar alunos.' });
  }
});

// =========================
// 6. BUSCAR ALUNO POR ID
// =========================
routes.get('/alunos/:id', authMiddleware, async (req, res: Response) => {
  try {
    const id = String(req.params.id);
    const aluno = await prisma.aluno.findUnique({
      where: { id },
      include: { user: true, responsaveis: true, deficiencias: true, alergias: true }
    });

    if (!aluno) return res.status(404).json({ error: 'Aluno não encontrado no sistema.' });

    const fotoUrl = aluno.fotoUrl ? `http://localhost:3333/uploads/${aluno.fotoUrl}` : '';

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
      deficiencias: aluno.deficiencias.map((d) => ({ nome: d.nome, apoio: d.apoio })),
      alergias: aluno.alergias.map((a) => a.nome),
      documentos: aluno.documentos.map((doc) => `http://localhost:3333/uploads/${doc}`)
    };

    return res.json(alunoFormatado);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao carregar a ficha do aluno.' });
  }
});

// =========================
// 7. EDITAR ALUNO
// =========================
routes.put('/alunos/:id', authMiddleware, upload.any(), async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const {
      nome, email, cpf, nascimento, sexo, nivelEnsino, anoTurma, serieTurma, anoLetivo,
      cep, cidade, estado, rua, bloco, quadra, numero, status,
      responsaveis, deficiencias, alergias
    } = req.body;

    const alunoAtual = await prisma.aluno.findUnique({
      where: { id },
      include: { user: true }
    });
    if (!alunoAtual) return res.status(404).json({ error: 'Aluno não encontrado.' });

    const files = req.files as Express.Multer.File[];
    let nomeArquivoFoto: string | null = null;
    const novosDocumentos: string[] = [];

    if (files && Array.isArray(files)) {
      files.forEach((file) => {
        if (file.fieldname === 'foto') nomeArquivoFoto = file.filename;
        else novosDocumentos.push(file.filename);
      });
    }

    const listaResponsaveis = responsaveis ? JSON.parse(responsaveis) : [];
    const listaDeficiencias = deficiencias ? JSON.parse(deficiencias) : [];
    const listaAlergias = alergias ? JSON.parse(alergias) : [];

    await prisma.user.update({
      where: { id: alunoAtual.userId },
      data: { nome, email }
    });

    const documentosAtuais = Array.isArray(alunoAtual.documentos) ? alunoAtual.documentos : [];
    const documentosAtualizados = [...documentosAtuais, ...novosDocumentos];

    await prisma.aluno.update({
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
        ...(nomeArquivoFoto ? { fotoUrl: nomeArquivoFoto } : {}),
        documentos: documentosAtualizados,
        responsaveis: { deleteMany: {}, create: listaResponsaveis },
        deficiencias: { deleteMany: {}, create: listaDeficiencias },
        alergias: { deleteMany: {}, create: listaAlergias }
      }
    });

    return res.json({ mensagem: 'Aluno atualizado com sucesso!' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno ao atualizar aluno.' });
  }
});

// =========================
// 8. EXCLUIR ALUNO
// =========================
routes.delete('/alunos/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const aluno = await prisma.aluno.findUnique({ where: { id } });
    if (!aluno) return res.status(404).json({ error: 'Aluno não encontrado.' });

    await prisma.aluno.delete({ where: { id } });
    await prisma.user.delete({ where: { id: aluno.userId } });

    return res.json({ mensagem: 'Aluno e acessos excluídos com sucesso!' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno ao excluir aluno.' });
  }
});

// ==========================================
// ROTAS DE FUNCIONÁRIOS
// ==========================================

// Cadastrar funcionário
routes.post('/funcionarios', authMiddleware, upload.any(), async (req: AuthRequest, res) => {
  try {
    const {
      status, vaga, contrato, periodoContrato, dataFimContrato,
      nome, email, cpf, ra, nascimento, sexo, celular,
      cep, cidade, estado, rua, bloco, quadra, numero,
      salario, pagamento,
      disciplinas, formacoes, experiencias
    } = req.body;

    const files = req.files as Express.Multer.File[];
    let nomeArquivoFoto: string | null = null;
    const caminhosDocumentos: string[] = [];

    if (files && Array.isArray(files)) {
      files.forEach(file => {
        if (file.fieldname === 'foto') nomeArquivoFoto = file.filename;
        else caminhosDocumentos.push(file.filename);
      });
    }

    const emailExiste = await prisma.user.findUnique({ where: { email } });
    const cpfExiste = await prisma.funcionario.findUnique({ where: { cpf } });
    const raExiste = await prisma.funcionario.findUnique({ where: { ra } });
    if (emailExiste || cpfExiste || raExiste) {
      return res.status(400).json({ error: 'Email, CPF ou RA já cadastrados no sistema.' });
    }

    let cargoLogin = 'staff';
    if (vaga.toLowerCase().includes('professor')) cargoLogin = 'teacher';
    else if (vaga.toLowerCase().includes('coordenador')) cargoLogin = 'coordinator';
    else if (vaga.toLowerCase().includes('secretário')) cargoLogin = 'secretary';

    const hashSenha = await bcrypt.hash(ra, 10);
    const listaFormacoes = formacoes ? JSON.parse(formacoes) : [];
    const listaExperiencias = experiencias ? JSON.parse(experiencias) : [];
    const listaDisciplinas = disciplinas ? JSON.parse(disciplinas) : [];

    const resultado = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: { nome, email, senha: hashSenha, cargo: cargoLogin }
      });

      const newFuncionario = await tx.funcionario.create({
        data: {
          userId: newUser.id,
          status, vaga, contrato, periodoContrato, dataFimContrato: dataFimContrato || null,
          cpf, ra, nascimento, sexo, celular,
          cep, cidade, estado, rua, bloco: bloco || '', quadra: quadra || '', numero,
          salario, pagamento,
          fotoUrl: nomeArquivoFoto,
          documentos: caminhosDocumentos,
          formacoes: { create: listaFormacoes },
          experiencias: { create: listaExperiencias }
        }
      });

      for (const disc of listaDisciplinas) {
        let turma = await tx.turma.findUnique({
          where: { ano_serie_periodo: { ano: disc.turma, serie: disc.serie, periodo: disc.periodo } }
        });
        if (!turma) {
          turma = await tx.turma.create({
            data: { ano: disc.turma, serie: disc.serie, periodo: disc.periodo }
          });
        }
        await tx.alocacao.create({
          data: {
            disciplina: disc.disciplina,
            cargaHoraria: disc.cargaHoraria,
            funcionarioId: newFuncionario.id,
            turmaId: turma.id
          }
        });
      }

      return { credenciais: { email: newUser.email, senhaProvisoria: ra } };
    });

    return res.status(201).json({
      mensagem: 'Funcionário cadastrado com sucesso!',
      credenciaisAcesso: resultado.credenciais
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno ao cadastrar funcionário.' });
  }
});

// Listar funcionários (resumido)
routes.get('/funcionarios', authMiddleware, async (req, res) => {
  try {
    const funcionarios = await prisma.funcionario.findMany({
      include: { user: true },
      orderBy: { criadoEm: 'desc' }
    });

    const formatados = funcionarios.map(f => ({
      id: f.id,
      nome: f.user.nome,
      cargo: f.vaga,
      contrato: f.contrato,
      status: f.status
    }));

    return res.json(formatados);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao buscar funcionários.' });
  }
});

// Buscar funcionário por ID (completo)
routes.get('/funcionarios/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const funcionario = await prisma.funcionario.findUnique({
      where: { id },
      include: {
        user: true,
        formacoes: true,
        experiencias: true,
        alocacoes: { include: { turma: true } }
      }
    }) as FuncionarioCompleto | null;

    if (!funcionario) return res.status(404).json({ error: 'Funcionário não encontrado.' });

    const fotoUrl = funcionario.fotoUrl ? `http://localhost:3333/uploads/${funcionario.fotoUrl}` : '';

    const formatado = {
      id: funcionario.id,
      nome: funcionario.user.nome,
      email: funcionario.user.email,
      cargo: funcionario.vaga,
      status: funcionario.status,
      cpf: funcionario.cpf,
      ra: funcionario.ra,
      nascimento: funcionario.nascimento,
      sexo: funcionario.sexo,
      celular: funcionario.celular,
      foto: fotoUrl,
      contrato: {
        tipo: funcionario.contrato,
        periodo: funcionario.periodoContrato,
        dataFim: funcionario.dataFimContrato || 'Indeterminado'
      },
      endereco: {
        cep: funcionario.cep,
        cidade: funcionario.cidade,
        estado: funcionario.estado,
        rua: funcionario.rua,
        bloco: funcionario.bloco || '',
        quadra: funcionario.quadra || '',
        numero: funcionario.numero
      },
      financeiro: {
        salario: funcionario.salario,
        pagamento: funcionario.pagamento
      },
      disciplinas: funcionario.alocacoes.map((a: any) => ({
        nome: a.disciplina,
        carga: a.cargaHoraria,
        turma: `${a.turma.ano} ${a.turma.serie}`,
        periodo: a.turma.periodo
      })),
      formacoes: funcionario.formacoes.map((f: any) => ({
        instituicao: f.instituicao,
        cnpj: f.cnpj,
        modalidade: f.modalidade,
        periodo: `${f.periodoInicio} até ${f.periodoFinal}`
      })),
      experiencias: funcionario.experiencias.map((e: any) => ({
        empresa: e.empresa,
        cnpj: e.cnpj,
        modalidade: e.modalidade,
        periodo: `${e.periodoInicio} até ${e.periodoFinal}`
      })),
      documentos: funcionario.documentos.map(doc => `http://localhost:3333/uploads/${doc}`)
    };

    return res.json(formatado);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao carregar a ficha do funcionário.' });
  }
});

// Editar funcionário
routes.put('/funcionarios/:id', authMiddleware, upload.any(), async (req: AuthRequest, res) => {
  try {
    const id = String(req.params.id);

    const {
      status, vaga, contrato, periodoContrato, dataFimContrato,
      nome, email, cpf, ra, nascimento, sexo, celular,
      cep, cidade, estado, rua, bloco, quadra, numero,
      salario, pagamento,
      disciplinas, formacoes, experiencias
    } = req.body;

const funcionarioAtual = await prisma.funcionario.findUnique({ where: { id } });
    if (!funcionarioAtual) return res.status(404).json({ error: 'Funcionário não encontrado.' });


    const files = req.files as Express.Multer.File[];
    let nomeArquivoFoto: string | null = null;
    const novosDocumentos: string[] = [];

    if (files && Array.isArray(files)) {
      files.forEach(file => {
        if (file.fieldname === 'foto') nomeArquivoFoto = file.filename;
        else novosDocumentos.push(file.filename);
      });
    }

    const listaFormacoes = formacoes ? JSON.parse(formacoes) : [];
    const listaExperiencias = experiencias ? JSON.parse(experiencias) : [];
    const listaDisciplinas = disciplinas ? JSON.parse(disciplinas) : [];

    const documentosAtuais = Array.isArray(funcionarioAtual.documentos) ? funcionarioAtual.documentos : [];
    const documentosAtualizados = [...documentosAtuais, ...novosDocumentos];

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: funcionarioAtual.userId },
        data: { nome, email }
      });

      await tx.funcionario.update({
        where: { id },
        data: {
          status, vaga, contrato, periodoContrato,
          dataFimContrato: dataFimContrato || null,
          cpf, ra, nascimento, sexo, celular,
          cep, cidade, estado, rua, bloco: bloco || '', quadra: quadra || '', numero,
          salario, pagamento,
          ...(nomeArquivoFoto ? { fotoUrl: nomeArquivoFoto } : {}),
          documentos: documentosAtualizados,
          formacoes: { deleteMany: {}, create: listaFormacoes },
          experiencias: { deleteMany: {}, create: listaExperiencias }
        }
      });

      await tx.alocacao.deleteMany({ where: { funcionarioId: id } });
      for (const disc of listaDisciplinas) {
        let turma = await tx.turma.findUnique({
          where: { ano_serie_periodo: { ano: disc.turma, serie: disc.serie, periodo: disc.periodo } }
        });
        if (!turma) {
          turma = await tx.turma.create({
            data: { ano: disc.turma, serie: disc.serie, periodo: disc.periodo }
          });
        }
        await tx.alocacao.create({
          data: {
            disciplina: disc.disciplina,
            cargaHoraria: disc.cargaHoraria,
            funcionarioId: id,
            turmaId: turma.id
          }
        });
      }
    });

    return res.json({ mensagem: 'Funcionário atualizado com sucesso!' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao atualizar funcionário.' });
  }
});

// Excluir funcionário
routes.delete('/funcionarios/:id', authMiddleware, async (req, res) => {
  try {
    const id = String(req.params.id);
    const funcionario = await prisma.funcionario.findUnique({ where: { id } });

    if (!funcionario) return res.status(404).json({ error: 'Funcionário não encontrado.' });

    await prisma.funcionario.delete({ where: { id } });
    await prisma.user.delete({ where: { id: funcionario.userId } });

    return res.json({ mensagem: 'Funcionário excluído com sucesso!' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao excluir funcionário.' });
  }
});

// Rota de perfil (com foto)
routes.get('/perfil', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

    return res.json({
      id: user.id,
      nome: user.nome,
      email: user.email,
      cargo: user.cargo,
      fotoUrl: user.fotoUrl ? `http://localhost:3333/uploads/${user.fotoUrl}` : null
    });
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

// Atualizar perfil (com foto)
routes.put('/perfil', authMiddleware, upload.single('foto'), async (req: AuthRequest, res) => {
  try {
    const { nome, email, novaSenha } = req.body;
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Não autorizado' });

    const dadosAtualizacao: any = { nome, email };
    if (novaSenha && novaSenha.trim() !== '') {
      dadosAtualizacao.senha = await bcrypt.hash(novaSenha, 10);
    }
    if (req.file) {
      dadosAtualizacao.fotoUrl = req.file.filename;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dadosAtualizacao
    });

    return res.json({
      mensagem: 'Perfil atualizado com sucesso!',
      fotoNova: updatedUser.fotoUrl ? `http://localhost:3333/uploads/${updatedUser.fotoUrl}` : null
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao atualizar perfil.' });
  }
});

// ==========================================
// ROTAS DE EVENTOS
// ==========================================
routes.post('/eventos', authMiddleware, async (req, res) => {
  try {
    const { titulo, descricao, data, tipo, horarioInicio, horarioFim } = req.body;
    const novoEvento = await prisma.evento.create({
      data: { titulo, descricao, data, tipo, horarioInicio, horarioFim }
    });
    return res.status(201).json(novoEvento);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao criar evento." });
  }
});

routes.get('/eventos', authMiddleware, async (req, res) => {
  try {
    const eventos = await prisma.evento.findMany({ orderBy: { data: 'asc' } });
    return res.json(eventos);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao buscar eventos." });
  }
});

routes.put('/eventos/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descricao, data, tipo, horarioInicio, horarioFim } = req.body;
    const eventoAtualizado = await prisma.evento.update({
      where: { id },
      data: { titulo, descricao, data, tipo, horarioInicio, horarioFim }
    });
    return res.json(eventoAtualizado);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao atualizar evento." });
  }
});

routes.delete('/eventos/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.evento.delete({ where: { id } });
    return res.json({ mensagem: "Evento excluído com sucesso!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao excluir evento." });
  }
});

// Rotas de Roteiros de Aula e Notas
routes.post('/roteiros', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { titulo, disciplina, turma, dataAplicacao, status, conteudo, metodologia } = req.body;
    const novo = await prisma.roteiro.create({
      data: {
        titulo, disciplina, turma, dataAplicacao, status, conteudo, metodologia,
        userId: req.userId!
      }
    });
    return res.status(201).json(novo);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao criar roteiro." });
  }
});

routes.get('/roteiros', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    let roteiros = [];

    if (user?.cargo === 'teacher') {
      roteiros = await prisma.roteiro.findMany({
        where: { userId: req.userId },
        include: { user: true },
        orderBy: { criadoEm: 'desc' }
      });
    } else if (user?.cargo === 'admin') {
      roteiros = await prisma.roteiro.findMany({
        where: { status: 'Aprovado' },
        include: { user: true },
        orderBy: { criadoEm: 'desc' }
      });
    } else {
      roteiros = await prisma.roteiro.findMany({
        where: { status: { not: 'Rascunho' } },
        include: { user: true },
        orderBy: { criadoEm: 'desc' }
      });
    }

    const formatados = roteiros.map(r => ({
      id: r.id,
      professor: r.user.nome,
      titulo: r.titulo,
      disciplina: r.disciplina,
      turma: r.turma,
      dataAplicacao: r.dataAplicacao,
      status: r.status,
      conteudo: r.conteudo,
      metodologia: r.metodologia,
      feedbackCoordenador: r.feedbackCoordenador
    }));

    return res.json(formatados);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao buscar roteiros." });
  }
});

routes.put('/roteiros/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { titulo, disciplina, turma, dataAplicacao, status, conteudo, metodologia, feedbackCoordenador } = req.body;

    const data: any = {};
    if (titulo !== undefined) data.titulo = titulo;
    if (disciplina !== undefined) data.disciplina = disciplina;
    if (turma !== undefined) data.turma = turma;
    if (dataAplicacao !== undefined) data.dataAplicacao = dataAplicacao;
    if (status !== undefined) data.status = status;
    if (conteudo !== undefined) data.conteudo = conteudo;
    if (metodologia !== undefined) data.metodologia = metodologia;
    if (feedbackCoordenador !== undefined) data.feedbackCoordenador = feedbackCoordenador;

    const roteiro = await prisma.roteiro.update({
      where: { id },
      data
    });
    return res.json(roteiro);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao atualizar roteiro." });
  }
});

// ROTAS DE DIÁRIO DE CLASSE E NOTAS
// ==========================================

// 1. Buscar Turmas onde o Professor Logado dá aula
routes.get('/diario/turmas', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const func = await prisma.funcionario.findUnique({ where: { userId: req.userId } });
    if (!func) return res.status(404).json({ error: "Funcionário não encontrado." });

    const alocacoes = await prisma.alocacao.findMany({
      where: { funcionarioId: func.id },
      include: { turma: true }
    });

    const formatadas = alocacoes.map(a => ({
      id: a.id,
      nome: `${a.turma.ano} ${a.turma.serie} - ${a.disciplina}`
    }));

    return res.json(formatadas);
  } catch(err) { res.status(500).json({ error: "Erro ao buscar turmas." }); }
});

// 2. Buscar Alunos da Turma selecionada
routes.get('/diario/alunos/:alocacaoId', authMiddleware, async (req, res) => {
  try {
    const { alocacaoId } = req.params;
    const alocacao = await prisma.alocacao.findUnique({ where: { id: alocacaoId }, include: { turma: true } });
    if (!alocacao) return res.status(404).json({ error: "Turma não encontrada" });

    // Busca os alunos que pertencem ao ano e série dessa alocação
    const alunos = await prisma.aluno.findMany({
      where: { anoTurma: alocacao.turma.ano, serieTurma: alocacao.turma.serie },
      include: { user: true },
      orderBy: { user: { nome: 'asc' } }
    });

    return res.json(alunos.map(a => ({ id: a.id, nome: a.user.nome, matricula: a.matricula })));
  } catch(err) { res.status(500).json({ error: "Erro ao buscar alunos." }); }
});

// 3. Buscar e Salvar Frequência
routes.get('/diario/frequencia', authMiddleware, async (req, res) => {
  try {
    const freq = await prisma.frequencia.findMany({
      where: { alocacaoId: String(req.query.alocacaoId), data: String(req.query.data) }
    });
    return res.json(freq);
  } catch(err) { res.status(500).json({ error: "Erro ao buscar frequência." }); }
});

routes.post('/diario/frequencia', authMiddleware, async (req, res) => {
  try {
    const { alocacaoId, data, frequencias } = req.body;
    for (const f of frequencias) {
      await prisma.frequencia.upsert({ // A Mágica! Cria se não existir, atualiza se existir
        where: { alunoId_alocacaoId_data: { alunoId: f.alunoId, alocacaoId, data } },
        update: { presente: f.presente, observacao: f.observacao },
        create: { alunoId: f.alunoId, alocacaoId, data, presente: f.presente, observacao: f.observacao }
      });
    }
    return res.json({ message: "Frequência salva!" });
  } catch(err) { res.status(500).json({ error: "Erro ao salvar frequência" }); }
});

// 4. Buscar e Salvar Notas
routes.get('/diario/notas', authMiddleware, async (req, res) => {
  try {
    const notas = await prisma.nota.findMany({
      where: { alocacaoId: String(req.query.alocacaoId), bimestre: String(req.query.bimestre) }
    });
    return res.json(notas);
  } catch(err) { res.status(500).json({ error: "Erro ao buscar notas." }); }
});

routes.post('/diario/notas', authMiddleware, async (req, res) => {
  try {
    const { alocacaoId, bimestre, notas } = req.body;
    for (const n of notas) {
      await prisma.nota.upsert({
        where: { alunoId_alocacaoId_bimestre: { alunoId: n.alunoId, alocacaoId, bimestre } },
        update: { n1: n.n1, n2: n.n2, n3: n.n3, n4: n.n4 },
        create: { alunoId: n.alunoId, alocacaoId, bimestre, n1: n.n1, n2: n.n2, n3: n.n3, n4: n.n4 }
      });
    }
    return res.json({ message: "Notas salvas!" });
  } catch(err) { res.status(500).json({ error: "Erro ao salvar notas" }); }
});

// ROTAS DE MÉTRICAS E DASHBOARDS (ALUNOS E ADMIN)
// ==========================================

// 1. Métricas Globais para o Admin
routes.get('/metricas/admin', authMiddleware, async (req, res) => {
  try {
    const alunos = await prisma.aluno.findMany();
    const notas = await prisma.nota.findMany();

    const totalAlunos = alunos.length;
    // Calcula a evasão (Inativos e Desistentes)
    const inativos = alunos.filter(a => a.status === 'Inativo' || a.status === 'Desistente').length;
    const taxaEvasao = totalAlunos > 0 ? ((inativos / totalAlunos) * 100).toFixed(1) : "0.0";

    // Calcula a média geral de toda a escola
    let somaGlobal = 0;
    let countGlobal = 0;
    notas.forEach(n => {
      const vals = [n.n1, n.n2, n.n3, n.n4].map(v => parseFloat(v?.replace(',', '.') || '0'));
      const media = vals.reduce((a, b) => a + b, 0) / 4;
      somaGlobal += media;
      countGlobal++;
    });
    const mediaInstituicao = countGlobal > 0 ? (somaGlobal / countGlobal).toFixed(1) : "0.0";

    // Calcula o desempenho dividido por Níveis de Ensino
    const niveis = ["Ensino Fundamental I", "Ensino Fundamental II", "Ensino Médio"];
    const segmentos = niveis.map(nivel => {
      const alunosNivel = alunos.filter(a => a.nivelEnsino === nivel || a.nivelEnsino.includes(nivel));
      const totalNivel = alunosNivel.length;
      
      const notasNivel = notas.filter(n => alunosNivel.some(a => a.id === n.alunoId));
      
      let somaNivel = 0;
      let aprovadas = 0;
      notasNivel.forEach(n => {
        const vals = [n.n1, n.n2, n.n3, n.n4].map(v => parseFloat(v?.replace(',', '.') || '0'));
        const media = vals.reduce((a, b) => a + b, 0) / 4;
        somaNivel += media;
        if(media >= 6.0) aprovadas++; // Nota de corte: 6.0
      });

      const mediaGeralNivel = notasNivel.length > 0 ? (somaNivel / notasNivel.length) : 0;
      const taxaAprovacao = notasNivel.length > 0 ? Math.round((aprovadas / notasNivel.length) * 100) : 0;

      return {
        nome: nivel,
        mediaGeral: mediaGeralNivel,
        taxaAprovacao,
        totalAlunos: totalNivel
      };
    });

    // Filtra segmentos que têm alunos para não mostrar blocos vazios
    const segmentosAtivos = segmentos.filter(s => s.totalAlunos > 0);

    return res.json({
      global: { evasao: taxaEvasao, media: mediaInstituicao, corte: "6.0" },
      segmentos: segmentosAtivos.length > 0 ? segmentosAtivos : [
        { nome: "Nenhum aluno cadastrado com notas", mediaGeral: 0, taxaAprovacao: 0, totalAlunos: 0 }
      ]
    });

  } catch(err) {
    return res.status(500).json({ error: "Erro ao gerar métricas institucionais." });
  }
});

// 2. Métricas Individuais do Aluno
routes.get('/metricas/aluno', authMiddleware, async (req, res) => {
  try {
    // Busca o aluno logado
    const aluno = await prisma.aluno.findUnique({ where: { userId: req.userId } });
    if(!aluno) return res.status(404).json({ error: "Aluno não encontrado" });

    const turmaStr = `${aluno.anoTurma} ${aluno.serieTurma}`;
    const totalAlunosTurma = await prisma.aluno.count({ 
      where: { anoTurma: aluno.anoTurma, serieTurma: aluno.serieTurma, status: "Matriculado" }
    });

    const notas = await prisma.nota.findMany({ where: { alunoId: aluno.id }, include: { alocacao: true }});
    const frequencias = await prisma.frequencia.findMany({ where: { alunoId: aluno.id }, include: { alocacao: true }});

    const disciplinasMap: any = {};

    // Agrupa as presenças
    frequencias.forEach(f => {
      const disc = f.alocacao.disciplina;
      if(!disciplinasMap[disc]) disciplinasMap[disc] = { id: f.alocacao.id, nome: disc, faltas: 0, aulasDadas: 0, media: 0 };
      disciplinasMap[disc].aulasDadas++;
      if(!f.presente) disciplinasMap[disc].faltas++;
    });

    // Agrupa as Notas
    let somaGeral = 0;
    let countGeral = 0;
    notas.forEach(n => {
      const disc = n.alocacao.disciplina;
      if(!disciplinasMap[disc]) disciplinasMap[disc] = { id: n.alocacao.id, nome: disc, faltas: 0, aulasDadas: 0, media: 0 };
      const vals = [n.n1, n.n2, n.n3, n.n4].map(v => parseFloat(v?.replace(',', '.') || '0'));
      const media = vals.reduce((a, b) => a + b, 0) / 4;
      disciplinasMap[disc].media = media;
      
      somaGeral += media;
      countGeral++;
    });

    const subjects = Object.values(disciplinasMap);
    const mediaGeral = countGeral > 0 ? (somaGeral / countGeral) : 0;

    let totalAulas = 0;
    let totalFaltas = 0;
    subjects.forEach((s: any) => { totalAulas += s.aulasDadas; totalFaltas += s.faltas; });
    const frequenciaGeral = totalAulas > 0 ? Math.round(((totalAulas - totalFaltas) / totalAulas) * 100) : 100;

    return res.json({
      stats: {
        turma: turmaStr,
        totalAlunos: totalAlunosTurma,
        posicaoRanking: 1, // Fixado como top 1 por simplicidade de cálculo
        mediaGeral,
        frequenciaGeral
      },
      subjects
    });

  } catch(err) {
    return res.status(500).json({ error: "Erro ao gerar métricas do aluno" });
  }
});

// 3. Métricas Globais para o Coordenador
routes.get('/metricas/coordinator', authMiddleware, async (req, res) => {
  try {
    const alunos = await prisma.aluno.findMany();
    const notas = await prisma.nota.findMany();

    const totalAlunos = alunos.length;
    
    // Calcula a evasão (Inativos e Desistentes)
    const inativos = alunos.filter(a => a.status === 'Inativo' || a.status === 'Desistente').length;
    const taxaEvasao = totalAlunos > 0 ? ((inativos / totalAlunos) * 100).toFixed(1) : "0.0";

    // Calcula a média geral de toda a escola
    let somaGlobal = 0;
    let countGlobal = 0;
    notas.forEach(n => {
      const vals = [n.n1, n.n2, n.n3, n.n4].map(v => parseFloat(v?.replace(',', '.') || '0'));
      const media = vals.reduce((a, b) => a + b, 0) / 4;
      somaGlobal += media;
      countGlobal++;
    });
    const mediaInstituicao = countGlobal > 0 ? (somaGlobal / countGlobal).toFixed(1) : "0.0";

    // Calcula o desempenho dividido por Níveis de Ensino
    const niveis = ["Ensino Fundamental I", "Ensino Fundamental II", "Ensino Médio"];
    const segmentos = niveis.map(nivel => {
      const alunosNivel = alunos.filter(a => a.nivelEnsino === nivel || a.nivelEnsino.includes(nivel));
      const totalNivel = alunosNivel.length;
      
      const notasNivel = notas.filter(n => alunosNivel.some(a => a.id === n.alunoId));
      
      let somaNivel = 0;
      let aprovadas = 0;
      notasNivel.forEach(n => {
        const vals = [n.n1, n.n2, n.n3, n.n4].map(v => parseFloat(v?.replace(',', '.') || '0'));
        const media = vals.reduce((a, b) => a + b, 0) / 4;
        somaNivel += media;
        if(media >= 6.0) aprovadas++; // Nota de corte estipulada: 6.0
      });

      const mediaGeralNivel = notasNivel.length > 0 ? (somaNivel / notasNivel.length) : 0;
      const taxaAprovacao = notasNivel.length > 0 ? Math.round((aprovadas / notasNivel.length) * 100) : 0;

      return {
        nome: nivel,
        mediaGeral: mediaGeralNivel,
        taxaAprovacao,
        totalAlunos: totalNivel
      };
    });

    // Filtra para mostrar apenas os segmentos que realmente têm alunos cadastrados
    const segmentosAtivos = segmentos.filter(s => s.totalAlunos > 0);

    return res.json({
      global: { evasao: taxaEvasao, media: mediaInstituicao, corte: "6.0" },
      segmentos: segmentosAtivos.length > 0 ? segmentosAtivos : [
        { nome: "Nenhum aluno cadastrado com notas", mediaGeral: 0, taxaAprovacao: 0, totalAlunos: 0 }
      ]
    });

  } catch(err) {
    return res.status(500).json({ error: "Erro ao gerar métricas da coordenação." });
  }
});

export default routes;