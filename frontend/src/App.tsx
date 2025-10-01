import { useCallback, useMemo, useState } from 'react';
import ChatInput from './components/ChatInput';
import ChatHistory from './components/ChatHistory';
import Controls from './components/Controls';
import Gallery from './components/Gallery';
import type { GenerationParams, HistoryEntry, UploadedImage } from './types';

const defaultParams: GenerationParams = {
  aspectRatio: '1:1',
  batchSize: 1,
  localeAware: false,
  safetyThreshold: 0.5,
  timeout: 60,
  seed: null,
};

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

function App() {
  const [prompt, setPrompt] = useState('');
  const [params, setParams] = useState<GenerationParams>(defaultParams);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const safeParams = useMemo(
    () => ({
      ...params,
      batchSize: Math.min(Math.max(Math.round(params.batchSize), 1), 4),
      safetyThreshold: Math.min(Math.max(params.safetyThreshold, 0), 1),
      timeout: Math.min(Math.max(Math.round(params.timeout), 10), 300),
      seed:
        params.seed === null || params.seed === undefined || Number.isNaN(params.seed)
          ? null
          : Number(params.seed),
    }),
    [params]
  );

  const buildRequestBody = useCallback(
    async (promptToUse: string, paramsToUse: GenerationParams, imageOverride?: UploadedImage | null) => {
      const body: Record<string, unknown> = {
        prompt: promptToUse,
        params: {
          ...paramsToUse,
          seed: paramsToUse.seed ?? undefined,
        },
      };

      const imageSource = imageOverride ?? uploadedImage;
      if (imageSource) {
        body.image = {
          data: imageSource.data,
          mimeType: imageSource.mimeType,
        };
      }

      return body;
    },
    [uploadedImage]
  );

  const handleResponse = useCallback(
    (promptUsed: string, paramsUsed: GenerationParams, response: any, imageUsed: UploadedImage | null) => {
      const images: string[] = Array.isArray(response.images)
        ? response.images.filter((value: unknown): value is string => typeof value === 'string')
        : [];

      if (!images.length && typeof response.image === 'string') {
        images.push(response.image);
      }

      const entry: HistoryEntry = {
        id: generateId(),
        prompt: promptUsed,
        text: typeof response.text === 'string' ? response.text : '',
        images,
        createdAt: new Date().toISOString(),
        params: paramsUsed,
        metadata: response.metadata,
        inputImage: imageUsed,
      };

      setHistory((prev) => [entry, ...prev]);
      setFeedback('Contenido generado correctamente ✅');
      setTimeout(() => setFeedback(null), 4000);
    },
    []
  );

  const generate = useCallback(
    async (override?: { prompt?: string; params?: GenerationParams; image?: UploadedImage | null }) => {
      const promptToUse = override?.prompt ?? prompt;
      const paramsToUse = override?.params ?? safeParams;
      const imageToUse = override?.image ?? uploadedImage;

      if (!promptToUse.trim()) {
        setError('Necesitas escribir un prompt antes de generar.');
        setFeedback(null);
        return;
      }

      setIsLoading(true);
      setError(null);
      setFeedback(null);

      try {
        const response = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(await buildRequestBody(promptToUse.trim(), paramsToUse, imageToUse)),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error ?? 'No se pudo generar la imagen.');
        }

        handleResponse(promptToUse, paramsToUse, data, imageToUse ?? null);
        setPrompt('');
      } catch (requestError) {
        const message =
          requestError instanceof Error
            ? requestError.message
            : 'Ocurrió un error inesperado durante la generación.';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [prompt, safeParams, uploadedImage, buildRequestBody, handleResponse]
  );

  const handleVariant = async (entry: HistoryEntry) => {
    const newSeed = Math.floor(Math.random() * 1_000_000);
    const paramsForVariant: GenerationParams = {
      ...entry.params,
      seed: newSeed,
    };

    await generate({ prompt: entry.prompt, params: paramsForVariant, image: entry.inputImage ?? null });
  };

  const handleDownload = (image: string, index: number, promptText: string) => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${image}`;
    const sanitizedPrompt = promptText.toLowerCase().replace(/[^a-z0-9]+/gi, '-').slice(0, 40) || 'nano-banana';
    link.download = `${sanitizedPrompt}-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = async (text: string) => {
    if (!text) {
      setError('No hay texto para copiar.');
      setFeedback(null);
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setFeedback('Texto copiado al portapapeles ✅');
      setError(null);
      setTimeout(() => setFeedback(null), 3000);
    } catch (copyError) {
      setError('No se pudo copiar el texto automáticamente.');
      setFeedback(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-black p-6 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-3 text-center">
          <h1 className="text-4xl font-black text-amber-300">Nano Banana</h1>
          <p className="text-white/70">
            Genera imágenes y descripciones usando Google Vertex AI. Ajusta los parámetros para conseguir el resultado perfecto.
          </p>
        </header>

        {error && (
          <div className="rounded-lg border border-rose-400 bg-rose-950/60 p-4 text-sm text-rose-100">{error}</div>
        )}

        {feedback && (
          <div className="rounded-lg border border-emerald-400 bg-emerald-950/60 p-4 text-sm text-emerald-100">
            {feedback}
          </div>
        )}

        <ChatInput
          prompt={prompt}
          onPromptChange={setPrompt}
          onGenerate={() => generate()}
          isLoading={isLoading}
          onImageChange={setUploadedImage}
          selectedImage={uploadedImage}
        />

        <Controls params={safeParams} onChange={setParams} />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold">Historial y resultados</h2>
          <button
            type="button"
            onClick={() => setHistory([])}
            className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-rose-200 transition hover:bg-white/20"
          >
            Borrar historial
          </button>
        </div>

        <Gallery history={history} onVariant={handleVariant} onDownload={handleDownload} />

        <ChatHistory history={history} onCopy={handleCopy} />
      </div>
    </div>
  );
}

export default App;
