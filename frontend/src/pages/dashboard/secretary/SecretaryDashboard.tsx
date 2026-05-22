// .\src\pages\dashboard\SecretaryDashboard.tsx
import PageTemplate from "../../../components/layout/PageTemplate";
import { useAuth } from "../../../contexts/AuthContext";

export default function SecretaryDashboard() {
  const { user } = useAuth();
  
  const cards = [
    { title: "Notas dos Alunos", description: "A média geral é 7.5. Precisa ser feita uma análise mais detalhada." },
    { title: "Financeiro", description: "Pagar o salário dos professores dia 20/05/2026." },
    { title: "Agenda", description: "Reunião com a coordenação para discutir o plano de aula." },
  ];

  return (
    <PageTemplate 
      title={`Olá, ${user?.nome}!`} 
      subtitle="Acompanhe o progresso das turmas e funcionários e gerencie a agenda deles." 
      cards={cards} 
    />
  );
}