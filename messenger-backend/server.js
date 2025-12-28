const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8080 });

// Структура: rooms = { 'meetingCode': Set<WebSocket> }
const meetings = new Map();

console.log("Сигналинг-сервер запущен на ws://localhost:8080");

wss.on("connection", (ws) => {
  console.log("Новое соединение");

  // Храним текущую комнату этого сокета (опционально)
  ws.meetingCode = null;

  ws.on("message", (data) => {
    try {
      const msg = JSON.parse(data);

      // Обязательно: клиент должен сначала "войти" в комнату
      switch (msg.type) {
        case "join":
          const meetingCode = msg.meetingCode;

          // Выйти из предыдущей комнаты (если был)
          if (ws.meetingCode) {
            leave(ws, ws.meetingCode);
          }

          // Войти в новую комнату
          join(ws, meetingCode);
          ws.meetingCode = meetingCode;
          console.log(`Клиент вошёл в комнату: ${meetingCode}`);
          break;
        
        case 'offer':
          break;
        case 'answer':
          break;
        case 'ice-candidate':
          break;
      }

      // Если клиент ещё не в комнате — игнорируем другие сообщения
      if (!ws.meetingCode) {
        ws.send(JSON.stringify({ error: "Сначала присоединитесь к комнате" }));
        return;
      }

      // Ретранслируем сообщение всем в комнате (кроме отправителя)
      broadcast(ws.meetingCode, data, ws);
    } catch (err) {
      console.error("Ошибка обработки сообщения:", err);
      ws.send(JSON.stringify({ error: "Некорректное сообщение" }));
    }
  });

  ws.on("close", () => {
    if (ws.meetingCode) {
      leave(ws, ws.meetingCode);
    }
    console.log("Соединение закрыто");
  });

  ws.on("error", (err) => {
    console.error("WebSocket error:", err);
  });
});

function join(ws, meetingCode) {
  if (!meetings.has(meetingCode)) {
    meetings.set(meetingCode, new Set());
  }
  meetings.get(meetingCode).add(ws);
  console.log(meetings.get(meetingCode))
}

function leave(ws, meetingCode) {
  const meeting = meetings.get(meetingCode);
  if (meeting) {
    meeting.delete(ws);
    if (meeting.size === 0) {
      meetings.delete(meetingCode);
      console.log(`Комната ${meetingCode} удалена (пустая)`);
    }
  }
}

function broadcast(meetingCode, data, sender) {
  const meeting = meetings.get(meetingCode);
  if (!meeting) return;

  meeting.forEach((client) => {
    if (client !== sender && client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}
