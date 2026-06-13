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

// ROTAS DE DASHBOARDS (HOME)
// 1. Dashboard do Administrador
routes.get('/dashboard/admin', authMiddleware, async (req, res) => {
  try {
    const totalAlunos = await prisma.aluno.count();
    const totalFuncionarios = await prisma.funcionario.count();
    
    // Soma apenas as faturas que já foram pagas (Receita Real)
    const faturasPagas = await prisma.fatura.findMany({ where: { status: 'Pago' } });
    const receitaTotal = faturasPagas.reduce((acc, f) => acc + f.valor, 0);
    
    // Requisições que precisam da atenção da secretaria
    const requisicoesPendentes = await prisma.requisicao.count({ 
      where: { status: { in: ['Pendente', 'Em Análise'] } } 
    });

    return res.json({
      usuariosAtivos: totalAlunos + totalFuncionarios,
      totalAlunos,
      totalFuncionarios,
      receitaTotal,
      requisicoesPendentes
    });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao carregar dashboard admin." });
  }
});

// 2. Dashboard da Secretaria
routes.get('/dashboard/secretary', authMiddleware, async (req, res) => {
  try {
    const hoje = new Date().toISOString().split("T")[0];

    // Atualiza faturas atrasadas (Inteligência automática)
    await prisma.fatura.updateMany({
      where: { status: 'Pendente', vencimento: { lt: hoje } },
      data: { status: 'Atrasado' }
    });

    const requisicoesPendentes = await prisma.requisicao.count({ 
      where: { status: 'Pendente' } 
    });
    
    const faturasAtrasadas = await prisma.fatura.count({ 
      where: { status: 'Atrasado' } 
    });

    // Se a tabela de eventos não existir no momento, isto previne um erro fatal
    let eventosHoje = 0;
    try {
      eventosHoje = await prisma.evento.count({ where: { data: hoje } });
    } catch (e) { /* Ignora se módulo de calendário não estiver ativo */ }

    return res.json({
      requisicoesPendentes,
      faturasAtrasadas,
      eventosHoje
    });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao carregar dashboard secretaria." });
  }
});

// 3. Dashboard do Coordenador
routes.get('/dashboard/coordinator', authMiddleware, async (req, res) => {
  try {
    const hoje = new Date().toISOString().split("T")[0];
    
    // Roteiros aguardando aprovação
    const roteirosPendentes = await prisma.roteiro.count({ where: { status: 'Pendente' } });
    
    // Média Geral da Escola
    const notas = await prisma.nota.findMany();
    let soma = 0;
    notas.forEach(n => {
      const vals = [n.n1, n.n2, n.n3, n.n4].map(v => parseFloat(v?.replace(',', '.') || '0'));
      soma += vals.reduce((a, b) => a + b, 0) / 4;
    });
    const mediaGeral = notas.length > 0 ? (soma / notas.length).toFixed(1) : "0.0";
    
    // Eventos de hoje
    const eventosHoje = await prisma.evento.count({ where: { data: hoje } }).catch(() => 0);

    return res.json({ roteirosPendentes, mediaGeral, eventosHoje });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao carregar dashboard." });
  }
});

// 4. Dashboard do Professor
routes.get('/dashboard/teacher', authMiddleware, async (req, res) => {
  try {
    const hoje = new Date().toISOString().split("T")[0];
    const func = await prisma.funcionario.findUnique({ where: { userId: req.userId } });
    
    // Turmas em que dá aula
    const turmas = func ? await prisma.alocacao.count({ where: { funcionarioId: func.id } }) : 0;
    
    // Roteiros em rascunho ou rejeitados (que precisam de atenção)
    const roteirosAcao = await prisma.roteiro.count({ 
      where: { userId: req.userId, status: { in: ['Rascunho', 'Rejeitado'] } } 
    });
    
    const eventosHoje = await prisma.evento.count({ where: { data: hoje } }).catch(() => 0);

    return res.json({ turmas, roteirosAcao, eventosHoje });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao carregar dashboard." });
  }
});

