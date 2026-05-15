import PageTemplate from "../../components/layout/PageTemplate";

export default function Desempenho() {
  return (
    <PageTemplate
      title="Desempenho Acadêmico"
      subtitle="Acompanhamento do rendimento escolar"
      cards={[
        {
          title: "Notas por Turma",
          description: "Visualização de desempenho geral por turma.",
        },
        {
          title: "Frequência",
          description: "Controle de faltas e presença dos alunos.",
        },
        {
          title: "Indicadores",
          description: "Gráficos de evolução acadêmica.",
        },
      ]}
    />
  );
}