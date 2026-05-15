import PageTemplate from "../../components/layout/PageTemplate";

export default function CalendarioEscolar() {
  return (
    <PageTemplate
      title="Calendário Escolar"
      subtitle="Eventos e datas letivas"
      cards={[
        {
          title: "Eventos",
          description: "Datas comemorativas e reuniões.",
        },
        {
          title: "Provas",
          description: "Cronograma de avaliações.",
        },
        {
          title: "Feriados",
          description: "Controle de recessos escolares.",
        },
      ]}
    />
  );
}