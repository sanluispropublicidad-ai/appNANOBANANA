import { GenerationParams, AspectRatioOption } from '../types';

interface ControlsProps {
  params: GenerationParams;
  onChange: (params: GenerationParams) => void;
}

const aspectRatioOptions: AspectRatioOption[] = ['1:1', '16:9', '9:16'];

const Controls = ({ params, onChange }: ControlsProps) => {
  const update = (partial: Partial<GenerationParams>) => {
    onChange({ ...params, ...partial });
  };

  return (
    <section className="flex w-full flex-col gap-6 rounded-xl bg-white/10 p-6 shadow-lg">
      <h2 className="text-xl font-semibold">Parámetros avanzados</h2>
      <div className="grid gap-6 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-white/80">Aspect ratio</span>
          <select
            value={params.aspectRatio}
            onChange={(event) => update({ aspectRatio: event.target.value as AspectRatioOption })}
            className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white focus:border-amber-300 focus:outline-none"
          >
            {aspectRatioOptions.map((option) => (
              <option key={option} value={option} className="text-slate-900">
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-white/80">Batch (número de imágenes)</span>
          <input
            type="range"
            min={1}
            max={4}
            value={params.batchSize}
            onChange={(event) => update({ batchSize: Number(event.target.value) })}
          />
          <span className="text-xs text-white/60">{params.batchSize} imagen(es)</span>
        </label>

        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={params.localeAware}
            onChange={(event) => update({ localeAware: event.target.checked })}
            className="h-4 w-4 rounded border-white/40 bg-white/10 text-amber-300 focus:ring-amber-300"
          />
          <span className="font-medium text-white/80">Locale-aware</span>
        </label>

        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-white/80">Safety threshold</span>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(params.safetyThreshold * 100)}
            onChange={(event) => update({ safetyThreshold: Number(event.target.value) / 100 })}
          />
          <span className="text-xs text-white/60">{Math.round(params.safetyThreshold * 100)}%</span>
        </label>

        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-white/80">Timeout (segundos)</span>
          <input
            type="range"
            min={10}
            max={120}
            value={params.timeout}
            onChange={(event) => update({ timeout: Number(event.target.value) })}
          />
          <span className="text-xs text-white/60">{params.timeout} segundos</span>
        </label>

        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-white/80">Seed (opcional)</span>
          <input
            type="number"
            value={params.seed ?? ''}
            onChange={(event) => {
              const value = event.target.value;
              update({ seed: value === '' ? null : Number(value) });
            }}
            placeholder="Aleatorio"
            className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-white focus:border-amber-300 focus:outline-none"
          />
        </label>
      </div>
    </section>
  );
};

export default Controls;
