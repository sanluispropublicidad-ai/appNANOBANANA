import express from 'express';

const app = express();
const port = process.env.PORT || 4000;

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
