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

// 1. REGISTRO
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

// 2. LOGIN
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

// 3. PERFIL
routes.get('/perfil', authMiddleware, async (req: AuthRequest, res) => {
  try {
    // Trazer a ficha de aluno ou funcionário ligada a este login
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

    // Prioriza a foto do Perfil. Se não tiver, puxa a foto do cadastro original
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

    // Atualiza faturas atrasadas
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
    
    const eventosHoje = await prisma.evento.count({ where: { data: hoje } }).catch(() => 0);

    return res.json({ roteirosPendentes, mediaGeral, eventosHoje });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao carregar dashboard." });
  }
});

// 4. Dashboard do Professor
routes.get('/dashboard/teacher', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const hoje = new Date().toISOString().split("T")[0];
    const func = await prisma.funcionario.findUnique({ where: { userId: req.userId } });
    
    // Turmas em que dá aula
    const turmas = func ? await prisma.alocacao.count({ where: { funcionarioId: func.id } }) : 0;
    
    // Roteiros em rascunho ou rejeitados
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
routes.get('/dashboard/student', authMiddleware, async (req: AuthRequest, res) => {
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

// 4. CADASTRAR ALUNO
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

// 5. LISTAR ALUNOS
routes.get('/alunos', authMiddleware, async (req, res) => {
  try {
    // Apanha a página atual e o limite da URL (Por padrão: página 1, limite de 10 itens)
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Faz duas buscas em simultâneo: Pega os alunos daquela página e conta o total geral
    const [alunosBrutos, totalAlunos] = await Promise.all([
      prisma.aluno.findMany({
        skip,
        take: limit,
        include: { user: true },
        orderBy: { user: { nome: 'asc' } } 
      }),
      prisma.aluno.count() 
    ]);

    // Formata os dados para o frontend
    const formatados = alunosBrutos.map(a => ({
      id: a.id,
      matricula: a.matricula,
      nome: a.user.nome,
      status: a.status,
      nivel: a.nivelEnsino,
      ano: a.anoTurma,
      serie: a.serieTurma,
      anoLetivo: "2026"
    }));

    return res.json({
      data: formatados,
      meta: {
        total: totalAlunos,
        paginaAtual: page,
        totalPaginas: Math.ceil(totalAlunos / limit),
      }
    });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar alunos." });
  }
});

// 6. BUSCAR ALUNO POR ID
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

// 7. EDITAR ALUNO
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

// 8. EXCLUIR ALUNO
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

// ROTAS DE FUNCIONÁRIOS
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

// Listar funcionários
routes.get('/funcionarios', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [funcionariosBrutos, totalFuncionarios] = await Promise.all([
      prisma.funcionario.findMany({
        skip,
        take: limit,
        include: { user: true },
        orderBy: { user: { nome: 'asc' } } 
      }),
      prisma.funcionario.count() 
    ]);

    const formatados = funcionariosBrutos.map(f => ({
      id: f.id,
      ra: f.ra,
      nome: f.user.nome,
      cargo: f.vaga,
      contrato: f.contrato,
      status: f.status
    }));

    return res.json({
      data: formatados,
      meta: {
        total: totalFuncionarios,
        paginaAtual: page,
        totalPaginas: Math.ceil(totalFuncionarios / limit),
      }
    });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar funcionários." });
  }
});

// Buscar funcionário por ID
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

// Rota de perfil
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

// Atualizar perfil
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

// ROTAS DE EVENTOS
routes.post('/eventos', authMiddleware, async (req, res) => {
  try {
    const { titulo, descricao, data, tipo, horarioInicio, horarioFim } = req.body;
    
    const novoEvento = await prisma.evento.create({
      data: { titulo, descricao, data, tipo, horarioInicio, horarioFim }
    });

    const todosUsuarios = await prisma.user.findMany();
    
    if (todosUsuarios.length > 0) {
      const notificacoes = todosUsuarios.map(usuario => ({
        userId: usuario.id,
        titulo: "Novo Evento no Calendário 📅",
        mensagem: `O evento "${titulo}" foi agendado para o dia ${data.split('-').reverse().join('/')}.`
      }));
      await prisma.notificacao.createMany({ data: notificacoes });
    }

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

    // Buscar o roteiro antigo primeiro para saber se o status mudou
    const roteiroAntigo = await prisma.roteiro.findUnique({ where: { id } });

    const data: any = {};
    if (titulo !== undefined) data.titulo = titulo;
    if (disciplina !== undefined) data.disciplina = disciplina;
    if (turma !== undefined) data.turma = turma;
    if (dataAplicacao !== undefined) data.dataAplicacao = dataAplicacao;
    if (status !== undefined) data.status = status;
    if (conteudo !== undefined) data.conteudo = conteudo;
    if (metodologia !== undefined) data.metodologia = metodologia;
    if (feedbackCoordenador !== undefined) data.feedbackCoordenador = feedbackCoordenador;

    const roteiroAtualizado = await prisma.roteiro.update({
      where: { id },
      data
    });

    if (status && roteiroAntigo && status !== roteiroAntigo.status) {
      const iconeStatus = status === 'Aprovado' ? "✅" : status === 'Rejeitado' ? "❌" : "⚠️";
      
      await prisma.notificacao.create({
        data: {
          userId: roteiroAtualizado.userId, 
          titulo: `Roteiro ${status} ${iconeStatus}`,
          mensagem: `O seu roteiro de ${roteiroAtualizado.disciplina} ("${roteiroAtualizado.titulo}") foi marcado como ${status}.`
        }
      });
    }

    return res.json(roteiroAtualizado);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao atualizar roteiro." });
  }
});

routes.delete('/roteiros/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params as { id: string };
    await prisma.roteiro.delete({ where: { id } });
    
    return res.json({ mensagem: "Roteiro excluído com sucesso!" });
  } catch (error) {
    return res.status(500).json({ error: "Erro ao excluir roteiro." });
  }
});

