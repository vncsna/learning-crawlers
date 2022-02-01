import express from 'express';
import { WordleSolver } from './solvers/wordle';

export const app = express();

app.get('/', (req, res) => {
  res.json({ working: true });
});

app.get('/wordle', async (req, res) => {
  const solver = await new WordleSolver().start();
  const solution = await solver.solve();

  res.json({ solution });
});

app.get('/wordle/screen',  async (req, res) => {
  const solver = await new WordleSolver().start();
  const solution = await solver.solveAndScreen();

  res.sendFile(solution);
});

app.get('/wordle/record', async (req, res) => {
  const solver = await new WordleSolver().start();
  const solution = await solver.solveAndRecord();

  res.sendFile(solution);
});
