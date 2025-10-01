import { ChangeEvent, FormEvent } from 'react';
import { UploadedImage } from '../types';

interface ChatInputProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  onImageChange: (image: UploadedImage | null) => void;
  selectedImage: UploadedImage | null;
}

const ChatInput = ({
  prompt,
  onPromptChange,
  onGenerate,
  isLoading,
  onImageChange,
  selectedImage,
}: ChatInputProps) => {
  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      onImageChange(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        const base64 = result.split(',')[1] ?? '';
        onImageChange({
          data: base64,
          mimeType: file.type || 'image/png',
          name: file.name,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onGenerate();
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4 rounded-xl bg-white/10 p-6 shadow-lg">
      <label className="text-lg font-semibold" htmlFor="prompt">
        Escribe tu idea
      </label>
      <textarea
        id="prompt"
        value={prompt}
        onChange={(event) => onPromptChange(event.target.value)}
        placeholder="Describe la imagen que quieres crear..."
        className="min-h-[120px] w-full rounded-lg border border-white/20 bg-white/5 p-4 text-base text-white placeholder-white/60 focus:border-amber-300 focus:outline-none"
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-white/80">
          <span className="rounded-md bg-white/10 px-3 py-2 transition hover:bg-white/20">Subir imagen</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          {selectedImage ? (
            <span className="text-xs text-amber-200">{selectedImage.name}</span>
          ) : (
            <span className="text-xs text-white/50">(opcional)</span>
          )}
        </label>
        {selectedImage && (
          <button
            type="button"
            onClick={() => onImageChange(null)}
            className="text-xs font-semibold text-rose-200 hover:text-rose-100"
          >
            Quitar imagen
          </button>
        )}
      </div>
      <button
        type="submit"
        disabled={isLoading || !prompt.trim()}
        className="flex items-center justify-center gap-2 rounded-lg bg-amber-400 px-6 py-3 text-base font-bold text-slate-900 transition enabled:hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-amber-200"
      >
        {isLoading ? 'Generando...' : 'Generar'}
      </button>
    </form>
  );
};

export default ChatInput;