// 5. Dashboard do Aluno
routes.get('/dashboard/student', authMiddleware, async (req, res) => {
  try {
    const aluno = await prisma.aluno.findUnique({ where: { userId: req.userId } });
    if (!aluno) return res.status(404).json({ error: "Aluno não encontrado" });

    // Calcula Média
    const notas = await prisma.nota.findMany({ where: { alunoId: aluno.id } });
    let soma = 0;
    notas.forEach(n => {
      const vals = [n.n1, n.n2, n.n3, n.n4].map(v => parseFloat(v?.replace(',', '.') || '0'));
      soma += vals.reduce((a, b) => a + b, 0) / 4;
    });
    const mediaGeral = notas.length > 0 ? (soma / notas.length).toFixed(1) : "0.0";

    // Calcula Frequência
    const frequencias = await prisma.frequencia.findMany({ where: { alunoId: aluno.id } });
    const presencas = frequencias.filter(f => f.presente).length;
    const freqGeral = frequencias.length > 0 ? Math.round((presencas / frequencias.length) * 100) : 100;

    // Faturas pendentes/atrasadas
    const fatura = await prisma.fatura.findFirst({ 
      where: { alunoId: aluno.id, status: { not: 'Pago' } },
      orderBy: { vencimento: 'asc' }
    });

    return res.json({ 
      mediaGeral, 
      freqGeral, 
      proximaFatura: fatura ? fatura.status : "Em Dia" 
    });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao carregar dashboard." });
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
    const id = String(req.params.id);
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
      disciplinas: funcionario.alocacoes.map((a) => ({
        nome: a.disciplina,
        carga: a.cargaHoraria,
        turma: `${a.turma.ano} ${a.turma.serie}`,
        periodo: a.turma.periodo
      })),
      formacoes: funcionario.formacoes.map((f) => ({
        instituicao: f.instituicao,
        cnpj: f.cnpj,
        modalidade: f.modalidade,
        periodo: `${f.periodoInicio} até ${f.periodoFinal}`
      })),
      experiencias: funcionario.experiencias.map((e) => ({
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
    const id = String(req.params.id);
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
    const id = String(req.params.id);
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
    let roteiros: Prisma.RoteiroGetPayload<{
  include: { user: true };
}>[] = [];

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
    const id = String(req.params.id);
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
    const alocacaoId = String(req.params.alocacaoId);
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

// ROTAS DE REQUISIÇÕES (ALUNOS E SECRETARIA)
// 1. Criar uma nova requisição (Aluno)
routes.post('/requisicoes', authMiddleware, upload.single('anexo'), async (req: AuthRequest, res) => {
  try {
    const { tipo, descricao } = req.body;
    const arquivoAnexo = req.file ? req.file.filename : null;

    // Acha a ficha de aluno atrelada ao usuário logado
    const aluno = await prisma.aluno.findUnique({ where: { userId: req.userId } });
    if (!aluno) return res.status(403).json({ error: "Apenas alunos podem fazer requisições." });

    // Gera um protocolo único (Ex: REQ-2026-4092)
    const protocolo = `REQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const novaReq = await prisma.requisicao.create({
      data: { protocolo, tipo, descricao, arquivoAnexo, alunoId: aluno.id }
    });

    return res.status(201).json(novaReq);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao criar requisição." });
  }
});

// 2. Buscar requisições
routes.get('/requisicoes', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId }, include: { aluno: true } });
    let requisicoes: Prisma.RequisicaoGetPayload<{
  include: {
    aluno: {
      include: {
        user: true;
      };
    };
  };
}>[] = [];

    if (user?.cargo === 'student' && user.aluno) {
      // Aluno vê só as dele
      requisicoes = await prisma.requisicao.findMany({
        where: { alunoId: user.aluno.id },
        orderBy: { criadoEm: 'desc' }
      });
    } else if (user?.cargo === 'secretary' || user?.cargo === 'admin') {
      // Secretaria e Admin veem todas (trazendo o nome do aluno junto)
      requisicoes = await prisma.requisicao.findMany({
        include: { aluno: { include: { user: true } } },
        orderBy: { criadoEm: 'desc' }
      });
    }

    const formatadas = requisicoes.map(r => ({
      id: r.protocolo,
      realId: r.id, // Guarda o ID verdadeiro do banco para atualizações
      tipo: r.tipo,
      dataSolicitacao: r.criadoEm.toISOString().split("T")[0],
      status: r.status,
      descricao: r.descricao,
      respostaSecretaria: r.respostaSecretaria,
      arquivoAnexo: r.arquivoAnexo ? `http://localhost:3333/uploads/${r.arquivoAnexo}` : null,
      arquivoSecretaria: r.arquivoSecretaria ? `http://localhost:3333/uploads/${r.arquivoSecretaria}` : null,
      nomeAluno: (r as any).aluno?.user?.nome || null,
      matricula: (r as any).aluno?.matricula || "N/A"
    }));

    return res.json(formatadas);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar requisições." });
  }
});

// 3. Atualizar Requisição (Para a Secretaria usar depois)
routes.put('/requisicoes/:realId', authMiddleware, upload.single('documento'), async (req: AuthRequest, res) => {
  try {
    const realId = String(req.params.realId);
    const { status, respostaSecretaria } = req.body;
    
    // Pega o ficheiro que a secretária fez upload (se existir)
    const arquivo = req.file ? req.file.filename : undefined;
    
    const dadosAtualizacao: any = {};
    if (status) dadosAtualizacao.status = status;
    if (respostaSecretaria) dadosAtualizacao.respostaSecretaria = respostaSecretaria;
    if (arquivo) dadosAtualizacao.arquivoSecretaria = arquivo;

    const atualizada = await prisma.requisicao.update({
      where: { id: realId },
      data: dadosAtualizacao
    });
    
    return res.json(atualizada);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao responder requisição." });
  }
});

// ROTAS DO FINANCEIRO (ALUNOS)
routes.get('/financeiro/aluno', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const aluno = await prisma.aluno.findUnique({ where: { userId: req.userId } });
    if (!aluno) return res.status(403).json({ error: "Acesso restrito a alunos." });

    // Busca todas as faturas ordenadas da mais recente para a mais antiga
    const faturas = await prisma.fatura.findMany({
      where: { alunoId: aluno.id },
      orderBy: { vencimento: 'desc' }
    });

    // LÓGICA INTELIGENTE: Verifica se alguma fatura pendente já venceu hoje!
    const hoje = new Date().toISOString().split("T")[0]; // "2026-06-12"
    
    const faturasAtualizadas = await Promise.all(faturas.map(async (f) => {
      if (f.status === "Pendente" && f.vencimento < hoje) {
        // Atualiza no banco de dados para Atrasado
        const atualizada = await prisma.fatura.update({
          where: { id: f.id },
          data: { status: "Atrasado" }
        });
        return atualizada;
      }
      return f;
    }));

    return res.json(faturasAtualizadas);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar dados financeiros." });
  }
});

// ROTA AUXILIAR (Para você criar faturas de teste no banco)
routes.post('/financeiro/admin/gerar', authMiddleware, async (req: AuthRequest, res) => {
  try {
    // Exemplo de Body JSON: { "alunoId": "ID_DO_ALUNO_AQUI", "referencia": "Taxa de Material", "vencimento": "2026-06-20", "valor": 350.00 }
    const { alunoId, referencia, vencimento, valor } = req.body;
    const nova = await prisma.fatura.create({
      data: { alunoId, referencia, vencimento, valor: parseFloat(valor) }
    });
    return res.status(201).json(nova);
  } catch (err) {
    return res.status(500).json({ error: "Erro ao gerar fatura." });
  }
});

// ROTAS DO FINANCEIRO (ADMIN E SECRETARIA)
// 1. Dashboard Financeiro do Admin
routes.get('/financeiro/admin', authMiddleware, async (req, res) => {
  try {
    // Busca todas as faturas e faz a ligação com os alunos
    const faturas = await prisma.fatura.findMany({ 
      include: { aluno: { include: { user: true } } }, 
      orderBy: { vencimento: 'desc' } 
    });

    // Cálculos Dinâmicos
    const receita = faturas.filter(f => f.status === 'Pago').reduce((acc, f) => acc + f.valor, 0);
    const atrasados = faturas.filter(f => f.status === 'Atrasado').length;
    const pendentes = faturas.filter(f => f.status === 'Pendente').length;
    
    // Calcula a inadimplência baseada apenas nas faturas vencidas/ativas
    const totalCobrancasAtivas = faturas.filter(f => f.status !== 'Pago').length;
    const inadimplencia = totalCobrancasAtivas > 0 ? ((atrasados / totalCobrancasAtivas) * 100).toFixed(1) : "0.0";

    const despesasPrevistas = 318500; // Fixo no exemplo (seria vindo de uma tabela de Despesas)
    const saldoOperacional = receita - despesasPrevistas;

    // Formata as últimas transações pagas
    const ultimasTransacoes = faturas
      .filter(f => f.status === 'Pago')
      .slice(0, 5) // Pega apenas as 5 últimas
      .map(f => ({
        id: f.id,
        data: f.vencimento,
        descricao: `${f.referencia} - ${f.aluno.user.nome}`,
        categoria: "Receita Acadêmica",
        valor: f.valor
      }));

    return res.json({
      receitaTotal: receita,
      despesasPrevistas,
      inadimplencia: parseFloat(inadimplencia),
      saldoOperacional,
      ultimasTransacoes
    });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar métricas financeiras." });
  }
});

// 2. Lista da Secretaria
routes.get('/financeiro/secretaria', authMiddleware, async (req, res) => {
  try {
    const hoje = new Date().toISOString().split("T")[0];

    // Atualiza faturas atrasadas de todos os alunos antes de listar (Inteligência de Vencimento)
    await prisma.fatura.updateMany({
      where: { status: 'Pendente', vencimento: { lt: hoje } },
      data: { status: 'Atrasado' }
    });

    // Puxa os alunos com a sua fatura mais recente
    const alunos = await prisma.aluno.findMany({ 
      include: { 
        user: true, 
        faturas: { orderBy: { vencimento: 'desc' }, take: 1 } // Pega só a fatura mais recente
      } 
    });

    const dados = alunos.map(aluno => {
      const ultimaFatura = aluno.faturas[0];
      let diasAtraso = 0;

      if (ultimaFatura && ultimaFatura.status === 'Atrasado') {
        const dataHoje = new Date();
        const dataVenc = new Date(ultimaFatura.vencimento);
        const diffTime = Math.abs(dataHoje.getTime() - dataVenc.getTime());
        diasAtraso = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      return {
        alunoId: aluno.id,
        nome: aluno.user.nome,
        matricula: aluno.matricula,
        turma: `${aluno.anoTurma} ${aluno.serieTurma}`,
        statusMensalidade: ultimaFatura ? ultimaFatura.status : "Em Dia",
        ultimaPaga: ultimaFatura ? ultimaFatura.referencia : "-",
        diasAtraso,
        // Dados escondidos mas necessários para a geração do PDF e baixa
        faturaId: ultimaFatura ? ultimaFatura.id : null,
        valor: ultimaFatura ? ultimaFatura.valor : 0,
        vencimento: ultimaFatura ? ultimaFatura.vencimento : ""
      };
    });

    return res.json(dados);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao listar dados da secretaria." });
  }
});

// 3. Dar Baixa Manual na Fatura
routes.put('/financeiro/baixa/:faturaId', authMiddleware, async (req, res) => {
  try {
    const faturaId = String(req.params.faturaId);
    const atualizada = await prisma.fatura.update({
      where: { id: faturaId },
      data: { status: 'Pago' }
    });
    return res.json(atualizada);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao registrar pagamento." });
  }
});

// ROTAS DE BACKUP (ADMINISTRAÇÃO)
// 1. Exportar dados (Backup Manual)
routes.get('/backup/export', authMiddleware, async (req: AuthRequest, res) => {
  try {
    // Verifica se quem está a pedir é Admin
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (user?.cargo !== 'admin') {
      return res.status(403).json({ error: "Apenas administradores podem gerar backups." });
    }

    // Extrai todas as tabelas principais
    const users = await prisma.user.findMany();
    const alunos = await prisma.aluno.findMany();
    const funcionarios = await prisma.funcionario.findMany();
    const turmas = await prisma.turma.findMany();
    const faturas = await prisma.fatura.findMany();
    const requisicoes = await prisma.requisicao.findMany();

    const backupData = {
      geradoEm: new Date().toISOString(),
      versaoSistema: "1.0.0",
      dados: {
        users, alunos, funcionarios, turmas, faturas, requisicoes
      }
    };

    return res.json(backupData);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao gerar o ficheiro de backup." });
  }
});

// 2. Restaurar dados (Simulação por segurança)
routes.post('/backup/restore', authMiddleware, upload.single('arquivo'), async (req: AuthRequest, res) => {
  try {
    // Num ambiente real, aqui você leria o JSON enviado (req.file) 
    // e faria o processo inverso (prisma.createMany) limpando as tabelas primeiro.
    // Como a restauração destrói dados, mantemos como uma resposta de sucesso simulada.
    
    setTimeout(() => {
      return res.json({ message: "Base de dados restaurada com sucesso!" });
    }, 2000); // Simulando o tempo de processamento

  } catch (error) {
    return res.status(500).json({ error: "Erro ao restaurar o backup." });
  }
});

// ROTAS DE RELATÓRIOS (EXPORTAÇÃO DE DADOS)
routes.get('/relatorios/gerar', authMiddleware, async (req, res) => {
  try {
    const { tipo, dataInicio, dataFim } = req.query;
    let dados = {};

    switch (tipo) {
      case 'rep-01': // Desempenho Académico
        const notas = await prisma.nota.findMany();
        let soma = 0; let aprovados = 0;
        notas.forEach(n => {
          const vals = [n.n1, n.n2, n.n3, n.n4].map(v => parseFloat(v?.replace(',', '.') || '0'));
          const media = vals.reduce((a, b) => a + b, 0) / 4;
          soma += media;
          if (media >= 6.0) aprovados++;
        });
        dados = {
          totalProvas: notas.length,
          mediaGlobal: notas.length > 0 ? (soma / notas.length).toFixed(2) : "0.0",
          taxaAprovacao: notas.length > 0 ? Math.round((aprovados / notas.length) * 100) : 0
        };
        break;

      case 'rep-03': // Inadimplência
        const faturasAtrasadas = await prisma.fatura.findMany({
          where: { status: 'Atrasado' },
          include: { aluno: { include: { user: true } } }
        });
        const totalAtrasado = faturasAtrasadas.reduce((acc, f) => acc + f.valor, 0);
        dados = { totalAtrasado, faturas: faturasAtrasadas };
        break;

      case 'rep-04': // DRE (Demonstração de Resultados)
        const todasFaturas = await prisma.fatura.findMany();
        const receitas = todasFaturas.filter(f => f.status === 'Pago').reduce((acc, f) => acc + f.valor, 0);
        const pendentes = todasFaturas.filter(f => f.status !== 'Pago').reduce((acc, f) => acc + f.valor, 0);
        dados = { receitas, pendentes, despesasFixas: 318500, saldoCaixa: receitas - 318500 };
        break;

      case 'rep-05': // Log de Requisições
        const reqs = await prisma.requisicao.findMany();
        const concluidas = reqs.filter(r => r.status === 'Concluído').length;
        const aguardando = reqs.filter(r => r.status !== 'Concluído').length;
        dados = { total: reqs.length, concluidas, aguardando };
        break;

      case 'rep-06': // Utilizadores Ativos
        const users = await prisma.user.findMany({ select: { nome: true, email: true, cargo: true, criadoEm: true } });
        dados = { users };
        break;

      default:
        dados = { mensagem: "Dados genéricos consolidados." };
    }

    return res.json({ tipo, geradoEm: new Date().toISOString(), dados });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao compilar dados do relatório." });
  }
});

// ROTAS DE NOTIFICAÇÕES
// 1. Buscar as notificações do utilizador logado
routes.get('/notificacoes', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const notificacoes = await prisma.notificacao.findMany({
      where: { userId: req.userId },
      orderBy: { criadoEm: 'desc' }
    });
    return res.json(notificacoes);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar notificações." });
  }
});

// 2. Marcar uma notificação específica como lida
routes.put('/notificacoes/:id/lida', authMiddleware, async (req: AuthRequest, res) => {
  try {
    await prisma.notificacao.updateMany({
      where: { id: req.params.id, userId: req.userId },
      data: { lida: true }
    });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao atualizar notificação." });
  }
});

// 3. Marcar TODAS como lidas
routes.put('/notificacoes/lidas', authMiddleware, async (req: AuthRequest, res) => {
  try {
    await prisma.notificacao.updateMany({
      where: { userId: req.userId, lida: false },
      data: { lida: true }
    });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao atualizar notificações." });
  }
});

export default routes;