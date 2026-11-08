import { useState } from "react";
import type { StudyMistake } from "../types";

interface Props {
  mistakes: StudyMistake[];
  onPractice: (mistake: StudyMistake) => void;
  onResolve: (id: string) => void;
  onReopen: (id: string) => void;
}

export function MistakeReview({ mistakes, onPractice, onResolve, onReopen }: Props) {
  const [showResolved, setShowResolved] = useState(false);

  if (!mistakes.length) {
    return <p className="muted">Po quizie znajdziesz tu pytania, które warto przećwiczyć ponownie.</p>;
  }

  const activeMistakes = mistakes.filter((mistake) => !mistake.resolvedAt);
  const resolvedMistakes = mistakes.filter((mistake) => mistake.resolvedAt);
  const visibleMistakes = showResolved ? resolvedMistakes : activeMistakes;

  return (
    <section className="mistake-list">
      <div className="mistake-review-toolbar">
        <p className="muted">Wybierz trudność, a tutor przeprowadzi Cię przez nią pytaniami bez podawania gotowej odpowiedzi.</p>
        <div className="mistake-filters" role="group" aria-label="Filtr powtórek">
          <button className={!showResolved ? "active" : ""} onClick={() => setShowResolved(false)}>
            Do powtórki <span>{activeMistakes.length}</span>
          </button>
          <button className={showResolved ? "active" : ""} onClick={() => setShowResolved(true)}>
            Opanowane <span>{resolvedMistakes.length}</span>
          </button>
        </div>
      </div>
      {visibleMistakes.length === 0 ? (
        <p className="mistake-empty">
          {showResolved ? "Nie oznaczono jeszcze żadnej trudności jako opanowanej." : "Świetnie, nie masz aktywnych trudności do powtórki."}
        </p>
      ) : visibleMistakes.map((mistake) => (
        <article className="mistake" key={mistake.id}>
          <time dateTime={mistake.createdAt}>{new Date(mistake.createdAt).toLocaleDateString("pl-PL")}</time>
          <h3>{mistake.question}</h3>
          <p><b>Twoja odpowiedź:</b> {mistake.answer}</p>
          <p className="muted">{mistake.feedback}</p>
          <div className="mistake-actions">
            <button className="mistake-practice" onClick={() => onPractice(mistake)}>
              {mistake.resolvedAt ? "Powtórz jeszcze raz" : "Przećwicz tę trudność"}
            </button>
            {mistake.resolvedAt ? (
              <button className="mistake-reopen" onClick={() => onReopen(mistake.id)}>Przywróć do powtórek</button>
            ) : (
              <button className="mistake-resolve" onClick={() => onResolve(mistake.id)}>Umiem już to</button>
            )}
          </div>
        </article>
      ))}
    </section>
  );
}
