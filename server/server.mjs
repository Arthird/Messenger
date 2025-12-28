import logger from "./src/logger";
import WebSocket from "ws";
const server = new WebSocket.Server({ port: 8080 });

const meetings = new Map();

server.on("listening", () => {
  logger.log("Launch complite");
});

server.on("connection", (senderSocket) => {
  logger.log("A new client has connect");

  senderSocket.meetingCode = null;

  senderSocket.on("message", (message) => {
    try {
      const data = JSON.parse(message);

      switch (data.type) {
        case "join":
          joinMeeting(senderSocket, data.meetingCode);
          broadcast(senderSocket, senderSocket.meetingCode, data);
          break;

        case "offer":
          broadcast(senderSocket, senderSocket.meetingCode, data);
          break;
        case "answer":
          break;
        case "ice-candidate":
          break;
      }

      // Если клиент ещё не в комнате — игнорируем другие сообщения
      if (!senderSocket.meetingCode) {
        senderSocket.send(
          JSON.stringify({ type: "error", errorCode: "NO_MEETING" }),
        );
        return;
      }
    } catch (err) {
      logger.error("Ошибка обработки сообщения:", err);
      senderSocket.send(JSON.stringify({ type: "error", errorCode: err.name }));
    }
  });

  senderSocket.on("close", () => {
    leaveMeeting(senderSocket);
    logger.log("Соединение закрыто");
  });

  senderSocket.on("error", (err) => {
    logger.error("WebSocket error:", err);
  });
});

function leaveMeeting(senderSocket) {
  if (senderSocket.meetingCode && meetings.has(senderSocket.meetingCode)) {
    const meetingCode = senderSocket.meetingCode;
    const meeting = meetings.get(meetingCode);

    logger.log(
      `Из встречи ${meetingCode} вышел 1 участник, осталось участников: ${meeting.size()}`,
    );

    if (meeting.size === 0) {
      meetings.delete(meetingCode);
      logger.log(`Комната ${meetingCode} удалена`);
    }
  }
}

function joinMeeting(senderSocket, meetingCode) {
  if (senderSocket.meetingCode) {
    leaveMeeting(senderSocket, senderSocket.meetingCode);
  }

  if (!meetings.has(meetingCode)) {
    meetings.set(meetingCode, new Set());
  }

  meetings.get(meetingCode).add(senderSocket);
  senderSocket.meetingCode = meetingCode;

  logger.log(
    `Клиент вошёл в комнату: ${meetingCode}, количество участников во встрече: ${meetings.get(meetingCode).size()}`,
  );
}

function broadcast(senderSocket, meetingCode, data) {
  const meeting = meetings.get(meetingCode);
  if (!meeting) return;

  meeting.forEach((clientSocket) => {
    if (
      clientSocket !== senderSocket &&
      clientSocket.readyState === WebSocket.OPEN
    ) {
      clientSocket.send(data);
    }
  });
}
