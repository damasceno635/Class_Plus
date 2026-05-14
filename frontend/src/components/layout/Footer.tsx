import { Database, Shield, HardDrive } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-5 mt-auto">
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-slate-800 dark:text-white text-lg">
            Class+
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Sistema de Gestão Escolar Inteligente
          </p>
        </div>

        <div className="flex gap-6 text-sm text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Database size={14} /> Backups automáticos
          </span>
          <span className="flex items-center gap-1">
            <Shield size={14} /> LGPD compliant
          </span>
          <span className="flex items-center gap-1">
            <HardDrive size={14} /> v2.4.1
          </span>
        </div>

        <div className="text-sm text-slate-500 dark:text-slate-400 text-center md:text-right">
          © 2026 Class+ — Todos os direitos reservados
          <br />
          Desenvolvido para gestão administrativa e pedagógica
        </div>
      </div>
    </footer>
  );
}