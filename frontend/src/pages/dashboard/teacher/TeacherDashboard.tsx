// .\src\pages\dashboard\TeacherDashboard.tsx
import PageTemplate from "../../../components/layout/PageTemplate";
import { useAuth } from "../../../contexts/AuthContext";

export default function TeacherDashboard() {
  const { user } = useAuth();
  
  const cards = [
    { title: "Notas dos Alunos", description: "A média geral é 8.5. Parabéns pelo excelente desempenho!" },
    { title: "Trabalhos Pendentes", description: "Seminário de História marcado para o dia 25/05." },
    { title: "Frequência", description: "Os alunos possuem 92% de presença nas aulas deste semestre." },
  ];

  return (
    <PageTemplate 
      title={`Olá, ${user?.nome}!`} 
      subtitle="Acompanhe o progresso dos alunos e gerencie sua agenda." 
      cards={cards} 
    />
  );
}