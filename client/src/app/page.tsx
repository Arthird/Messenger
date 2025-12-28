"use client";

import api from "@/lib/api";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [meetingCode, setMeetingCode] = useState("");
  const [hasWarning, setHasWarning] = useState<boolean>(false);
  const [warningText, setWarningText] = useState<string>("");

  const minLength = 6;
  const maxLength = 12;

  const isCodeTooShort = useMemo(
    () => meetingCode.length < minLength,
    [meetingCode],
  );

  const handleMeetingCodeChange = (value: string) => {
    setMeetingCode(value);

    if (hasWarning) {
      if (!(value.length < minLength)) {
        warningDisable();
      }
    }
  };

  const handleSubmit = () => {
    if (isCodeTooShort) {
      warningEnable(
        `The code is too short, the minimum code length is ${minLength} characters.`,
      );
      return;
    }

    api.send({ type: "join", meetingCode: meetingCode });
    router.replace("/waiting-room");
  };

  const warningEnable = (warningText: string) => {
    setHasWarning(true);
    setWarningText(warningText);
  };
  const warningDisable = () => {
    setHasWarning(false);
  };

  return (
    <main className="flex items-center justify-center w-full h-dvh max-h-dvh">
      <div className="flex flex-col items-center min-h-80 h-80">
        <h1 className="text-8xl">Hush!</h1>
        <input
          className="text-2xl text-center focus:outline-none w-full placeholder:text-zinc-500"
          name="meetingCode"
          type="text"
          maxLength={maxLength}
          value={meetingCode}
          onChange={(e) => handleMeetingCodeChange(e.target.value)}
          placeholder="Enter the meeting code"
          required
          aria-label="Meeting code"
          aria-required="true"
          autoFocus={true}
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck="false"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSubmit();
            }
          }}
        />

        <button
          className="text-lg bg-zinc-800 mt-2 border-zinc-800 rounded-sm p-2 hover:bg-zinc-700 transition-colors duration-200"
          onClick={handleSubmit}
        >
          Connect
        </button>
        <div
          className={`mt-2 hint ${hasWarning ? "hint--visible" : "hint--hidden"}`}
        >
          <span className="text-center text-sm mt-1 text-zinc-500">
            {warningText || "Error"}
          </span>
        </div>
      </div>
    </main>
  );
}
