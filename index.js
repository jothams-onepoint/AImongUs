const fs = require('fs');
const path = require('path');
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const { registerSocketHandlers } = require('./src/socket');

const PORT = process.env.PORT || 3001;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const clientDistPath = path.join(__dirname, 'client', 'dist');
const clientIndexPath = path.join(clientDistPath, 'index.html');
app.use(express.static(clientDistPath));
app.get('*', (req, res) => {
  if (fs.existsSync(clientIndexPath)) {
    res.sendFile(clientIndexPath);
  } else {
    res.status(200).send(
      'AImongUs server is running. The client has not been built yet — ' +
      'in development, run the Vite dev server separately (npm --prefix client run dev).',
    );
  }
});

registerSocketHandlers(io);

server.listen(PORT, () => {
  console.log(`AImongUs server listening on port ${PORT}`);
});
