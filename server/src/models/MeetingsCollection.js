import logger from "../utils/logger.js";

class MeetingsCollection extends Map {
  leaveMeeting(senderSocket) {
    if (senderSocket.meetingCode && this.has(senderSocket.meetingCode)) {
      const meetingCode = senderSocket.meetingCode;
      const meeting = this.get(meetingCode);

      meeting.delete(senderSocket);

      logger.log(
        `Из встречи ${meetingCode} вышел 1 участник, осталось участников: ${meeting.size}`,
      );

      if (meeting.size === 0) {
        this.delete(meetingCode);
        logger.log(`Комната ${meetingCode} удалена`);
      }
    }
  }

  joinMeeting(senderSocket, meetingCode) {
    if (senderSocket.meetingCode) {
      leaveMeeting(senderSocket, senderSocket.meetingCode);
    }

    if (!this.has(meetingCode)) {
      this.set(meetingCode, new Set());
    }

    this.get(meetingCode).add(senderSocket);
    senderSocket.meetingCode = meetingCode;

    logger.log(
      `Клиент вошёл в комнату: ${meetingCode}, количество участников во встрече: ${this.get(meetingCode).size}`,
    );
  }

  broadcastToMeeting(senderSocket, meetingCode, data) {
    const meeting = this.get(meetingCode);
    if (!meeting) return;

    meeting.forEach((clientSocket) => {
      if (
        clientSocket !== senderSocket &&
        clientSocket.readyState === WebSocket.OPEN
      ) {
        const msg = JSON.stringify(data);
        clientSocket.send(msg);
      }
    });
  }
}

export default MeetingsCollection;
