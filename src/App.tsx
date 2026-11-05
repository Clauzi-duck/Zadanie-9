import { useState } from "react";
import { Chat } from "./components/Chat";
import { ProgressBar } from "./components/ProgressBar";
import { Quiz } from "./components/Quiz";
import { TopicInput } from "./components/TopicInput";
import { TopicList } from "./components/TopicList";
import { useLocalStorage } from "./hooks/useLocalStorage";
import type { Message, Topic } from "./types";

export default function App() {
  const [topics, setTopics] = useLocalStorage<Topic[]>("topics", []);
  const [chats, setChats] = useLocalStorage<Record<string, Message[]>>("chats", {});
  const [selectedId, setSelectedId] = useLocalStorage<string | null>("selected", null);
  const [tab, setTab] = useState<"chat" | "quiz">("chat");

  const selected = topics.find((t) => t.id === selectedId) ?? null;

  const addTopics = (titles: string[]) =>
    setTopics([
      ...topics,
      ...titles.map((title) => ({ id: crypto.randomUUID(), title, status: "new" as const })),
    ]);

  const removeTopic = (id: string) => {
    setTopics(topics.filter((t) => t.id !== id));
    const { [id]: _removed, ...rest } = chats;
    setChats(rest);
    if (selectedId === id) setSelectedId(null);
  };

  const setStatus = (id: string, status: Topic["status"]) =>
    setTopics(topics.map((t) => (t.id === id ? { ...t, status } : t)));

  const updateChat = (id: string, messages: Message[]) => {
    setChats({ ...chats, [id]: messages });
    const topic = topics.find((t) => t.id === id);
    if (topic?.status === "new") setStatus(id, "learning");
  };

  return (
    <div className="app">
      <aside>
        <h1>Bot do nauki</h1>
        <ProgressBar topics={topics} />
        <TopicInput onAdd={addTopics} />
        <TopicList
          topics={topics}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onRemove={removeTopic}
        />
      </aside>
      <main>
        {selected ? (
          <>
            <h2>{selected.title}</h2>
            <div className="tabs">
              <button className={tab === "chat" ? "active" : ""} onClick={() => setTab("chat")}>
                Nauka
              </button>
              <button className={tab === "quiz" ? "active" : ""} onClick={() => setTab("quiz")}>
                Quiz
              </button>
              {selected.status === "mastered" && (
                <button onClick={() => setStatus(selected.id, "learning")}>Cofnij opanowanie</button>
              )}
            </div>
            {tab === "chat" ? (
              <Chat
                key={selected.id}
                topic={selected.title}
                messages={chats[selected.id] ?? []}
                onChange={(m) => updateChat(selected.id, m)}
              />
            ) : (
              <Quiz
                key={selected.id}
                topic={selected.title}
                onPassed={() => setStatus(selected.id, "mastered")}
              />
            )}
          </>
        ) : (
          <p className="muted">Wklej listę zagadnień i wybierz temat, aby zacząć.</p>
        )}
      </main>
    </div>
  );
}
