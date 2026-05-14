import { FileText } from "lucide-react";

import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

const funcionario = {
  nome: "Carlos Henrique",
  cargo: "Professor",
  status: "Ativo",
  cpf: "123.456.789-00",
  ra: "RA20260012",
  nascimento: "12/09/1990",
  sexo: "Masculino",
  celular: "(99) 99999-8888",
  email: "carlos@classplus.com",

  contrato: {
    tipo: "Indeterminado",
    periodo: "Integral",
    admissao: "10/01/2026",
  },

  endereco: {
    cep: "65600-000",
    cidade: "Caxias",
    estado: "MA",
    rua: "Rua Central",
    bloco: "A",
    quadra: "05",
    numero: "120",
  },

  disciplinas: [
    {
      nome: "Matemática",
      carga: "40h",
      turma: "2º Ano B",
      periodo: "Matutino",
    },
    {
      nome: "Física",
      carga: "20h",
      turma: "3º Ano A",
      periodo: "Vespertino",
    },
  ],

  formacoes: [
    {
      instituicao: "UFMA",
      curso: "Licenciatura em Matemática",
      periodo: "2010 - 2014",
      modalidade: "Presencial",
    },
  ],

  experiencias: [
    {
      empresa: "Colégio Alpha",
      periodo: "2018 - 2024",
      modalidade: "Presencial",
    },
  ],

  referencias: [
    {
      nome: "Escola São José",
      contato: "(99) 99999-4444",
      email: "contato@saojose.com",
    },
  ],

  salario: "R$ 4.800,00",
  pagamento: "Pix",

  documentos: [
    "RG",
    "Comprovante de residência",
    "Diploma",
    "Referências",
  ],
};

export default function VisualizarFuncionario() {
  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          <div className="flex flex-col xl:flex-row xl:justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                Ficha do Funcionário
              </h1>

              <p className="text-slate-500 dark:text-slate-400">
                Visualização completa do cadastro
              </p>
            </div>
          </div>

          <div className="grid xl:grid-cols-3 gap-6">
            {/* PERFIL */}
            <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div
                  className="
                    w-36
                    h-36
                    rounded-full
                    bg-slate-200
                    dark:bg-slate-700
                    flex
                    items-center
                    justify-center
                    mb-5
                  "
                >
                  <span className="text-slate-500 text-sm">
                    Sem foto
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                  {funcionario.nome}
                </h2>

                <p className="text-slate-500 mt-2">
                  {funcionario.cargo}
                </p>

                <span className="mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {funcionario.status}
                </span>
              </div>
            </section>

            {/* CONTEÚDO */}
            <section className="xl:col-span-2 space-y-6">
              <Card title="Dados Pessoais">
                <Info label="CPF" value={funcionario.cpf} />
                <Info label="RA" value={funcionario.ra} />
                <Info label="Nascimento" value={funcionario.nascimento} />
                <Info label="Sexo" value={funcionario.sexo} />
                <Info label="Celular" value={funcionario.celular} />
                <Info label="Email" value={funcionario.email} />
              </Card>

              <Card title="Contrato">
                <Info label="Tipo" value={funcionario.contrato.tipo} />
                <Info label="Período" value={funcionario.contrato.periodo} />
                <Info label="Admissão" value={funcionario.contrato.admissao} />
              </Card>

              <Card title="Endereço">
                <Info label="CEP" value={funcionario.endereco.cep} />
                <Info label="Cidade" value={funcionario.endereco.cidade} />
                <Info label="Estado" value={funcionario.endereco.estado} />
                <Info label="Rua" value={funcionario.endereco.rua} />
                <Info label="Bloco" value={funcionario.endereco.bloco} />
                <Info label="Quadra" value={funcionario.endereco.quadra} />
                <Info label="Número" value={funcionario.endereco.numero} />
              </Card>

              <Card title="Disciplinas">
                {funcionario.disciplinas.map((d, index) => (
                  <div key={index} className="border-b pb-4 mb-4 dark:border-slate-700">
                    <Info label="Disciplina" value={d.nome} />
                    <Info label="Carga Horária" value={d.carga} />
                    <Info label="Turma" value={d.turma} />
                    <Info label="Período" value={d.periodo} />
                  </div>
                ))}
              </Card>

              <Card title="Formação">
                {funcionario.formacoes.map((f, index) => (
                  <div key={index} className="border-b pb-4 mb-4 dark:border-slate-700">
                    <Info label="Instituição" value={f.instituicao} />
                    <Info label="Curso" value={f.curso} />
                    <Info label="Período" value={f.periodo} />
                    <Info label="Modalidade" value={f.modalidade} />
                  </div>
                ))}
              </Card>

              <Card title="Experiência">
                {funcionario.experiencias.map((e, index) => (
                  <div key={index} className="border-b pb-4 mb-4 dark:border-slate-700">
                    <Info label="Empresa" value={e.empresa} />
                    <Info label="Período" value={e.periodo} />
                    <Info label="Modalidade" value={e.modalidade} />
                  </div>
                ))}
              </Card>

              <Card title="Referências">
                {funcionario.referencias.map((r, index) => (
                  <div key={index} className="border-b pb-4 mb-4 dark:border-slate-700">
                    <Info label="Nome" value={r.nome} />
                    <Info label="Contato" value={r.contato} />
                    <Info label="Email" value={r.email} />
                  </div>
                ))}
              </Card>

              <Card title="Financeiro">
                <Info label="Salário" value={funcionario.salario} />
                <Info label="Pagamento" value={funcionario.pagamento} />
              </Card>

              <Card title="Documentos">
                <ul className="space-y-2">
                  {funcionario.documentos.map((doc) => (
                    <li
                      key={doc}
                      className="text-slate-600 dark:text-slate-300"
                    >
                      • {doc}
                    </li>
                  ))}
                </ul>
              </Card>
            </section>           
          </div>
            <button
              className="
                flex
                items-center
                gap-2
                bg-green-600
                hover:bg-green-700
                text-white
                px-6
                py-3
                rounded-2xl
                font-semibold
              "
            >
              <FileText size={18} />
              Gerar PDF
            </button>
        </main>

        <Footer />
      </div>
    </div>
  );
}

function Card({ title, children }: any) {
  return (
    <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
      <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-5">
        {title}
      </h2>

      <div className="grid md:grid-cols-2 gap-4">
        {children}
      </div>
    </section>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="font-medium text-slate-800 dark:text-white">
        {value}
      </p>
    </div>
  );
}