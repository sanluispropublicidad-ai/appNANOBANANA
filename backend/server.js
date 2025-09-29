import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { GoogleAuth } from 'google-auth-library';

const app = express();
const port = process.env.PORT || 4000;

const PROJECT_ID = process.env.VERTEX_PROJECT_ID;
const LOCATION = process.env.VERTEX_LOCATION;
const MODEL = process.env.VERTEX_MODEL;
const DEFAULT_ENDPOINT = PROJECT_ID && LOCATION && MODEL
  ? `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL}:predict`
  : undefined;
const ENDPOINT = process.env.VERTEX_ENDPOINT || DEFAULT_ENDPOINT;

const MAX_BATCH = 8;
const ALLOWED_ASPECT_RATIOS = new Set(['1:1', '16:9', '9:16']);
const auth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const validationError = (message, details = {}) => ({
  error: {
    code: 'VALIDATION_ERROR',
    message,
    details,
  },
});

app.post('/api/generate', async (req, res, next) => {
  try {
    const {
      prompt,
      aspectRatio = '1:1',
      candidateCount = 1,
      temperature = 0.4,
      topP = 0.95,
    } = req.body || {};

    if (typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json(
        validationError('`prompt` is required and must be a non-empty string.')
      );
    }

    if (!ALLOWED_ASPECT_RATIOS.has(aspectRatio)) {
      return res.status(400).json(
        validationError('`aspectRatio` must be one of: 1:1, 16:9, 9:16.', { aspectRatio })
      );
    }

    const parsedCandidateCount = Number(candidateCount);
    if (
      !Number.isInteger(parsedCandidateCount) ||
      parsedCandidateCount < 1 ||
      parsedCandidateCount > MAX_BATCH
    ) {
      return res.status(400).json(
        validationError('`candidateCount` must be an integer between 1 and 8.', {
          candidateCount,
        })
      );
    }

    const parsedTemperature = Number(temperature);
    if (Number.isNaN(parsedTemperature) || parsedTemperature < 0 || parsedTemperature > 2) {
      return res.status(400).json(
        validationError('`temperature` must be a number between 0.0 and 2.0.', {
          temperature,
        })
      );
    }

    const parsedTopP = Number(topP);
    if (Number.isNaN(parsedTopP) || parsedTopP < 0 || parsedTopP > 1) {
      return res.status(400).json(
        validationError('`topP` must be a number between 0.0 and 1.0.', { topP })
      );
    }

    if (!ENDPOINT) {
      return res.status(500).json({
        error: {
          code: 'CONFIGURATION_ERROR',
          message:
            'Vertex AI endpoint configuration is missing. Ensure VERTEX_PROJECT_ID, VERTEX_LOCATION, VERTEX_MODEL, or VERTEX_ENDPOINT are set.',
        },
      });
    }

    const client = await auth.getClient();
    const headers = await client.getRequestHeaders();

    const payload = {
      instances: [
        {
          prompt: prompt.trim(),
          aspectRatio,
        },
      ],
      parameters: {
        candidateCount: parsedCandidateCount,
        temperature: parsedTemperature,
        topP: parsedTopP,
      },
    };

    const vertexResponse = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await vertexResponse.json().catch(() => ({ message: 'Invalid JSON response from Vertex AI.' }));

    if (!vertexResponse.ok) {
      return res.status(vertexResponse.status).json({
        error: {
          code: 'VERTEX_API_ERROR',
          message: data?.error?.message || 'Vertex AI request failed.',
          details: data,
        },
      });
    }

    return res.json({
      request: {
        prompt: prompt.trim(),
        aspectRatio,
        candidateCount: parsedCandidateCount,
        temperature: parsedTemperature,
        topP: parsedTopP,
      },
      response: data,
    });
  } catch (error) {
    return next(error);
  }
});

app.use((_req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Resource not found.',
    },
  });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred.',
    },
  });
});

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
