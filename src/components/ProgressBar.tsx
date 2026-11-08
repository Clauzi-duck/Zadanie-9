import type { Topic } from "../types";

export function ProgressBar({ topics }: { topics: Topic[] }) {
  const done = topics.filter((t) => t.status === "mastered").length;
  const pct = topics.length ? Math.round((done / topics.length) * 100) : 0;

  return (
    <div className="progress">
      <div className="progress-label">
        <span>Postęp nauki</span>
        <span>{pct}%</span>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-label="Ukończone tematy"
        aria-valuemin={0}
        aria-valuemax={topics.length}
        aria-valuenow={done}
      >
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <p className="progress-summary">{done} z {topics.length} tematów opanowanych</p>
    </div>
  );
}
