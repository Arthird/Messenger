import Message from "@/models/Message";

const socket = new WebSocket("ws://localhost:8080");

socket.onmessage = function (event) {
  console.log(`[message] Данные получены с сервера: ${event.data}`);
  const data: Message = JSON.parse(event.data)
  switch (data.type) {
    case "join":
      break;
  }
};

socket.onclose = function (event) {
  if (event.wasClean) {
    console.log(
      `[close] Соединение закрыто чисто, код=${event.code} причина=${event.reason}`,
    );
  } else {
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
