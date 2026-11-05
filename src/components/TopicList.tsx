import type { Status, Topic } from "../types";

const LABELS: Record<Status, string> = {
  new: "nowy",
  learning: "w trakcie",
  mastered: "opanowany",
};

interface Props {
  topics: Topic[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
}

export function TopicList({ topics, selectedId, onSelect, onRemove }: Props) {
  return (
    <ul className="topics">
      {topics.map((t) => (
        <li key={t.id} className={t.id === selectedId ? "selected" : ""}>
          <button className="topic-btn" onClick={() => onSelect(t.id)}>
            <span>{t.title}</span>
            <small className={`badge ${t.status}`}>{LABELS[t.status]}</small>
          </button>
          <button className="remove" aria-label="Usuń" onClick={() => onRemove(t.id)}>
            ×
          </button>
        </li>
      ))}
    </ul>
  );
}
