import logger from "../utils/logger.js";

class UsersCollection extends Array {
  remove(senderSocket) {
    const index = this.findIndex((userSocket) => userSocket === senderSocket);
    if (index !== -1) {
      this.splice(index, 1);
      return true;
    }
    return false;
  }

  append(senderSocket) {
    if (this.find((userSocket) => userSocket === senderSocket)) {
      logger.error("Клиент был зарегистрирован дважды");
      return false;
    }
    this.push(senderSocket);
    return true;
  }

  has(senderSocket) {
    return this.some((userSocket) => userSocket === senderSocket);
  }
}

export default UsersCollection;
