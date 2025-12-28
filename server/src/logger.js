class Logger {
  log(message) {
    console.log(`${message} | [${new Date()}]`);
  }
  error(error) {
    console.error(error);
  }
}

const logger = new Logger();

export default logger;
