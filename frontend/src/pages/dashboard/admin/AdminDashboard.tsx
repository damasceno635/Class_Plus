// .\src\pages\dashboard\AdminDashboard.tsx
import PageTemplate from "../../../components/layout/PageTemplate";

export default function AdminDashboard() {
  const cards = [
    { title: "Usuários Ativos", description: "1.240 alunos e 85 funcionários registrados na plataforma." },
    { title: "Receita do Mês", description: "O faturamento atual está 12% acima da meta estabelecida." },
    { title: "Status do Sistema", description: "Todos os serviços e bancos de dados operando normalmente." },
  ];

  // Aqui no futuro pode adicionar componentes específicos do Admin, como gráficos de receita, etc.

  return (
    <PageTemplate 
      title="Visão Geral Administrativa" 
      subtitle="Controle total sobre a instituição." 
      cards={cards} 
    />
  );
}