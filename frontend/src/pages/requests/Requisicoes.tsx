import PageTemplate from "../../components/layout/PageTemplate";

export default function Requisicoes() {
  return (
    <PageTemplate
      title="Requisições"
      subtitle="Solicitações internas"
      cards={[
        {
          title: "Documentos",
          description: "Pedidos de declaração e histórico.",
        },
        {
          title: "Agendamentos",
          description: "Solicitações de reuniões.",
        },
        {
          title: "Aprovações",
          description: "Fluxo de autorizações administrativas.",
        },
      ]}
    />
  );
}