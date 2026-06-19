# 🎓 Class Plus - Sistema de Gestão Académica Integrado

![Status](https://img.shields.io/badge/Status-Em_Desenvolvimento-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![React](https://img.shields.io/badge/Frontend-React-61dafb?logo=react)
![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=node.js)
![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748?logo=prisma)

O **Class Plus** é um ERP educacional moderno projetado para centralizar e automatizar a gestão de instituições de ensino. O sistema unifica o ecossistema escolar - Administração, Secretaria, Coordenação, Professores e Alunos - numa única plataforma orientada a dados, com forte ênfase na experiência do utilizador (UX) e segurança. Como um produto em constante evolução, o Class Plus possui um roadmap focado na expansão contínua de recursos para atender às necessidades dinâmicas do ambiente educacional.

---

## 📄 Visão Geral
O Class Plus resolve a fragmentação da informação escolar. Através de Dashboards personalizados e geração de relatórios dinâmicos, a plataforma permite acompanhar a saúde financeira, o desempenho académico e a eficiência operacional da escola em tempo real.

---

## 🏗️ Arquitetura e Padrões de Projeto
O sistema foi desenvolvido visando alta coesão, baixo acoplamento e escalabilidade:

* **Padrões de Design:** Princípios estruturais (como GRASP e SOLID) guiam a separação de responsabilidades no backend.
* **Isolamento em Camadas:** Clara distinção entre as camadas de Roteamento, Regras de Negócio, Middlewares (Auth/Uploads) e Acesso a Dados (Prisma ORM).
* **RBAC (Role-Based Access Control):** Controle rigoroso de permissões. As rotas e interfaces adaptam-se dinamicamente conforme o nível hierárquico do utilizador (`admin`, `coordinator`, `secretary`, `teacher`, `student`).

---

## 📚 Módulos e Funcionalidades

### 📒 Gestão Académica
* **Diário de Classe Blindado:** Lançamento de avaliações e frequências com isolamento de transações por disciplina e bimestre.
* **Fluxo de Planeamento Pedagógico:** Professores redigem roteiros de aula; coordenadores analisam, aprovam ou solicitam revisões.
* **Geração de Boletins (PDF):** Compilação assíncrona de notas e consolidação de médias anuais e faltas, geradas visualmente no lado do cliente.

### 💰 Inteligência Financeira
* **Automação de Faturação:** Utilização de Cron Jobs para geração em lote de mensalidades no primeiro dia de cada mês.
* **Gestão de Inadimplência:** Varredura automática de vencimentos, alteração de status em tempo real e cálculo exato de dias de atraso.
* **DRE e Extratos:** Geração de 2ª via de boletos, recibos de pagamento (PIX/Balcão) e relatórios de fluxo de caixa cruzando receitas e despesas salariais.

### ⚙️ Centro Operacional
* **Log de Protocolos:** Sistema de *Ticketing* interno onde alunos abrem solicitações e a secretaria gere o atendimento e anexa documentos oficiais.
* **Motor de Relatórios:** Extração de KPIs complexos do banco de dados para PDFs executivos.

---

## 🛠️ Stack Tecnológico

**Frontend:**
* React (Vite)
* Tailwind CSS (Estilização semântica e suporte a Dark Mode nativo)
* Lucide React (Ícones)
* html2pdf.js (Renderização avançada de relatórios)

**Backend:**
* Node.js & Express
* Prisma ORM (Type-safe database access)
* PostgreSQL / SQLite
* JWT & Bcryptjs (Segurança e Criptografia)
* node-cron (Agendamento de tarefas)
* Multer (Gestão de Storage)

---

## 🚀 Futuras Melhorias
* **Conteinerização:** Estrutura altamente compatível para ser encapsulada com *Docker*.
* **Pipelines:** Estruturado para integrações com *GitHub Actions/GitLab CI* e processos de build automatizados.
* **Testes:** O isolamento das lógicas complexas facilita a implementação de Automação de Testes.

---

## 💻 Guia de Instalação

### Pré-requisitos
* Node.js (v16+)
* Git
* Banco de Dados (PostgreSQL recomendado para produção)
<br></br>

1. **Clonar o Repositório**
```bash
  git clone https://github.com/damasceno635/Class_Plus.git

  cd class-plus
```

2. **Incializar o Backend**
```bash
   cd backend
   npm install
   
   # Gerar o Prisma Client e aplicar migrações
   npx prisma generate
   npx prisma migrate dev --name init
   
   # Iniciar o servidor (Porta padrão: 3333)
   npm run dev
```

3. **Inicializar o Frontend**
```bash
   # Em um novo terminal
   cd frontend
   npm install
   
   # Iniciar a aplicação web (Porta padrão: 5173)
   npm run dev
```

## 🔑 Variáveis de Ambiente (.env)

#### Crie um ficheiro .env na raiz da pasta backend contendo:

```bash
  # Banco de Dados
  DATABASE_URL="file:./dev.db" # Ou sua string do PostgreSQL

  # Segurança
  JWT_SECRET="sua_chave_secreta_aqui"
```