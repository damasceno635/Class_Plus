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

/* ===================================================== */
/* TYPES */
/* ===================================================== */

interface Disciplina {
  disciplina: string;
  cargaHoraria: string;
  turma: string;
  periodo: string;
}

interface Formacao {
  instituicao: string;
  cnpj: string;
  periodo: string;
  modalidade: string;
}

interface Experiencia {
  empresa: string;
  cnpj: string;
  periodo: string;
  modalidade: string;
}

interface Referencia {
  nome: string;
  cnpj: string;
  celular: string;
  email: string;
}

interface FuncionarioFormData {
  status: string;

  vaga: string;

  contrato: string;
  periodoContrato: string;
  dataFimContrato: string;

  nome: string;
  cpf: string;
  ra: string;
  nascimento: string;
  sexo: string;
  celular: string;
  email: string;

  cep: string;
  cidade: string;
  estado: string;
  rua: string;
  bloco: string;
  quadra: string;
  numero: string;

  disciplinas: Disciplina[];

  admissao: string;

  formacoes: Formacao[];

  experiencias: Experiencia[];

  referencias: Referencia[];

  salario: string;
  pagamento: string;
}

/* ===================================================== */
/* COMPONENT */
/* ===================================================== */

export default function NovoFuncionario() {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
  } = useForm<FuncionarioFormData>({
    defaultValues: {
      disciplinas: [],
      formacoes: [],
      experiencias: [],
      referencias: [],
    },
  });

  /* ===================================================== */
  /* FIELD ARRAYS */
  /* ===================================================== */

  const {
    fields: disciplinaFields,
    append: appendDisciplina,
    remove: removeDisciplina,
  } = useFieldArray({
    control,
    name: "disciplinas",
  });

  const {
    fields: formacaoFields,
    append: appendFormacao,
    remove: removeFormacao,
  } = useFieldArray({
    control,
    name: "formacoes",
  });

  const {
    fields: experienciaFields,
    append: appendExperiencia,
    remove: removeExperiencia,
  } = useFieldArray({
    control,
    name: "experiencias",
  });

  const {
    fields: referenciaFields,
    append: appendReferencia,
    remove: removeReferencia,
  } = useFieldArray({
    control,
    name: "referencias",
  });

  const contrato = watch("contrato");

  /* ===================================================== */
  /* CEP */
  /* ===================================================== */

  async function buscarCEP(cep: string) {
    const cepLimpo = cep.replace(/\D/g, "");

    if (cepLimpo.length !== 8) return;

    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${cepLimpo}/json/`
      );

      const data = await response.json();

      if (!data.erro) {
        setValue(
          "cidade",
          data.localidade || ""
        );

        setValue(
          "estado",
          data.uf || ""
        );

        setValue(
          "rua",
          data.logradouro || ""
        );
      }
    } catch (error) {
      console.error(
        "Erro ao buscar CEP:",
        error
      );
    }
  }

  /* ===================================================== */
  /* SUBMIT */
  /* ===================================================== */

  function onSubmit(data: FuncionarioFormData) {
    console.log(data);
  }

  /* ===================================================== */
  /* JSX */
  /* ===================================================== */

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />

      <div className="flex-1">
        <Header />

        <main
          className="
            p-4
            md:p-8
            max-w-[1600px]
            mx-auto
          "
        >
          {/* HEADER */}

          <div className="mb-8">
            <h1
              className="
                text-3xl
                font-bold
                text-slate-800
                dark:text-white
              "
            >
              Novo Funcionário
            </h1>

            <p
              className="
                text-slate-500
                dark:text-slate-300
              "
            >
              Cadastro completo de funcionário
            </p>
          </div>

          {/* FORM */}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-8"
          >
            {/* FOTO */}

            <Section title="Foto">
              <FileInput label="Foto do Funcionário" />
            </Section>

            {/* DADOS */}

            <Section title="Informações Básicas">
              <Grid>
                <Select
                  label="Status"
                  register={register("status")}
                  options={[
                    "Ativo",
                    "Inativo",
                  ]}
                />

                <Select
                  label="Vaga"
                  register={register("vaga")}
                  options={[
                    "Professor(a)",
                    "Coordenador(a)",
                    "Secretário(a)",
                  ]}
                />

                <Select
                  label="Contrato"
                  register={register("contrato")}
                  options={[
                    "Indeterminado",
                    "Determinado",
                    "Experiência",
                    "Temporário",
                    "Intermitente",
                    "Estágio",
                  ]}
                />

                <Select
                  label="Período"
                  register={register(
                    "periodoContrato"
                  )}
                  options={[
                    "Meio Período",
                    "Integral",
                  ]}
                />

                {contrato !==
                  "Indeterminado" && (
                  <Input
                    type="date"
                    label="Data Final Contrato"
                    register={register(
                      "dataFimContrato"
                    )}
                  />
                )}

                <Input
                  label="Nome"
                  register={register("nome")}
                />

                <Input
                  label="CPF"
                  register={register("cpf")}
                />

                <Input
                  label="RA"
                  register={register("ra")}
                />

                <Input
                  type="date"
                  label="Nascimento"
                  register={register(
                    "nascimento"
                  )}
                />

                <Select
                  label="Sexo"
                  register={register("sexo")}
                  options={[
                    "Masculino",
                    "Feminino",
                  ]}
                />

                <Input
                  label="Celular"
                  register={register(
                    "celular"
                  )}
                />

                <Input
                  label="Email"
                  register={register("email")}
                />
              </Grid>
            </Section>

            {/* ENDEREÇO */}

            <Section title="Endereço">
              <Grid>
                <Input
                  label="CEP"
                  register={register("cep")}
                  onBlur={(
                    e: FocusEvent<HTMLInputElement>
                  ) =>
                    buscarCEP(e.target.value)
                  }
                />

                <Input
                  label="Cidade"
                  register={register(
                    "cidade"
                  )}
                />

                <Input
                  label="Estado"
                  register={register(
                    "estado"
                  )}
                />

                <Input
                  label="Rua"
                  register={register("rua")}
                />

                <Input
                  label="Bloco"
                  register={register(
                    "bloco"
                  )}
                />

                <Input
                  label="Quadra"
                  register={register(
                    "quadra"
                  )}
                />

                <Input
                  label="Número"
                  register={register(
                    "numero"
                  )}
                />
              </Grid>
            </Section>

            {/* DISCIPLINAS */}

            <Section title="Disciplinas">
              <button
                type="button"
                onClick={() =>
                  appendDisciplina({
                    disciplina: "",
                    cargaHoraria: "",
                    turma: "",
                    periodo: "",
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
                "
              >
                <Plus size={18} />

                Adicionar Disciplina
              </button>

              <div className="space-y-5">
                {disciplinaFields.map(
                  (field, index) => (
                    <CardItem
                      key={field.id}
                      onRemove={() =>
                        removeDisciplina(index)
                      }
                    >
                      <Grid>
                        <Input
                          label="Disciplina"
                          register={register(
                            `disciplinas.${index}.disciplina`
                          )}
                        />

                        <Input
                          label="Carga Horária"
                          register={register(
                            `disciplinas.${index}.cargaHoraria`
                          )}
                        />

                        <Input
                          label="Turma"
                          register={register(
                            `disciplinas.${index}.turma`
                          )}
                        />

                        <Select
                          label="Período"
                          register={register(
                            `disciplinas.${index}.periodo`
                          )}
                          options={[
                            "Matutino",
                            "Vespertino",
                            "Noturno",
                          ]}
                        />
                      </Grid>
                    </CardItem>
                  )
                )}
              </div>
            </Section>

            {/* FORMAÇÕES */}

            <Section title="Formações">
              <button
                type="button"
                onClick={() =>
                  appendFormacao({
                    instituicao: "",
                    cnpj: "",
                    periodo: "",
                    modalidade: "",
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
                "
              >
                <Plus size={18} />

                Adicionar Formação
              </button>

              <div className="space-y-5">
                {formacaoFields.map(
                  (field, index) => (
                    <CardItem
                      key={field.id}
                      onRemove={() =>
                        removeFormacao(index)
                      }
                    >
                      <Grid>
                        <Input
                          label="Instituição"
                          register={register(
                            `formacoes.${index}.instituicao`
                          )}
                        />

                        <Input
                          label="CNPJ"
                          register={register(
                            `formacoes.${index}.cnpj`
                          )}
                        />

                        <Input
                          label="Período"
                          register={register(
                            `formacoes.${index}.periodo`
                          )}
                        />

                        <Select
                          label="Modalidade"
                          register={register(
                            `formacoes.${index}.modalidade`
                          )}
                          options={[
                            "Presencial",
                            "Remoto",
                            "Híbrido",
                          ]}
                        />
                      </Grid>
                    </CardItem>
                  )
                )}
              </div>
            </Section>

            {/* EXPERIÊNCIAS */}

            <Section title="Experiências">
              <button
                type="button"
                onClick={() =>
                  appendExperiencia({
                    empresa: "",
                    cnpj: "",
                    periodo: "",
                    modalidade: "",
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
                "
              >
                <Plus size={18} />

                Adicionar Experiência
              </button>

              <div className="space-y-5">
                {experienciaFields.map(
                  (field, index) => (
                    <CardItem
                      key={field.id}
                      onRemove={() =>
                        removeExperiencia(
                          index
                        )
                      }
                    >
                      <Grid>
                        <Input
                          label="Empresa"
                          register={register(
                            `experiencias.${index}.empresa`
                          )}
                        />

                        <Input
                          label="CNPJ"
                          register={register(
                            `experiencias.${index}.cnpj`
                          )}
                        />

                        <Input
                          label="Período"
                          register={register(
                            `experiencias.${index}.periodo`
                          )}
                        />

                        <Select
                          label="Modalidade"
                          register={register(
                            `experiencias.${index}.modalidade`
                          )}
                          options={[
                            "Presencial",
                            "Remoto",
                            "Híbrido",
                          ]}
                        />
                      </Grid>
                    </CardItem>
                  )
                )}
              </div>
            </Section>

            {/* REFERÊNCIAS */}

            <Section title="Referências">
              <button
                type="button"
                onClick={() =>
                  appendReferencia({
                    nome: "",
                    cnpj: "",
                    celular: "",
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
                "
              >
                <Plus size={18} />

                Adicionar Referência
              </button>

              <div className="space-y-5">
                {referenciaFields.map(
                  (field, index) => (
                    <CardItem
                      key={field.id}
                      onRemove={() =>
                        removeReferencia(
                          index
                        )
                      }
                    >
                      <Grid>
                        <Input
                          label="Nome"
                          register={register(
                            `referencias.${index}.nome`
                          )}
                        />

                        <Input
                          label="CNPJ"
                          register={register(
                            `referencias.${index}.cnpj`
                          )}
                        />

                        <Input
                          label="Celular"
                          register={register(
                            `referencias.${index}.celular`
                          )}
                        />

                        <Input
                          label="Email"
                          register={register(
                            `referencias.${index}.email`
                          )}
                        />
                      </Grid>
                    </CardItem>
                  )
                )}
              </div>
            </Section>

            {/* FINANCEIRO */}

            <Section title="Financeiro">
              <Grid>
                <Input
                  label="Salário"
                  register={register(
                    "salario"
                  )}
                />

                <Select
                  label="Pagamento"
                  register={register(
                    "pagamento"
                  )}
                  options={[
                    "Depósito",
                    "Espécie",
                    "PIX",
                    "Cheque",
                  ]}
                />
              </Grid>
            </Section>

            {/* DOCUMENTOS */}

            <Section title="Documentos">
                <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FileInput label="RG" />
                    <FileInput label="Comprovante Residência" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FileInput label="Diploma" />
                    <FileInput label="Referências" />
                    </div>
                </div>
            </Section>

            {/* BUTTON */}

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
              Salvar Funcionário
            </button>
          </form>
        </main>
        <Footer />
      </div>
    </div>
  );
}

/* COMPONENTES */

interface SectionProps {
  title: string;
  children: ReactNode;
}

function Section({
  title,
  children,
}: SectionProps) {
  return (
    <section
      className="
        bg-white
        dark:bg-slate-900
        p-6
        rounded-3xl
        shadow-sm
        border
        border-slate-200
        dark:border-slate-800
      "
    >
      <h2
        className="
          text-2xl
          font-bold
          mb-6
          text-slate-800
          dark:text-white
        "
      >
        {title}
      </h2>

      {children}
    </section>
  );
}

interface GridProps {
  children: ReactNode;
}

function Grid({
  children,
}: GridProps) {
  return (
    <div
      className="
        grid
        grid-cols-1
        md:grid-cols-2
        xl:grid-cols-3
        gap-5
      "
    >
      {children}
    </div>
  );
}

interface CardItemProps {
  children: ReactNode;
  onRemove: () => void;
}

function CardItem({
  children,
  onRemove,
}: CardItemProps) {
  return (
    <div
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
      <div className="flex justify-end mb-4">
        <button
          type="button"
          onClick={onRemove}
          className="
            text-red-600
            hover:scale-110
            transition-all
          "
        >
          <Trash2 size={20} />
        </button>
      </div>

      {children}
    </div>
  );
}

interface InputProps {
  label: string;
  register: UseFormRegisterReturn;
  type?: string;
  onBlur?: (
    e: FocusEvent<HTMLInputElement>
  ) => void;
}

function Input({
  label,
  register,
  type = "text",
  onBlur,
}: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      <label
        className="
          font-medium
          text-slate-700
          dark:text-white
        "
      >
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
          dark:border-slate-700
          bg-white
          dark:bg-slate-800
          dark:text-white
          outline-none
          focus:ring-2
          focus:ring-blue-500
          transition-all
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

function Select({
  label,
  register,
  options,
}: SelectProps) {
  return (
    <div className="flex flex-col gap-2">
      <label
        className="
          font-medium
          text-slate-700
          dark:text-white
        "
      >
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
          dark:border-slate-700
          bg-white
          dark:bg-slate-800
          dark:text-white
          outline-none
          focus:ring-2
          focus:ring-blue-500
          transition-all
        "
      >
        <option value="">
          Selecione
        </option>

        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
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

function FileInput({
  label,
}: FileInputProps) {
  return (
    <div className="flex flex-col gap-2">
      <label
        className="
          font-medium
          text-slate-700
          dark:text-white
        "
      >
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