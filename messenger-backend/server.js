const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8080 });

// Структура: rooms = { 'roomCode': Set<WebSocket> }
const rooms = new Map();

console.log("Сигналинг-сервер запущен на ws://localhost:8080");

wss.on("connection", (ws) => {
  console.log("Новое соединение");

  // Храним текущую комнату этого сокета (опционально)
  ws.roomCode = null;

  ws.on("message", (data) => {
    try {
      const msg = JSON.parse(data);

      // Обязательно: клиент должен сначала "войти" в комнату
      if (msg.type === "join") {
        const roomCode = msg.roomCode;
        if (!roomCode || typeof roomCode !== "string") {
          ws.send(JSON.stringify({ error: "Неверный код комнаты" }));
          return;
        }

        // Выйти из предыдущей комнаты (если был)
        if (ws.roomCode) {
          leaveRoom(ws, ws.roomCode);
        }

        // Войти в новую комнату
        joinRoom(ws, roomCode);
        ws.roomCode = roomCode;
        console.log(`Клиент вошёл в комнату: ${roomCode}`);
        return;
      }

      // Если клиент ещё не в комнате — игнорируем другие сообщения
      if (!ws.roomCode) {
        ws.send(JSON.stringify({ error: "Сначала присоединитесь к комнате" }));
        return;
      }

      // Ретранслируем сообщение всем в комнате (кроме отправителя)
      broadcastToRoom(ws.roomCode, data, ws);
    } catch (err) {
      console.error("Ошибка обработки сообщения:", err);
      ws.send(JSON.stringify({ error: "Некорректное сообщение" }));
    }
  });

  ws.on("close", () => {
    if (ws.roomCode) {
      leaveRoom(ws, ws.roomCode);
    }
    console.log("Соединение закрыто");
  });

  ws.on("error", (err) => {
    console.error("WebSocket error:", err);
  });
});

function joinRoom(ws, roomCode) {
  if (!rooms.has(roomCode)) {
    rooms.set(roomCode, new Set());
  }
  rooms.get(roomCode).add(ws);
}

function leaveRoom(ws, roomCode) {
  const room = rooms.get(roomCode);
  if (room) {
    room.delete(ws);
    // Очистка пустых комнат (опционально)
    if (room.size === 0) {
      rooms.delete(roomCode);
      console.log(`Комната ${roomCode} удалена (пустая)`);
    }
  }
}

function broadcastToRoom(roomCode, data, sender) {
  const room = rooms.get(roomCode);
  if (!room) return;

  room.forEach((client) => {
    if (client !== sender && client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}
