export default interface Message {
  type: "join" | "ice-candidate" | "offer" | "answer";
  meetingCode?: string;
}