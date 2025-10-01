export type AspectRatioOption = '1:1' | '16:9' | '9:16';

export interface GenerationParams {
  aspectRatio: AspectRatioOption;
  batchSize: number;
  localeAware: boolean;
  safetyThreshold: number;
  timeout: number;
  seed?: number | null;
}

export interface UploadedImage {
  data: string;
  mimeType: string;
  name: string;
}

export interface HistoryEntry {
  id: string;
  prompt: string;
  text: string;
  images: string[];
  createdAt: string;
  params: GenerationParams;
  metadata?: Record<string, unknown>;
  inputImage?: UploadedImage | null;
}
