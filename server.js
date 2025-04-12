const WebSocket = require('ws');
const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = app.listen(3000, () => {
  console.log('🌐 Serveur lancé sur http://localhost:3000');
});

const wss = new WebSocket.Server({ server });

wss.on('connection', ws => {
  ws.id = uuidv4(); // chaque client a un ID unique
  ws.username = null;

  ws.on('message', data => {
    try {
      const msg = JSON.parse(data);

      if (msg.type === 'setUsername') {
        ws.username = msg.username;
        return;
      }

      if (msg.type === 'message') {
        const payload = JSON.stringify({
          type: 'message',
          from: ws.username || 'Anonyme',
          id: ws.id,
          content: msg.content,
          sendingTime: msg.sendingTime || new Date().toISOString()
        });

        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(payload);
          }
        });
      }
    } catch (e) {
      console.error('Erreur de message JSON reçu :', data);
      console.error(e);
    }
  });
});

app.use(express.static(__dirname));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});