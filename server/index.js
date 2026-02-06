const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

const distPath = path.join(__dirname, '..', 'dist');

app.use(express.static(distPath));

app.get('/status', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/privacy-policy', (req, res) => {
  res.sendFile(path.join(__dirname, 'privacy-policy.html'));
});

app.get('/user-guide', (req, res) => {
  res.sendFile(path.join(__dirname, 'user-guide.html'));
});

app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
