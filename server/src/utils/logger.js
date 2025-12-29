class Logger {
  log(message) {
    console.log(`${message} | [${new Date().toString().slice(4, 24)}]`);
  }
  error(error) {
    console.error(`${error} | ERROR | [${new Date().toString().slice(4, 24)}]`);
  }
}

const logger = new Logger();

export default logger;
