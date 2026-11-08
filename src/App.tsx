import { useState } from "react";
import { Chat } from "./components/Chat";
import { ProgressBar } from "./components/ProgressBar";
import { Quiz } from "./components/Quiz";
import { StudyPlan } from "./components/StudyPlan";
import { MistakeReview } from "./components/MistakeReview";
import { TopicInput } from "./components/TopicInput";
import { useLocalStorage } from "./hooks/useLocalStorage";
import type { ExamSchedule, LearningObjective, Message, StudyMistake, Topic } from "./types";

type Tab = "chat" | "quiz" | "plan" | "mistakes";
type View = "topics" | "study";

const TAB_LABELS: Record<Tab, string> = {
  chat: "Nauka",
  quiz: "Quiz",
  plan: "Cele i termin",
  mistakes: "Powtórka błędów",
};

const STATUS_LABELS: Record<Topic["status"], string> = {
  new: "Nowy temat",
  learning: "W trakcie nauki",
  mastered: "Opanowany",
};

export default function App() {
  const [topics, setTopics] = useLocalStorage<Topic[]>("topics", []);
  const [chats, setChats] = useLocalStorage<Record<string, Message[]>>("chats", {});
  const [selectedId, setSelectedId] = useLocalStorage<string | null>("selected", null);
  const [tab, setTab] = useState<Tab>("chat");
  const [view, setView] = useState<View>(() => selectedId ? "study" : "topics");
  const [practiceMessages, setPracticeMessages] = useState<Message[]>([]);
  const [practiceMistake, setPracticeMistake] = useState<StudyMistake | null>(null);

  const selected = topics.find((t) => t.id === selectedId) ?? null;

  const addTopics = (items: { title: string; material?: string }[]) =>
    setTopics([
      ...topics,
      ...items.map(({ title, material }) => ({ id: crypto.randomUUID(), title, material, status: "new" as const })),
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

  const updateTopic = (id: string, update: Partial<Topic>) =>
    setTopics(topics.map((topic) => topic.id === id ? { ...topic, ...update } : topic));

  const saveMistakes = (id: string, missed: Omit<StudyMistake, "id" | "createdAt">[]) => {
    if (!missed.length) return;
    const topic = topics.find((item) => item.id === id);
    if (!topic) return;
    const existing = topic.mistakes ?? [];
    const known = new Set(existing.map((mistake) => `${mistake.question}\n${mistake.answer}`));
    const additions = missed
      .filter((mistake) => !known.has(`${mistake.question}\n${mistake.answer}`))
      .map((mistake) => ({ ...mistake, id: crypto.randomUUID(), createdAt: new Date().toISOString() }));
    updateTopic(id, { mistakes: [...existing, ...additions].slice(-30) });
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner">
          <div className="brand-lockup" aria-label="Edubot">
          <img className="brand-mark" src="/edubot-mark.png" alt="" />
          <img className="brand-wordmark" src="/edubot-wordmark.png" alt="edubot" />
          </div>

          <nav className="primary-nav" aria-label="Główne sekcje">
            <button
              className={view === "topics" ? "active" : ""}
              aria-current={view === "topics" ? "page" : undefined}
              onClick={() => setView("topics")}
            >
              Zagadnienia
            </button>
            <button
              className={view === "study" ? "active" : ""}
              aria-current={view === "study" ? "page" : undefined}
              onClick={() => setView("study")}
            >
              Nauka
            </button>
          </nav>

          <div className="header-progress">
            <ProgressBar topics={topics} />
          </div>
        </div>
      </header>

      <main className="workspace">
        {view === "topics" ? (
          <section className="topic-manager">
            <header className="workspace-header">
              <div>
                <p className="eyebrow">MATERIAŁY DO NAUKI</p>
                <h2>Twoje zagadnienia</h2>
                <p className="manager-description">Dodaj zagadnienia lub materiał, a potem wybierz, czego chcesz się uczyć.</p>
              </div>
              <div className="header-index" aria-hidden="true">
                <span>EDUBOT</span>
                <strong>{String(topics.length).padStart(2, "0")}</strong>
              </div>
            </header>
            <div className="topic-input-panel">
              <TopicInput onAdd={addTopics} />
            </div>
            {topics.length ? (
              <div className="topic-catalog">
                {topics.map((topic, index) => (
                  <article className="topic-entry" key={topic.id}>
                    <span className="topic-entry-index">{String(index + 1).padStart(2, "0")}</span>
                    <div className="topic-entry-main">
                      <h3>{topic.title}</h3>
                      <div className="topic-entry-meta">
                        <span className={`topic-status ${topic.status}`}>
                          <span className="status-dot" />
                          {STATUS_LABELS[topic.status]}
                        </span>
                        {topic.material && <span className="source-note"><span className="source-mark" /> Materiał dodany</span>}
                        {topic.objectives?.length ? <span>{topic.objectives.filter((objective) => objective.completed).length}/{topic.objectives.length} celów</span> : null}
                      </div>
                    </div>
                    <button className="topic-entry-open" onClick={() => {
                      setSelectedId(topic.id);
                      setTab("chat");
                      setPracticeMistake(null);
                      setView("study");
                    }}>
                      Ucz się
                    </button>
                    <button className="remove topic-entry-remove" aria-label={`Usuń temat ${topic.title}`} onClick={() => removeTopic(topic.id)}>
                      ×
                    </button>
                  </article>
                ))}
              </div>
            ) : (
              <div className="catalog-empty">
                <span className="empty-index">01</span>
                <h3>Dodaj pierwszy temat</h3>
                <p>Możesz wpisać zagadnienia, wkleić treść sprawdzianu albo dodać plik z materiałami.</p>
              </div>
            )}
          </section>
        ) : selected ? (
          <>
            {topics.length > 1 && (
              <div className="study-topic-select">
                <label htmlFor="study-topic">Wybierz zagadnienie</label>
                <select
                  id="study-topic"
                  value={selected.id}
                  onChange={(event) => {
                    setSelectedId(event.target.value);
                    setTab("chat");
                    setPracticeMistake(null);
                  }}
                >
                  {topics.map((topic) => <option value={topic.id} key={topic.id}>{topic.title}</option>)}
                </select>
              </div>
            )}
            <header className="workspace-header">
              <div>
                <p className="eyebrow">TWÓJ OBSZAR NAUKI</p>
                <div className="title-row">
                  <h2>{selected.title}</h2>
                  <span className={`topic-status ${selected.status}`}>
                    <span className="status-dot" />
                    {STATUS_LABELS[selected.status]}
                  </span>
                </div>
                {selected.material && (
                  <p className="source-note"><span className="source-mark" /> Materiał źródłowy przypisany do tego tematu</p>
                )}
              </div>
              <div className="header-index" aria-hidden="true">
                <span>EDUBOT</span>
                <strong>{String(topics.findIndex((topic) => topic.id === selected.id) + 1).padStart(2, "0")}</strong>
              </div>
            </header>

            <nav className="tabs" aria-label="Narzędzia nauki">
              {(Object.keys(TAB_LABELS) as Tab[]).map((tabName, index) => (
                <button
                  key={tabName}
                  className={tab === tabName ? "active" : ""}
                  aria-current={tab === tabName ? "page" : undefined}
                  onClick={() => {
                    setTab(tabName);
                    if (tabName === "mistakes") setPracticeMistake(null);
                  }}
                >
                  <span className="tab-index">0{index + 1}</span>
                  {TAB_LABELS[tabName]}
                  {tabName === "mistakes" && selected.mistakes?.length ? (
                    <span className="tab-count">{selected.mistakes.length}</span>
                  ) : null}
                </button>
              ))}
              {selected.status === "mastered" && (
                <button className="reopen-topic" onClick={() => setStatus(selected.id, "learning")}>
                  Cofnij opanowanie
                </button>
              )}
            </nav>

            <div className="workspace-content">
              {tab === "chat" ? (
                <Chat
                  key={selected.id}
                  topic={selected.title}
                  material={selected.material ?? ""}
                  messages={chats[selected.id] ?? []}
                  onChange={(m) => updateChat(selected.id, m)}
                />
              ) : tab === "quiz" ? (
                <Quiz
                  key={selected.id}
                  topic={selected.title}
                  material={selected.material ?? ""}
                  onPassed={() => setStatus(selected.id, "mastered")}
                  onMistakes={(mistakes) => saveMistakes(selected.id, mistakes)}
                />
              ) : tab === "plan" ? (
                <StudyPlan
                  key={selected.id}
                  topic={selected.title}
                  material={selected.material ?? ""}
                  objectives={selected.objectives ?? []}
                  onObjectivesChange={(objectives: LearningObjective[]) => updateTopic(selected.id, { objectives })}
                  schedule={selected.schedule}
                  onScheduleChange={(schedule: ExamSchedule) => updateTopic(selected.id, { schedule })}
                />
              ) : (
                <>
                  <MistakeReview
                    mistakes={selected.mistakes ?? []}
                    onPractice={(mistake) => { setPracticeMistake(mistake); setPracticeMessages([]); }}
                  />
                  {practiceMistake && (
                    <div className="practice-session">
                      <h3>Powtórka: {practiceMistake.question}</h3>
                      <Chat
                        key={`${selected.id}-${practiceMistake.id}`}
                        topic={selected.title}
                        material={selected.material ?? ""}
                        focus={`Uczeń wcześniej odpowiedział: „${practiceMistake.answer}”. Informacja zwrotna była taka: „${practiceMistake.feedback}”. Pomóż mu samodzielnie odkryć błąd, zadając jedno pytanie naprowadzające.`}
                        messages={practiceMessages}
                        onChange={setPracticeMessages}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        ) : (
          <section className="study-empty">
            <p className="eyebrow">TWOJA PRZESTRZEŃ NAUKI</p>
            <h2>Najpierw wybierz zagadnienie</h2>
            <p>Dodaj temat lub materiał w zakładce „Zagadnienia”, a pojawi się tutaj czat, quiz i plan nauki.</p>
            <button onClick={() => setView("topics")}>Przejdź do zagadnień</button>
          </section>
        )}
      </main>
    </div>
  );
}
