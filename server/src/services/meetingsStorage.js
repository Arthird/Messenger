import logger from "../utils/logger.js";

class MeetingsStorage extends Map {
  new(meetingCode, ...users) {
    this.set(meetingCode, new Set(users));
    logger.log(
      `A new meeting (${meetingCode}) has been created, ` 
      + `users: ${users.map((user) => user.id)}`,
    );
  }

  close(meetingCode) {
    this.delete(meetingCode);
    logger.log(`Meeting (${meetingCode}) deleted`);
  }

  addUsers(meetingCode, ...users) {
    if (!this.has(meetingCode)) {
      throw new Error(`There is no meeting (${meetingCode })`);
    }
    const meeting = this.get(meetingCode);

    for (const user of users) {
      meeting.add(user);
    }
    logger.log(`The users (${users.map((user) => user.id)}) joined the meeting`)
  }

  removeUsers(meetingCode, ...users) {
    if (!this.has(meetingCode)) {
      throw new Error(`There is no meeting (${meetingCode})`);
    }
    const usersOfMeeting = this.getUsers(meetingCode);

    for (const user of users) {
      if (!usersOfMeeting.has(user)) {
        throw new Error(
          `Attempt to delete a non-existent ` 
          + `user: ${user.id} in meeting (${meetingCode})`,
        );
      }
      usersOfMeeting.delete(user);
      logger.log(
        `User ${user.id} left meeting (${meetingCode}), ` 
        + `remaining users: ${usersOfMeeting.size}`
      );
    }

    if (usersOfMeeting.size === 0) {
      this.close(meetingCode);
    }
  }

  getUsers(meetingCode) {
    if (arguments.length === 0) {
      throw new TypeError(`getUsers expected 1 argument, but got 0`);
    }
    const users = this.get(meetingCode);
    return users;
  }
}

const meetings = new MeetingsStorage();
export default meetings;
