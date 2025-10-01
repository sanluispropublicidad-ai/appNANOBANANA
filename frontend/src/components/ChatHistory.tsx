import { HistoryEntry } from '../types';

interface ChatHistoryProps {
  history: HistoryEntry[];
  onCopy: (text: string) => void;
}

const ChatHistory = ({ history, onCopy }: ChatHistoryProps) => {
  if (history.length === 0) {
    return (
      <section className="w-full rounded-xl bg-white/5 p-6 text-center text-white/60">
        Aún no hay resultados. Genera tu primera imagen para comenzar.
      </section>
    );
  }

  return (
    <section className="flex w-full flex-col gap-4">
      {history.map((entry) => (
        <article key={entry.id} className="rounded-xl bg-white/5 p-4 shadow-md">
          <header className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
            <h3 className="text-lg font-semibold text-amber-200">{entry.prompt}</h3>
            <span className="text-xs text-white/50">
              {new Date(entry.createdAt).toLocaleString()}
            </span>
          </header>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-white/90">{entry.text || 'Sin descripción generada.'}</p>
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-white/60">
            <span>Batch: {entry.params.batchSize}</span>
            <span>Aspect: {entry.params.aspectRatio}</span>
            {entry.params.seed ? <span>Seed: {entry.params.seed}</span> : <span>Seed: aleatorio</span>}
          </div>
          <button
            type="button"
            onClick={() => onCopy(entry.text)}
            className="mt-4 rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-amber-200 transition hover:bg-white/20"
          >
            Copiar texto generado
          </button>
        </article>
      ))}
    </section>
  );
};

export default ChatHistory;
