// .\src\pages\dashboard\StudentDashboard.tsx
import PageTemplate from "../../../components/layout/PageTemplate";
import { useAuth } from "../../../contexts/AuthContext";

export default function StudentDashboard() {
  const { user } = useAuth();
  
  const cards = [
    { title: "Minhas Notas", description: "Sua média geral é 8.5. Parabéns pelo excelente desempenho!" },
    { title: "Trabalhos Pendentes", description: "Seminário de História marcado para o dia 25/05." },
    { title: "Frequência", description: "Você possui 92% de presença nas aulas deste semestre." },
  ];

  return (
    <PageTemplate 
      title={`Olá, ${user?.nome}!`} 
      subtitle="Acompanhe seu progresso e agenda." 
      cards={cards} 
    />
  );
}