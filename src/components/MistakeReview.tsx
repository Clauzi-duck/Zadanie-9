import type { StudyMistake } from "../types";

interface Props {
  mistakes: StudyMistake[];
  onPractice: (mistake: StudyMistake) => void;
}

export function MistakeReview({ mistakes, onPractice }: Props) {
  if (!mistakes.length) {
    return <p className="muted">Po quizie znajdziesz tu pytania, które warto przećwiczyć ponownie.</p>;
  }

  return (
    <section className="mistake-list">
      <p className="muted">Wybierz trudność, a tutor przeprowadzi Cię przez nią pytaniami bez podawania gotowej odpowiedzi.</p>
      {mistakes.map((mistake) => (
        <article className="mistake" key={mistake.id}>
          <time dateTime={mistake.createdAt}>{new Date(mistake.createdAt).toLocaleDateString("pl-PL")}</time>
          <h3>{mistake.question}</h3>
          <p><b>Twoja odpowiedź:</b> {mistake.answer}</p>
          <p className="muted">{mistake.feedback}</p>
          <button onClick={() => onPractice(mistake)}>Przećwicz tę trudność</button>
        </article>
      ))}
    </section>
  );
}
