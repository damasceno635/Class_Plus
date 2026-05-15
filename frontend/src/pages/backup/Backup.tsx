import PageTemplate from "../../components/layout/PageTemplate";

export default function Backup() {
  return (
    <PageTemplate
      title="Backup"
      subtitle="Segurança de dados"
      cards={[
        {
          title: "Backup Manual",
          description: "Gerar cópia imediata do sistema.",
        },
        {
          title: "Backup Automático",
          description: "Configurar backups periódicos.",
        },
        {
          title: "Restaurar",
          description: "Recuperar dados salvos.",
        },
      ]}
    />
  );
}