import meetings from "../services/meetingsStorage.js";
import logger from "../utils/logger.js";

export default class User {
  socket = null;
  meetingCode = "";

  constructor(socket) {
    this.id = this.#generateId();
    this.socket = socket;
  }

  send(msg) {
    msg = this.#normalize(msg);
    this.socket.send(msg);
  }

  leaveMeeting() {
    if (!this.hasMeeting) {
      throw new Error(
        `${this.id} попытался покинуть встречу не находясь в ней`,
      );
    }

    meetings.removeUsers(this.meetingCode, this);
  }

  joinMeeting(meetingCode) {
    if (this.hasMeeting) {
      this.leaveMeeting();
    }

    if (!meetings.has(meetingCode)) {
      meetings.new(meetingCode, this);
    } else {
      meetings.addUsers(meetingCode, this);
    }

    this.meetingCode = meetingCode;
  }

  broadcastToMeeting(msg) {
    if (!this.hasMeeting) {
      throw new Error(
        `${this.id} попытался передать сообщение вне комнаты: ${msg}`,
      );
    }
    msg = this.#normalize(msg);
    const users = meetings.getUsers(this.meetingCode);

    for (const user of users) {
      if (user !== this && user.socket.readyState === WebSocket.OPEN) {
        user.send(msg);
      }
    }
  }

  get hasMeeting() {
    return !!this.meetingCode;
  }

  #normalize(msg) {
    if (typeof msg !== "string") {
      msg = JSON.stringify(msg);
    }
    return msg;
  }

  #generateId() {
    const id =
      (new Date().getTime()).toString() +
      Math.floor(Math.random() * 10_000).toString();
    return id.toString();
  }
}