// ROTAS DE DIÁRIO DE CLASSE E NOTAS
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
      await prisma.frequencia.upsert({ 
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

// ROTAS DE SALVAR DO PROFESSOR
// 1. Salvar Notas
routes.post('/diario/notas', authMiddleware, async (req, res) => {
  try {
    const { alocacaoId, bimestre, notas } = req.body;

    await prisma.nota.deleteMany({
      where: { alocacaoId: alocacaoId, bimestre: bimestre }
    });

    const novasNotas = notas.map((n: any) => ({
      alunoId: n.alunoId,
      alocacaoId: alocacaoId,
      bimestre: bimestre,
      n1: n.n1,
      n2: n.n2,
      n3: n.n3,
      n4: n.n4 || ""
    }));

    await prisma.nota.createMany({ data: novasNotas });

    const alunosIds = [...new Set(notas.map((n: any) => n.alunoId))];
    const alunosAfetados = await prisma.aluno.findMany({
      where: { id: { in: alunosIds as string[] } },
      include: { user: true }
    });

    if (alunosAfetados.length > 0) {
      const notificacoes = alunosAfetados.map(aluno => ({
        userId: aluno.user.id,
        titulo: "Notas Lançadas",
        mensagem: `As suas notas do ${bimestre} foram atualizadas no boletim.`
      }));
      await prisma.notificacao.createMany({ data: notificacoes });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao salvar notas no banco." });
  }
});

// 2. Salvar Frequência
routes.post('/diario/frequencia', authMiddleware, async (req, res) => {
  try {
    const { alocacaoId, data, frequencias } = req.body;

    await prisma.frequencia.deleteMany({
      where: {
        alocacaoId: alocacaoId, 
        data: data
      }
    });

    const novasFrequencias = frequencias.map((f: any) => ({
      alunoId: f.alunoId,
      alocacaoId: alocacaoId,
      data: data,
      presente: f.presente,
      observacao: f.observacao || ""
    }));

    await prisma.frequencia.createMany({ data: novasFrequencias });

    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao salvar frequências." });
  }
});

// ROTAS DE MÉTRICAS E DASHBOARDS
// 1. ROTAS DE PERFORMANCE (Admin e Coordenador)
const gerarMetricasGlobais = async () => {
  // Busca todos os alunos ativos e as suas notas
  const alunosMatriculados = await prisma.aluno.findMany({
    where: { status: { not: 'Inativo' } },
    include: { notas: true }
  });

  // Calcula a evasão (Inativos vs Total)
  const inativos = await prisma.aluno.count({ where: { status: 'Inativo' } });
  const totalGeral = alunosMatriculados.length + inativos;
  const evasao = totalGeral > 0 ? ((inativos / totalGeral) * 100).toFixed(1) : "0.0";

  let somaMediaGlobal = 0;
  let alunosComNota = 0;

  // Agrupador por Nível de Ensino
  const niveisMap = new Map();

  alunosMatriculados.forEach(aluno => {
    // Calcula a Média do Aluno
    let somaAluno = 0;
    aluno.notas.forEach(nota => {
      const vals = [nota.n1, nota.n2, nota.n3, nota.n4].map(v => parseFloat(v?.replace(',', '.') || '0'));
      somaAluno += vals.reduce((a, b) => a + b, 0) / 4;
    });
    const mediaDoAluno = aluno.notas.length > 0 ? (somaAluno / aluno.notas.length) : 0;

    // Alimenta a Média Global da Escola
    if (mediaDoAluno > 0) {
      somaMediaGlobal += mediaDoAluno;
      alunosComNota++;
    }

    // Separa o aluno pelo Nível de Ensino
    const nivel = aluno.nivelEnsino || "Não Classificado";
    if (!niveisMap.has(nivel)) {
      niveisMap.set(nivel, { totalAlunos: 0, somaDasMedias: 0, aprovados: 0, alunosAvaliados: 0 });
    }

    const dadosNivel = niveisMap.get(nivel);
    dadosNivel.totalAlunos += 1;
    
    if (mediaDoAluno > 0) {
      dadosNivel.somaDasMedias += mediaDoAluno;
      dadosNivel.alunosAvaliados += 1;
      if (mediaDoAluno >= 6.0) dadosNivel.aprovados += 1;
    }
  });

  const mediaGlobalFormatada = alunosComNota > 0 ? (somaMediaGlobal / alunosComNota).toFixed(1) : "0.0";

  const segmentos = Array.from(niveisMap.entries()).map(([nome, dados]) => {
    const mediaNivel = dados.alunosAvaliados > 0 ? (dados.somaDasMedias / dados.alunosAvaliados) : 0;
    const taxaAprovacao = dados.alunosAvaliados > 0 ? Math.round((dados.aprovados / dados.alunosAvaliados) * 100) : 0;

    return {
      nome: nome,
      totalAlunos: dados.totalAlunos,
      mediaGeral: mediaNivel,
      taxaAprovacao: taxaAprovacao
    };
  });

  return {
    global: { evasao, media: mediaGlobalFormatada, corte: "6.0" },
    segmentos
  };
};

// Rota do Admin
routes.get('/metricas/admin', authMiddleware, async (req, res) => {
  try {
    const dados = await gerarMetricasGlobais();
    return res.json(dados);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao gerar métricas." });
  }
});

// Rota do Coordenador
routes.get('/metricas/coordinator', authMiddleware, async (req, res) => {
  try {
    const dados = await gerarMetricasGlobais();
    return res.json(dados);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao gerar métricas." });
  }
});

// 2. Métricas Individuais do Aluno
routes.get('/metricas/aluno', authMiddleware, async (req: AuthRequest, res) => {
  try {
    // Descobre quem é o aluno logado e a sua turma
    const alunoLogado = await prisma.aluno.findUnique({ 
      where: { userId: req.userId },
      include: { user: true }
    });

    if (!alunoLogado) {
      return res.status(404).json({ error: "Aluno não encontrado" });
    }

    // Busca TODOS os alunos que estão na exata mesma turma
    const colegas = await prisma.aluno.findMany({
      where: {
        anoTurma: alunoLogado.anoTurma,
        serieTurma: alunoLogado.serieTurma
      },
      include: {
        user: true,
        notas: true 
      }
    });

    // Calcula a média matemática (PARCIAL) de todos os alunos da sala para o Ranking
    const rankingDaTurma = colegas.map(colega => {
      let soma = 0;
      colega.notas.forEach(nota => {
        // Divide por 3: Prova, Atividades, Participação
        const valores = [nota.n1, nota.n2, nota.n3].map(v => parseFloat(v?.replace(',', '.') || '0'));
        soma += valores.reduce((a, b) => a + b, 0) / 3;
      });
      const mediaParcialDoColega = colega.notas.length > 0 ? (soma / colega.notas.length) : 0;
      return { id: colega.id, nome: colega.user.nome, media: mediaParcialDoColega };
    });

    const top3Dinâmico = rankingDaTurma.sort((a, b) => b.media - a.media).slice(0, 3);
    const posicaoRanking = rankingDaTurma.findIndex(a => a.id === alunoLogado.id) + 1;
    const mediaDoAluno = rankingDaTurma.find(a => a.id === alunoLogado.id)?.media || 0;

    // BUSCA AS DISCIPLINAS REAIS DO ALUNO E ORGANIZA POR BIMESTRE
    const notasDoAluno = await prisma.nota.findMany({
      where: { alunoId: alunoLogado.id },
      include: { alocacao: true }
    });

    const frequenciasDoAluno = await prisma.frequencia.findMany({
      where: { alunoId: alunoLogado.id }
    });

    const totalAulasGeral = frequenciasDoAluno.length;
    const presencasGeral = frequenciasDoAluno.filter(f => f.presente).length;
    const frequenciaGeralVerdadeira = totalAulasGeral > 0 ? Math.round((presencasGeral / totalAulasGeral) * 100) : 100;

    const mapaDisciplinas = new Map();

    notasDoAluno.forEach(nota => {
      // Cálculo do Bimestre específico (Dividido pelas 3 avaliações)
      const n1 = parseFloat(nota.n1?.replace(',', '.') || '0');
      const n2 = parseFloat(nota.n2?.replace(',', '.') || '0');
      const n3 = parseFloat(nota.n3?.replace(',', '.') || '0');
      const mediaDoBimestre = (n1 + n2 + n3) / 3;
      
      const nomeDisciplinaReal = nota.alocacao?.disciplina || (nota as any).disciplina || 'Disciplina Avulsa';
      const identificadorUnico = nota.alocacaoId || nomeDisciplinaReal;

      if (!mapaDisciplinas.has(identificadorUnico)) {
        mapaDisciplinas.set(identificadorUnico, {
          id: identificadorUnico,
          nome: nomeDisciplinaReal,
          alocacaoId: nota.alocacaoId,
          bimestres: {
            "1º Bimestre": null,
            "2º Bimestre": null,
            "3º Bimestre": null,
            "4º Bimestre": null,
          }
        });
      }

      const disciplina = mapaDisciplinas.get(identificadorUnico);
      const bimestreChave = (nota as any).bimestre || "1º Bimestre"; 
      
      if (disciplina.bimestres[bimestreChave] !== undefined) {
        disciplina.bimestres[bimestreChave] = { n1, n2, n3, media: mediaDoBimestre };
      }
    });
    
    // FECHA AS MÉDIAS ANUAIS E CONTA AS FALTAS
    const subjects = Array.from(mapaDisciplinas.values()).map(sub => {
      const chamadasDestaMateria = sub.alocacaoId ? frequenciasDoAluno.filter(f => f.alocacaoId === sub.alocacaoId) : [];
      const totalAulasDadas = chamadasDestaMateria.length > 0 ? chamadasDestaMateria.length : 40; 
      
      // Conta e extrai as datas exatas em que o aluno faltou
      const faltasExatas = chamadasDestaMateria
        .filter(f => f.presente === false)
        .map(f => f.data); 
        
      const totalDeFaltas = faltasExatas.length; 

      let somaAnual = 0;
      for (let i = 1; i <= 4; i++) {
        const b = sub.bimestres[`${i}º Bimestre`];
        if (b) somaAnual += b.media;
      }
      
      const mediaAnualFinal = somaAnual / 4; 

      return {
        id: sub.id,
        nome: sub.nome,
        aulasDadas: totalAulasDadas, 
        faltas: totalDeFaltas,
        faltasDatas: faltasExatas, 
        bimestres: sub.bimestres,
        mediaAnual: mediaAnualFinal 
      };
    });

    return res.json({
      stats: {
        turma: `${alunoLogado.anoTurma} ${alunoLogado.serieTurma}`,
        totalAlunos: colegas.length,
        posicaoRanking: posicaoRanking,
        mediaGeral: mediaDoAluno,
        frequenciaGeral: frequenciaGeralVerdadeira,
        top3: top3Dinâmico
      },
      subjects: subjects 
    });
  } catch (error) {
    console.error("Erro ao gerar métricas:", error);
    return res.status(500).json({ error: "Erro ao carregar o painel do aluno." });
  }
});

// ROTAS DE REQUISIÇÕES (ALUNOS E SECRETARIA)
// 1. Criar uma nova requisição (Aluno)
routes.post('/requisicoes', authMiddleware, upload.single('anexo'), async (req: AuthRequest, res) => {
  try {
    const { tipo, descricao } = req.body;
    const arquivoAnexo = req.file ? req.file.filename : null;

    // Acha a ficha de aluno atrelada ao usuário logado
    const aluno = await prisma.aluno.findUnique({ where: { userId: req.userId }, include: { user: true } });
    if (!aluno) return res.status(403).json({ error: "Apenas alunos podem fazer requisições." });

    // Gera um protocolo único
    const protocolo = `REQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const novaReq = await prisma.requisicao.create({
      data: { protocolo, tipo, descricao, arquivoAnexo, alunoId: aluno.id }
    });

    const secretaria = await prisma.user.findMany({ where: { cargo: { in: ['secretary'] } } });
    if (secretaria.length > 0) {
      const notificacoes = secretaria.map(usuario => ({
        userId: usuario.id,
        titulo: "Nova Requisição Recebida",
        mensagem: `Aluno(a) ${aluno.user.nome} abriu o protocolo ${protocolo} (${tipo})".`,
      }));
      await prisma.notificacao.createMany({ data: notificacoes });
    }

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
        include: { aluno: { include: { user: true } } },
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
    
    const arquivo = req.file ? req.file.filename : undefined;
    
    const dadosAtualizacao: any = {};
    if (status) dadosAtualizacao.status = status;
    if (respostaSecretaria) dadosAtualizacao.respostaSecretaria = respostaSecretaria;
    if (arquivo) dadosAtualizacao.arquivoSecretaria = arquivo;

    const atualizada = await prisma.requisicao.update({
      where: { id: realId },
      data: dadosAtualizacao,
      include: { aluno: { include: { user: true } } } // Traz o aluno para notificar
    });
    
    if (atualizada.aluno?.user?.id) {
      await prisma.notificacao.create({
        data: {
          userId: atualizada.aluno.user.id,
          titulo: "Atualização no seu Protocolo",
          mensagem: `A sua solicitação ${atualizada.protocolo} mudou para o status: ${atualizada.status}.`
        }
      });
    }
    
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

    // Verifica se alguma fatura pendente já venceu hoje
    const hoje = new Date().toISOString().split("T")[0];
    
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

// ROTA AUXILIAR (Para criar faturas de teste no banco)
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

    const despesasPrevistas = 318500;
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

    // Atualiza faturas atrasadas de todos os alunos antes de listar
    await prisma.fatura.updateMany({
      where: { status: 'Pendente', vencimento: { lt: hoje } },
      data: { status: 'Atrasado' }
    });

    // Puxa os alunos com a sua fatura mais recente
    const alunos = await prisma.aluno.findMany({ 
      include: { 
        user: true, 
        faturas: { orderBy: { vencimento: 'desc' }, take: 1 } 
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
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (user?.cargo !== 'admin') {
      return res.status(403).json({ error: "Apenas administradores podem gerar backups." });
    }

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
    // Num ambiente real, aqui o JSON enviado (req.file) seria lido e faria o processo inverso (prisma.createMany) limpando as tabelas primeiro.
    
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
      case 'rep-01': // Desempenho Acadêmico (Percorre todos os alunos, notas reais e agrupa por turma)
        const alunosMatriculados = await prisma.aluno.findMany({
          where: { status: 'Matriculado' },
          include: { notas: true }
        });

        let somaGlobal = 0;
        let alunosComNota = 0;
        let alunosAprovados = 0;
        const turmasMap = new Map();

        alunosMatriculados.forEach(aluno => {
          if (aluno.notas.length === 0) return; // Só conta alunos que já têm alguma nota

          let somaBimestres = 0;
          aluno.notas.forEach(nota => {
            const n1 = parseFloat(nota.n1?.replace(',', '.') || '0');
            const n2 = parseFloat(nota.n2?.replace(',', '.') || '0');
            const n3 = parseFloat(nota.n3?.replace(',', '.') || '0');
            somaBimestres += (n1 + n2 + n3) / 3;
          });

          // Média Final do Aluno (dividida pelo nº de matérias com notas lançadas)
          const mediaAluno = somaBimestres / aluno.notas.length;
          
          somaGlobal += mediaAluno;
          alunosComNota++;
          if (mediaAluno >= 6.0) alunosAprovados++;

          // Agrupa para Ranking de Turmas
          const turmaChave = `${aluno.anoTurma} ${aluno.serieTurma}`;
          if (!turmasMap.has(turmaChave)) turmasMap.set(turmaChave, { soma: 0, count: 0 });
          turmasMap.get(turmaChave).soma += mediaAluno;
          turmasMap.get(turmaChave).count += 1;
        });

        // Ordena as turmas da maior média para a menor
        const rankingTurmas = Array.from(turmasMap.entries()).map(([turma, data]) => ({
          turma, media: (data.soma / data.count).toFixed(2)
        })).sort((a, b) => parseFloat(b.media) - parseFloat(a.media));

        dados = {
          totalAvaliados: alunosComNota,
          mediaGlobal: alunosComNota > 0 ? (somaGlobal / alunosComNota).toFixed(2) : "0.00",
          taxaAprovacao: alunosComNota > 0 ? Math.round((alunosAprovados / alunosComNota) * 100) : 0,
          rankingTurmas
        };
        break;

      case 'rep-03': // Inadimplência (Percorre faturas reais e calcula dias de atraso exatos)
        const faturasAtrasadas = await prisma.fatura.findMany({
          where: { status: 'Atrasado' },
          include: { aluno: { include: { user: true } } },
          orderBy: { vencimento: 'asc' } // Da mais antiga para a mais recente
        });
        
        const totalAtrasado = faturasAtrasadas.reduce((acc, f) => acc + f.valor, 0);
        
        const faturasFormatadas = faturasAtrasadas.map(f => {
          const diffTime = Math.abs(new Date().getTime() - new Date(f.vencimento).getTime());
          const diasAtraso = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return {
            nome: f.aluno.user.nome,
            referencia: f.referencia,
            valor: f.valor,
            vencimento: f.vencimento,
            diasAtraso
          };
        });

        dados = { totalAtrasado, faturas: faturasFormatadas };
        break;

      case 'rep-04': // DRE Real (Soma as receitas e usa o salário dos funcionários como despesa)
        const todasFaturas = await prisma.fatura.findMany();
        let receitas = 0; let pendentes = 0; let perdidas = 0;

        todasFaturas.forEach(f => {
          if (f.status === 'Pago') receitas += f.valor;
          else if (f.status === 'Pendente') pendentes += f.valor;
          else if (f.status === 'Atrasado') perdidas += f.valor;
        });

        const funcionarios = await prisma.funcionario.findMany();
        const despesaSalarios = funcionarios.reduce((acc, func) => acc + (Number(func.salario) || 0), 0);
        const despesasReais = despesaSalarios > 0 ? despesaSalarios : 0;

        dados = { 
          receitas, 
          pendentes, 
          atrasadas: perdidas,
          despesasFixas: despesasReais,
          saldoCaixa: receitas - despesasReais
        };
        break;

      case 'rep-05': // Requisições (Traz os últimos chamados e totais reais)
        const reqs = await prisma.requisicao.findMany({
          include: { aluno: { include: { user: true } } },
          orderBy: { criadoEm: 'desc' }
        });
        
        const abertas = reqs.filter(r => r.status === 'Pendente' || r.status === 'Em Análise');
        const concluidas = reqs.filter(r => r.status === 'Concluído');
        const negadas = reqs.filter(r => r.status === 'Negado');

        dados = { 
          total: reqs.length, abertas: abertas.length, concluidas: concluidas.length, negadas: negadas.length,
          ultimas: reqs.slice(0, 15).map(r => ({ 
            protocolo: r.protocolo, tipo: r.tipo,
            aluno: r.aluno?.user?.nome || 'Desconhecido',
            status: r.status, data: r.criadoEm.toISOString().split("T")[0]
          }))
        };
        break;

      case 'rep-06': // Utilizadores e Cargos
        const users = await prisma.user.findMany({ orderBy: { nome: 'asc' } });
        const contagem = { admin: 0, secretary: 0, coordinator: 0, teacher: 0, student: 0 };
        users.forEach(u => { if (contagem[u.cargo as keyof typeof contagem] !== undefined) contagem[u.cargo as keyof typeof contagem]++; });
        
        dados = { users, contagem };
        break;
    }

    return res.json({ tipo, geradoEm: new Date().toISOString(), dados });
  } catch (error) {
    console.error(error);
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
    const notificationId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!notificationId) {
      return res.status(400).json({ error: "ID de notificação inválido." });
    }

    await prisma.notificacao.updateMany({
      where: { id: notificationId, userId: req.userId },
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