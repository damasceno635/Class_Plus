import PageTemplate from "../../components/layout/PageTemplate";

export default function Financeiro() {
  return (
    <PageTemplate
      title="Financeiro"
      subtitle="Gestão financeira escolar"
      cards={[
        {
          title: "Mensalidades",
          description: "Controle de pagamentos e inadimplência.",
        },
        {
          title: "Despesas",
          description: "Registro de gastos operacionais.",
        },
        {
          title: "Fluxo de Caixa",
          description: "Resumo financeiro geral.",
        },
      ]}
    />
  );
}