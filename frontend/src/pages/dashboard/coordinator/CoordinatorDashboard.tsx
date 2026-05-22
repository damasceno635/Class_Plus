// .\src\pages\dashboard\CoordinatorDashboard.tsx
import PageTemplate from "../../../components/layout/PageTemplate";
import { useAuth } from "../../../contexts/AuthContext";

export default function CoordinatorDashboard() {
  const { user } = useAuth();
  
  const cards = [
    { title: "Notas dos Alunos", description: "A média geral é 7.5. Precisa ser feita uma análise mais detalhada." },
    { title: "Trabalhos Pendentes", description: "Seminário de Português marcado para o dia 25/05." },
    { title: "Frequência", description: "Os alunos possuem 43% de presença nas aulas deste semestre." },
  ];

  return (
    <PageTemplate 
      title={`Olá, ${user?.nome}!`} 
      subtitle="Acompanhe o progresso das turmas e gerencie a agenda delas." 
      cards={cards} 
    />
  );
}