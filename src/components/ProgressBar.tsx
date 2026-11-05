import type { Topic } from "../types";

export function ProgressBar({ topics }: { topics: Topic[] }) {
  const done = topics.filter((t) => t.status === "mastered").length;
  const pct = topics.length ? Math.round((done / topics.length) * 100) : 0;

  return (
    <div className="progress">
      <div className="progress-label">
        Postęp: {done}/{topics.length} ({pct}%)
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
