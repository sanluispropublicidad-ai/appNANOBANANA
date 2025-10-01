import { HistoryEntry } from '../types';

interface GalleryProps {
  history: HistoryEntry[];
  onVariant: (entry: HistoryEntry) => void;
  onDownload: (image: string, index: number, prompt: string) => void;
}

const Gallery = ({ history, onVariant, onDownload }: GalleryProps) => {
  const allImages = history.flatMap((entry) =>
    entry.images.map((image, index) => ({
      entry,
      image,
      index,
    }))
  );

  if (allImages.length === 0) {
    return (
      <section className="w-full rounded-xl bg-white/5 p-6 text-center text-white/60">
        Las imágenes aparecerán aquí cuando las generes.
      </section>
    );
  }

  return (
    <section className="grid w-full gap-6 md:grid-cols-2 xl:grid-cols-3">
      {allImages.map(({ entry, image, index }) => (
        <article key={`${entry.id}-${index}`} className="flex flex-col gap-3 rounded-xl bg-white/5 p-4 shadow-md">
          <img
            src={`data:image/png;base64,${image}`}
            alt={`Resultado ${index + 1} para ${entry.prompt}`}
            className="h-64 w-full rounded-lg object-cover"
          />
          <div className="flex flex-col gap-2 text-sm text-white/70">
            <span className="font-semibold text-amber-200">{entry.prompt}</span>
            <span>{entry.text.slice(0, 140) || 'Sin descripción'}</span>
          </div>
          <div className="mt-auto flex gap-3">
            <button
              type="button"
              onClick={() => onDownload(image, index, entry.prompt)}
              className="flex-1 rounded-lg bg-amber-400 px-4 py-2 text-sm font-bold text-slate-900 transition hover:bg-amber-300"
            >
              Descargar PNG
            </button>
            <button
              type="button"
              onClick={() => onVariant(entry)}
              className="flex-1 rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-amber-200 transition hover:bg-white/20"
            >
              Variantes
            </button>
          </div>
        </article>
      ))}
    </section>
  );
};

export default Gallery;
