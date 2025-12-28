import Message from "@/models/message";

const socket = new WebSocket("ws://localhost:8080");

socket.onmessage = function (event) {
  console.log(`[message] Данные получены с сервера: ${event.data}`);
};

socket.onclose = function (event) {
  if (event.wasClean) {
    console.log(
      `[close] Соединение закрыто чисто, код=${event.code} причина=${event.reason}`,
    );
  } else {
    // например, сервер убил процесс или сеть недоступна
    // обычно в этом случае event.code 1006
    console.log("[close] Соединение прервано");
  }
};

socket.onerror = function (error) {
  console.log(`[error]: ${error}`);
};

const api = {
  send(msg: Message) {
    socket.send(JSON.stringify(msg));
  },
};

export default api;
