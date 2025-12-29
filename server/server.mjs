import UsersCollection from "./src/models/UsersCollection.js";
import MeetingsCollection from "./src/models/MeetingsCollection.js";
import logger from "./src/utils/logger.js";
import { WebSocketServer } from "ws";

const server = new WebSocketServer({ port: 8080 });

const meetings = new MeetingsCollection();
const users = new UsersCollection();

server.on("listening", () => {
  logger.log("Launch complite");
});

server.on("connection", (senderSocket) => {
  logger.log("A new client has connect");
  // -- const user = new User(senderSocket)
  users.append(senderSocket); // -- статическое св-во должно быть с количеством юзеров

  senderSocket.meetingCode = null; //user.meetingCode = null в самом классе

  senderSocket.on("message", (message) => {
    // -- user.socket .on("message", (message) => {
    // logger.log(message);
    const data = JSON.parse(message);

    try {
      if (!senderSocket.meetingCode && data.type !== "join") {
        // -- if (!user.hasMeeting && data.type !== "join") {
        senderSocket.send(
          // -- user.send(
          JSON.stringify({ type: "error", errorCode: "NO_MEETING" }),
        );

        logger.error("Attempting to connect outside of a meeting");
        return;
      }
    } catch (err) {
      logger.error(JSON.stringify(err));
    }

    switch (data.type) {
      case "join":
        meetings.joinMeeting(senderSocket, data.meetingCode);
        meetings.broadcastToMeeting(
          senderSocket,
          senderSocket.meetingCode,
          data,
        );
        /*
        user.joinMeeting(data.meetingCode);
        user.broadcastToMeeting(
          data
        );
        */
        break;

      case "offer":
        meetings.broadcastToMeeting(
          senderSocket,
          senderSocket.meetingCode,
          data,
        );
        /*
        user.broadcastToMeeting(
          data
        );
        */
        break;
      case "answer":
        break;
      case "ice-candidate":
        break;
    }
  });

  senderSocket.on("close", () => {
    meetings.leaveMeeting(senderSocket);
    users.remove(senderSocket);
    logger.log("Соединение закрыто");
  });
  /*
  user.socket.on("close", () => {
    user.leaveMeeting(senderSocket);
    logger.log("Соединение закрыто");
  });
  */
  senderSocket.on("error", (err) => {
    // -- user.socket.on("error", (err) => {
    logger.error("WebSocket error:", err);
  });
});
