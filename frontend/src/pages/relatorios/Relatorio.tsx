import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

export default function Backup() {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="p-4 md:p-8 max-w-[1600px] mx-auto w-full flex-1">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Relatórios
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Gerenciamento de relatórios do sistema
            </p>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}