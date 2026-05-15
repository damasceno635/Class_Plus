import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";

interface CardItem {
  title: string;
  description: string;
}

interface PageTemplateProps {
  title: string;
  subtitle: string;
  cards: CardItem[];
}

export default function PageTemplate({
  title,
  subtitle,
  cards,
}: PageTemplateProps) {
  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
              {title}
            </h1>

            <p className="text-slate-500 dark:text-slate-400 mt-2">
              {subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {cards.map((card) => (
              <div
                key={card.title}
                className="
                  bg-white
                  dark:bg-slate-900
                  rounded-3xl
                  p-6
                  shadow-sm
                  border
                  border-slate-200
                  dark:border-slate-800
                  hover:shadow-md
                  transition-all
                "
              >
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-3">
                  {card.title}
                </h2>

                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}