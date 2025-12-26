"use client";

import { send } from "@/services/api";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [meetingCode, setMeetingCode] = useState("");
  const lengthLimit = 12;
  const fadeType = meetingCode.length === lengthLimit ? "in-up" : "out-down"
  const onMeetingCodeChange = (value: string) => {
    setMeetingCode(value);
  };

  return (
    <main className="flex items-center flex-col justify-center w-screen h-dvh">
      <span className={"text-sm -z-1 text-zinc-500 animate-fade-" + fadeType }>
        length limit reached
      </span>
      <input
        className="text-2xl text-center focus:outline-none w-full placeholder:text-zinc-500"
        name="meetingCode"
        type="text"
        maxLength={lengthLimit}
        value={meetingCode}
        onChange={(e) => {
          onMeetingCodeChange(e.target.value);
        }}
        placeholder="Enter the meeting code"
        required
      />

      <Link
        className="text-lg bg-zinc-800 border-zinc-800 rounded-sm p-2 mt-2 hover:bg-zinc-700 transition-colors duration-200"
        onClick={() => send({type: "join", roomCode: meetingCode})}
        href="/waiting-room"
      >
        Connect
      </Link>
    </main>
  );
}
