import PageTemplate from "../../../components/layout/PageTemplate";

export default function LessonAdmin() {
  return (
    <PageTemplate
      title="Roteiro de Aula"
      subtitle="Planejamento pedagógico"
      cards={[
        {
          title: "Planejamento",
          description: "Organização das aulas e conteúdos.",
        },
        {
          title: "Atividades",
          description: "Registro de tarefas e avaliações.",
        },
        {
          title: "Materiais",
          description: "Documentos de apoio e anexos.",
        },
      ]}
    />
  );
}