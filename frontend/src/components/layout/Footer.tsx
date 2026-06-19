import {
  GraduationCap,
  ShieldCheck,
  DatabaseBackup,
  Activity,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 mt-auto">
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              <h2 className="font-bold text-lg text-slate-800 dark:text-white">
                Class+
              </h2>
            </div>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Plataforma Inteligente de Gestão Escolar
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-2">
              <DatabaseBackup size={16} />
              Backup Automático
            </span>

            <span className="flex items-center gap-2">
              <ShieldCheck size={16} />
              Segurança e LGPD
            </span>

            <span className="flex items-center gap-2">
              <Activity size={16} />
              Sistema Operacional
            </span>
          </div>

          <div className="text-center lg:text-right text-sm text-slate-500 dark:text-slate-400">
            <p>© 2026 Class+. Todos os direitos reservados.</p>
            <p className="mt-1">
              Desenvolvido para gestão administrativa, pedagógica e acadêmica.
            </p>
            <p className="mt-1 font-medium">
              Versão 1.0.0
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}