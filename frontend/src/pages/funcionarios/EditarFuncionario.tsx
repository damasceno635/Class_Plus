import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Save } from "lucide-react";

import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

interface FuncionarioFormData {
  nome: string;
  cpf: string;
  ra: string;
  nascimento: string;
  sexo: string;
  celular: string;
  email: string;

  cargo: string;
  status: string;
  contrato: string;
  periodo: string;

  salario: string;
  pagamento: string;
}

export default function EditarFuncionario() {
  const { register, handleSubmit, reset } =
    useForm<FuncionarioFormData>();

  useEffect(() => {
    const funcionarioMock = {
      nome: "Carlos Henrique",
      cpf: "123.456.789-00",
      ra: "RA20260012",
      nascimento: "1990-09-12",
      sexo: "Masculino",
      celular: "(99) 99999-8888",
      email: "carlos@classplus.com",

      cargo: "Professor",
      status: "Ativo",
      contrato: "Indeterminado",
      periodo: "Integral",

      salario: "4800",
      pagamento: "Pix",
    };

    reset(funcionarioMock);
  }, [reset]);

  function onSubmit(data: FuncionarioFormData) {
    console.log("Funcionário atualizado:", data);
  }

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
              Editar Funcionário
            </h1>

            <p className="text-slate-500 dark:text-slate-400">
              Atualização cadastral do colaborador
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="
              bg-white
              dark:bg-slate-900
              rounded-3xl
              p-6
              md:p-8
              border
              border-slate-200
              dark:border-slate-800
              shadow-sm
              space-y-8
            "
          >
            <Section title="Dados Pessoais">
              <Grid>
                <Input label="Nome" register={register("nome")} />
                <Input label="CPF" register={register("cpf")} />
                <Input label="RA" register={register("ra")} />
                <Input
                  type="date"
                  label="Nascimento"
                  register={register("nascimento")}
                />

                <Select
                  label="Sexo"
                  register={register("sexo")}
                  options={["Masculino", "Feminino"]}
                />

                <Input
                  label="Celular"
                  register={register("celular")}
                />

                <Input
                  label="Email"
                  register={register("email")}
                />
              </Grid>
            </Section>

            <Section title="Dados Profissionais">
              <Grid>
                <Select
                  label="Cargo"
                  register={register("cargo")}
                  options={[
                    "Professor",
                    "Coordenador",
                    "Secretário",
                  ]}
                />

                <Select
                  label="Status"
                  register={register("status")}
                  options={["Ativo", "Inativo"]}
                />

                <Select
                  label="Contrato"
                  register={register("contrato")}
                  options={[
                    "Indeterminado",
                    "Determinado",
                    "Temporário",
                    "Estágio",
                  ]}
                />

                <Select
                  label="Período"
                  register={register("periodo")}
                  options={[
                    "Meio Período",
                    "Integral",
                  ]}
                />
              </Grid>
            </Section>

            <Section title="Financeiro">
              <Grid>
                <Input
                  label="Salário"
                  register={register("salario")}
                />

                <Select
                  label="Forma de Pagamento"
                  register={register("pagamento")}
                  options={[
                    "Depósito",
                    "Espécie",
                    "Pix",
                    "Cheque",
                  ]}
                />
              </Grid>
            </Section>

            <button
              type="submit"
              className="
                flex
                items-center
                gap-2
                bg-blue-600
                hover:bg-blue-700
                text-white
                px-8
                py-4
                rounded-2xl
                font-semibold
                transition-all
              "
            >
              <Save size={18} />
              Salvar Alterações
            </button>
          </form>
        </main>

        <Footer />
      </div>
    </div>
  );
}

function Section({ title, children }: any) {
  return (
    <section>
      <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Grid({ children }: any) {
  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
      {children}
    </div>
  );
}

function Input({
  label,
  register,
  type = "text",
}: any) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-medium text-slate-700 dark:text-white">
        {label}
      </label>

      <input
        type={type}
        {...register}
        className="
          w-full
          p-4
          rounded-2xl
          border
          border-slate-300
          dark:border-slate-700
          bg-white
          dark:bg-slate-800
          dark:text-white
          outline-none
          focus:ring-2
          focus:ring-blue-500
        "
      />
    </div>
  );
}

function Select({
  label,
  register,
  options,
}: any) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-medium text-slate-700 dark:text-white">
        {label}
      </label>

      <select
        {...register}
        className="
          w-full
          p-4
          rounded-2xl
          border
          border-slate-300
          dark:border-slate-700
          bg-white
          dark:bg-slate-800
          dark:text-white
          outline-none
          focus:ring-2
          focus:ring-blue-500
        "
      >
        {options.map((option: string) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}