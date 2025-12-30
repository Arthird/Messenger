import User from "./src/models/User.js";
import logger from "./src/utils/logger.js";
import { WebSocketServer } from "ws";

const server = new WebSocketServer({ port: 8080 });

server.on("listening", () => {
  logger.log("Launch complite");
});

server.on("connection", (senderSocket) => {
  const user = new User(senderSocket);
  logger.log(`A new user (${user.id}) has connect`);
  
  user.socket.on("message", (message) => {
    const data = JSON.parse(message);

    try {
      if (!user.hasMeeting && data.type !== "join") {
        user.send(JSON.stringify({ type: "error", errorCode: "NO_MEETING" }));
        throw Error("Attempting to connect outside of a meeting");
      }

      switch (data.type) {
        case "join":
          user.joinMeeting(data.meetingCode);
          user.broadcastToMeeting(data);
          break;

        case "offer":
          user.broadcastToMeeting(data);
          break;
        case "answer":
          break;
        case "ice-candidate":
          break;
      }
    } catch (err) {
      logger.error(JSON.stringify(err));
    }
  });

  user.socket.on("close", () => {
    if (user.hasMeeting) {
      user.leaveMeeting(senderSocket);
    }
    logger.log(`The connection (${user.id}) has closed`);
  });

  user.socket.on("error", (err) => {
    logger.error("WebSocket error:", err);
  });
});
