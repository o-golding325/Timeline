
import { promises as fs } from 'fs';

import path from 'path';
const FILE_PATH = path.join(process.cwd(), 'src', 'data', 'suggestions.json');

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { feedback } = req.body;
    if (!feedback || feedback.length < 3) {
      return res.status(400).json({ error: 'Feedback too short.' });
    }
    let suggestions = [];
    try {
      const data = await fs.readFile(FILE_PATH, 'utf8');
      suggestions = JSON.parse(data);
    } catch (e) {
      // File may not exist yet
    }
    const newSuggestion = {
      id: Date.now(),
      feedback,
      status: 'pending',
      created: new Date().toISOString()
    };
    suggestions.push(newSuggestion);
    try {
      await fs.writeFile(FILE_PATH, JSON.stringify(suggestions, null, 2));
    } catch (err) {
      console.error('Failed to write suggestions.json:', err);
      return res.status(500).json({ error: 'Failed to write suggestions file.' });
    }
    // Email notification removed (send-email module missing)
    return res.status(201).json({ success: true });
  }
  if (req.method === 'GET') {
    try {
      const data = await fs.readFile(FILE_PATH, 'utf8');
      const suggestions = JSON.parse(data);
      return res.status(200).json(suggestions);
    } catch (e) {
      return res.status(200).json([]);
    }
  }
  if (req.method === 'PUT') {
    const { id, status } = req.body;
    if (!id || !status) return res.status(400).json({ error: 'Missing id or status' });
    let suggestions = [];
    try {
      const data = await fs.readFile(FILE_PATH, 'utf8');
      suggestions = JSON.parse(data);
    } catch (e) {
      // File may not exist yet
    }
    const idx = suggestions.findIndex(s => s.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Suggestion not found' });
    suggestions[idx].status = status;
    await fs.writeFile(FILE_PATH, JSON.stringify(suggestions, null, 2));
    return res.status(200).json({ success: true });
  }
  res.setHeader('Allow', ['GET', 'POST', 'PUT']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
