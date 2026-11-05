import { useState } from "react";

interface Props {
  onAdd: (titles: string[]) => void;
}

export function TopicInput({ onAdd }: Props) {
  const [text, setText] = useState("");

  const submit = () => {
    const titles = text
      .split("\n")
      .map((l) => l.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "").trim())
      .filter(Boolean);
    if (titles.length) {
      onAdd(titles);
      setText("");
    }
  };

  return (
    <div className="card">
      <h3>Lista zagadnień</h3>
      <textarea
        rows={5}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Wklej zagadnienia, jedno w linii"
      />
      <button onClick={submit}>Dodaj</button>
    </div>
  );
}
