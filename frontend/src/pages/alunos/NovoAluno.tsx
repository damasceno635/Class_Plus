import {
  useFieldArray,
  useForm,
  type UseFormRegisterReturn,
} from "react-hook-form";

import type {
  ReactNode,
  FocusEvent,
} from "react";

import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

import {
  Plus,
  Trash2,
} from "lucide-react";

interface Responsavel {
  parentesco: string;
  nome: string;
  cpf: string;
  contato: string;
  email: string;
}

interface Deficiencia {
  nome: string;
  apoio: string;
}

interface Alergia {
  nome: string;
}

interface AlunoFormData {
  status: string;

  nome: string;
  cpf: string;
  nascimento: string;
  sexo: string;
  nivelEnsino: string;
  anoTurma: string;
  serieTurma: string;
  anoLetivo: string;

  cep: string;
  cidade: string;
  estado: string;
  rua: string;
  bloco: string;
  quadra: string;
  numero: string;

  responsaveis: Responsavel[];

  possuiDeficiencia: boolean;
  deficiencias: Deficiencia[];

  possuiAlergia: boolean;
  alergias: Alergia[];
}

export default function NovoAluno() {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
  } = useForm<AlunoFormData>({
    defaultValues: {
      responsaveis: [],
      deficiencias: [],
      alergias: [],
    },
  });

  const {
    fields: responsavelFields,
    append: appendResponsavel,
    remove: removeResponsavel,
  } = useFieldArray({
    control,
    name: "responsaveis",
  });

  const {
    fields: deficienciaFields,
    append: appendDeficiencia,
    remove: removeDeficiencia,
  } = useFieldArray({
    control,
    name: "deficiencias",
  });

  const {
    fields: alergiaFields,
    append: appendAlergia,
    remove: removeAlergia,
  } = useFieldArray({
    control,
    name: "alergias",
  });

  const possuiDeficiencia = watch("possuiDeficiencia");
  const possuiAlergia = watch("possuiAlergia");

  async function buscarCEP(cep: string) {
    const cepLimpo = cep.replace(/\D/g, "");

    if (cepLimpo.length !== 8) return;

    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${cepLimpo}/json/`
      );

      const data = await response.json();

      if (!data.erro) {
        setValue("cidade", data.localidade || "");
        setValue("estado", data.uf || "");
        setValue("rua", data.logradouro || "");
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    }
  }

  function onSubmit(data: AlunoFormData) {
    console.log(data);
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />

      <div className="flex-1">
        <Header />

        <main className="p-4 md:p-8 max-w-[1600px] mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Novo Aluno
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Cadastro completo de aluno
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-8"
          >

            {/* FOTO */}
            <Section title="Foto do Aluno">
              <FileInput label="" />
            </Section>

            <Section title="Dados Básicos">
              <Grid>
                <Select
                  label="Status"
                  register={register("status")}
                  options={[
                    "Matriculado",
                    "Pré-Matriculado",
                    "Inativo",
                    "Transferido",
                    "Desistente",
                  ]}
                />

                <Input
                  label="Nome"
                  register={register("nome")}
                />

                <Input
                  label="CPF"
                  register={register("cpf")}
                />

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

                <Select
                  label="Nível de Ensino"
                  register={register("nivelEnsino")}
                  options={["Ensino Fundamental", "Ensino Médio"]}
                />

                <Select
                  label="Ano"
                  register={register("anoTurma")}
                  options={["1º Ano", "2º Ano", "3º Ano", "4º Ano", "5º Ano", "6º Ano", "7º Ano", "8º Ano", "9º Ano"]}
                />

                <Select
                  label="Série"
                  register={register("serieTurma")}
                  options={["A", "B", "C", "D"]}
                />

                <Select
                  label="Ano Letivo"
                  register={register("anoLetivo")}
                  options={["2026.1", "2026.2", "2027.1", "2027.2"]}
                />
              </Grid>
            </Section>

            <Section title="Endereço">
              <Grid>
                <Input
                  label="CEP"
                  register={register("cep")}
                  onBlur={(e: FocusEvent<HTMLInputElement>) =>
                    buscarCEP(e.target.value)
                  }
                />

                <Input
                  label="Cidade"
                  register={register("cidade")}
                />

                <Input
                  label="Estado"
                  register={register("estado")}
                />

                <Input
                  label="Rua"
                  register={register("rua")}
                />

                <Input
                  label="Bloco"
                  register={register("bloco")}
                />

                <Input
                  label="Quadra"
                  register={register("quadra")}
                />

                <Input
                  label="Número"
                  register={register("numero")}
                />
              </Grid>
            </Section>

            <Section title="Responsáveis">
              <button
                type="button"
                onClick={() =>
                  appendResponsavel({
                    parentesco: "",
                    nome: "",
                    cpf: "",
                    contato: "",
                    email: "",
                  })
                }
                className="
                  flex
                  items-center
                  gap-2
                  bg-blue-600
                  hover:bg-blue-700
                  text-white
                  px-4
                  py-3
                  rounded-xl
                  transition-all
                  mb-5
                  font-medium
                "
              >
                <Plus size={18} />
                Adicionar Responsável
              </button>

              <div className="space-y-6">
                {responsavelFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="
                      border
                      border-slate-200
                      dark:border-slate-700
                      rounded-2xl
                      p-5
                      bg-slate-50
                      dark:bg-slate-800
                    "
                  >
                    <div className="flex justify-between mb-4">
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        Responsável {index + 1}
                      </h3>

                      <button
                        type="button"
                        onClick={() => removeResponsavel(index)}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                    <Grid>
                      <Input
                        label="Parentesco"
                        register={register(
                          `responsaveis.${index}.parentesco`
                        )}
                      />

                      <Input
                        label="Nome"
                        register={register(
                          `responsaveis.${index}.nome`
                        )}
                      />

                      <Input
                        label="CPF"
                        register={register(
                          `responsaveis.${index}.cpf`
                        )}
                      />

                      <Input
                        label="Contato"
                        register={register(
                          `responsaveis.${index}.contato`
                        )}
                      />

                      <Input
                        label="Email"
                        register={register(
                          `responsaveis.${index}.email`
                        )}
                      />
                    </Grid>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Deficiências">
              <label className="flex gap-3 items-center cursor-pointer text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  {...register("possuiDeficiencia")}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
                />
                Possui deficiência?
              </label>

              {possuiDeficiencia && (
                <div className="mt-5">
                  <button
                    type="button"
                    onClick={() =>
                      appendDeficiencia({
                        nome: "",
                        apoio: "",
                      })
                    }
                    className="
                      bg-blue-600
                      hover:bg-blue-700
                      text-white
                      px-4
                      py-2
                      rounded-xl
                      mb-5
                      transition-all
                      font-medium
                    "
                  >
                    <Plus size={18} className="inline mr-2" />
                    Adicionar Deficiência
                  </button>

                  <div className="space-y-5">
                    {deficienciaFields.map((field, index) => (
                      <div
                        key={field.id}
                        className="
                          bg-slate-50
                          dark:bg-slate-800
                          p-5
                          rounded-2xl
                          border
                          border-slate-200
                          dark:border-slate-700
                        "
                      >
                        <div className="flex justify-between mb-4">
                          <h3 className="font-semibold text-slate-900 dark:text-white">
                            Deficiência {index + 1}
                          </h3>

                          <button
                            type="button"
                            onClick={() => removeDeficiencia(index)}
                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>

                        <Grid>
                          <Input
                            label="Deficiência"
                            register={register(
                              `deficiencias.${index}.nome`
                            )}
                          />

                          <Select
                            label="Precisa de Apoio?"
                            register={register(
                              `deficiencias.${index}.apoio`
                            )}
                            options={["Sim", "Não"]}
                          />
                        </Grid>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Section>

            <Section title="Alergias">
              <label className="flex gap-3 items-center cursor-pointer text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  {...register("possuiAlergia")}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
                />
                Possui alergia?
              </label>

              {possuiAlergia && (
                <div className="mt-5">
                  <button
                    type="button"
                    onClick={() =>
                      appendAlergia({
                        nome: "",
                      })
                    }
                    className="
                      bg-blue-600
                      hover:bg-blue-700
                      text-white
                      px-4
                      py-2
                      rounded-xl
                      mb-5
                      transition-all
                      font-medium
                    "
                  >
                    <Plus size={18} className="inline mr-2" />
                    Adicionar Alergia
                  </button>

                  <div className="space-y-5">
                    {alergiaFields.map((field, index) => (
                      <div
                        key={field.id}
                        className="
                          bg-slate-50
                          dark:bg-slate-800
                          p-5
                          rounded-2xl
                          border
                          border-slate-200
                          dark:border-slate-700
                        "
                      >
                        <div className="flex justify-between mb-4">
                          <h3 className="font-semibold text-slate-900 dark:text-white">
                            Alergia {index + 1}
                          </h3>

                          <button
                            type="button"
                            onClick={() => removeAlergia(index)}
                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>

                        <Input
                          label="Alergia"
                          register={register(
                            `alergias.${index}.nome`
                          )}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Section>

            <Section title="Documentos">
                <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FileInput label="RG do Aluno" />
                    <FileInput label="RG Responsáveis" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FileInput label="Comprovante Residência" />
                    <FileInput label="Histórico Escolar" />
                    </div>
                </div>
            </Section>

            <button
              type="submit"
              className="
                w-full
                md:w-auto
                bg-blue-600
                hover:bg-blue-700
                text-white
                px-8
                py-4
                rounded-2xl
                transition-all
                cursor-pointer
                font-semibold
                shadow-lg
                hover:shadow-xl
              "
            >
              Salvar Aluno
            </button>
          </form>
        </main>
        <Footer />
      </div>
    </div>
  );
}

/* ===================================================== */
/* COMPONENTES AUXILIARES */
/* ===================================================== */

interface SectionProps {
  title: string;
  children: ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <section className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow border border-slate-200 dark:border-slate-800">
      <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
        {title}
      </h2>
      {children}
    </section>
  );
}

interface GridProps {
  children: ReactNode;
}

function Grid({ children }: GridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {children}
    </div>
  );
}

interface InputProps {
  label: string;
  register: UseFormRegisterReturn;
  type?: string;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
}

function Input({ label, register, type = "text", onBlur }: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>

      <input
        type={type}
        {...register}
        onBlur={onBlur}
        className="
          w-full
          p-3
          rounded-xl
          border
          border-slate-300
          dark:border-slate-600
          bg-white
          dark:bg-slate-800
          text-slate-900
          dark:text-white
          outline-none
          focus:ring-2
          focus:ring-blue-500
          focus:border-blue-500
          transition-all
          placeholder:text-slate-400
          dark:placeholder:text-slate-500
        "
      />
    </div>
  );
}

interface SelectProps {
  label: string;
  register: UseFormRegisterReturn;
  options: string[];
}

function Select({ label, register, options }: SelectProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>

      <select
        {...register}
        className="
          w-full
          p-3
          rounded-xl
          border
          border-slate-300
          dark:border-slate-600
          bg-white
          dark:bg-slate-800
          text-slate-900
          dark:text-white
          outline-none
          focus:ring-2
          focus:ring-blue-500
          focus:border-blue-500
          transition-all
        "
      >
        <option value="">Selecione</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

interface FileInputProps {
  label: string;
}

function FileInput({ label }: FileInputProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>

      <input
        type="file"
        className="
          w-full
          p-2
          border
          border-slate-300
          dark:border-slate-600
          rounded-xl
          text-slate-700
          dark:text-slate-300
          file:mr-4
          file:py-2
          file:px-4
          file:rounded-xl
          file:border-0
          file:bg-blue-600
          file:text-white
          hover:file:bg-blue-700
          file:transition-all
          file:cursor-pointer
        "
      />
    </div>
  );
}