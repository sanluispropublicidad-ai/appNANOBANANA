import express from 'express';
import dotenv from 'dotenv';
import { VertexAI } from '@google-cloud/vertexai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json({ limit: '25mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const projectId = process.env.PROJECT_ID || 'macro-centaur-466606-v0';
const location = process.env.LOCATION || 'us-central1';
const modelName = process.env.MODEL_NAME || 'gemini-2.5-flash-image-preview';

const vertexAI = new VertexAI({
  project: projectId,
  location,
});

const allowedAspectRatios = new Set(['1:1', '16:9', '9:16']);

const mapThreshold = (value) => {
  if (value <= 0.25) return 'BLOCK_NONE';
  if (value <= 0.5) return 'BLOCK_LOW_AND_ABOVE';
  if (value <= 0.75) return 'BLOCK_MEDIUM_AND_ABOVE';
  return 'BLOCK_ONLY_HIGH';
};

const buildSafetySettings = (threshold) => {
  const categories = [
    'HARM_CATEGORY_HATE_SPEECH',
    'HARM_CATEGORY_DANGEROUS_CONTENT',
    'HARM_CATEGORY_HARASSMENT',
    'HARM_CATEGORY_SEXUAL_CONTENT',
  ];

  return categories.map((category) => ({
    category,
    threshold: mapThreshold(threshold),
  }));
};

app.post('/api/generate-image', async (req, res) => {
  const { prompt, image, params = {} } = req.body ?? {};

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'El campo prompt es obligatorio y debe ser texto.' });
  }

  const {
    aspectRatio = '1:1',
    batchSize = 1,
    localeAware = false,
    safetyThreshold = 0.5,
    timeout = 60,
    seed = null,
  } = params;

  const normalizedAspectRatio = allowedAspectRatios.has(String(aspectRatio)) ? aspectRatio : '1:1';
  const normalizedBatch = Math.min(Math.max(Number(batchSize) || 1, 1), 4);
  const normalizedTimeout = Math.min(Math.max(Number(timeout) || 60, 5), 300) * 1000;
  const normalizedSafety = Math.min(Math.max(Number(safetyThreshold) || 0.5, 0), 1);
  const normalizedSeed = seed === null || seed === undefined || seed === '' ? undefined : Number(seed);

  const systemParts = [];
  if (localeAware) {
    systemParts.push({
      text: 'Responde en el mismo idioma del usuario y adapta el contenido a su contexto cultural.',
    });
  }

  const userParts = [{ text: prompt }];

  if (image && typeof image === 'object' && image.data && image.mimeType) {
    userParts.push({
      inlineData: {
        mimeType: image.mimeType,
        data: image.data,
      },
    });
  }

  const contents = [];
  if (systemParts.length > 0) {
    contents.push({
      role: 'system',
      parts: systemParts,
    });
  }

  contents.push({
    role: 'user',
    parts: userParts,
  });

  const generationConfig = {
    responseModalities: ['TEXT', 'IMAGE'],
    candidateCount: normalizedBatch,
    aspectRatio: normalizedAspectRatio,
    ...(normalizedSeed !== undefined && !Number.isNaN(normalizedSeed) ? { seed: normalizedSeed } : {}),
  };

  const safetySettings = buildSafetySettings(normalizedSafety);

  const model = vertexAI.preview.getGenerativeModel({
    model: modelName,
    generationConfig,
    safetySettings,
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), normalizedTimeout);

  try {
    const result = await model.generateContent({ contents }, { signal: controller.signal });
    const response = result.response;

    const text = response?.candidates
      ?.flatMap((candidate) => candidate.content?.parts ?? [])
      ?.filter((part) => typeof part.text === 'string')
      ?.map((part) => part.text)
      ?.join('\n') ?? '';

    const images = response?.candidates
      ?.flatMap((candidate) => candidate.content?.parts ?? [])
      ?.filter((part) => part.inlineData?.data)
      ?.map((part) => part.inlineData.data) ?? [];

    return res.json({
      text,
      image: images[0] ?? null,
      images,
      metadata: {
        model: modelName,
        projectId,
        location,
        receivedParams: {
          aspectRatio: normalizedAspectRatio,
          batchSize: normalizedBatch,
          localeAware,
          safetyThreshold: normalizedSafety,
          timeout: normalizedTimeout / 1000,
          seed: normalizedSeed ?? null,
        },
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('Error al generar imagen:', err);
    if (err && typeof err === 'object' && 'name' in err && err.name === 'AbortError') {
      return res.status(504).json({ error: 'La solicitud tardó demasiado tiempo y fue cancelada.' });
    }
    const message = err instanceof Error ? err.message : 'Error desconocido al comunicarse con Vertex AI.';
    return res.status(500).json({ error: message });
  } finally {
    clearTimeout(timeoutId);
  }
});

app.use((err, _req, res, _next) => {
  console.error('Error no controlado:', err);
  res.status(500).json({ error: 'Error interno del servidor.' });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
