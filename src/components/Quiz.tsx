import { useState } from "react";
import { evaluateOpen, getQuiz } from "../api";
import type { QuizQuestion, QuizResult, StudyMistake } from "../types";

interface Props {
  topic: string;
  material: string;
  onPassed: () => void;
  onMistakes: (mistakes: Omit<StudyMistake, "id" | "createdAt">[]) => void;
}

export function Quiz({ topic, material, onPassed, onMistakes }: Props) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [results, setResults] = useState<(QuizResult | null)[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const start = async () => {
    setLoading(true);
    setError("");
    try {
      const { questions } = await getQuiz(topic, material);
      setQuestions(questions);
      setAnswers(questions.map(() => ""));
      setResults(questions.map(() => null));
      if (questions.length === 0) setError("Nie udało się przygotować pytań. Spróbuj ponownie.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Błąd");
    } finally {
      setLoading(false);
    }
  };

  const check = async () => {
    if (answers.some((answer) => !answer.trim())) {
      setError("Odpowiedz na wszystkie pytania przed sprawdzeniem quizu.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await Promise.all(
        questions.map((q, i) => q.type === "choice"
          ? Promise.resolve({
              correct: Number(answers[i]) === q.correctIndex,
              feedback: Number(answers[i]) === q.correctIndex
                ? "Dobrze!"
                : "Nie tym razem. Przemyśl temat i spróbuj ponownie.",
            })
          : evaluateOpen(topic, material, q.question, answers[i], q.expectedPoints)),
      );
      setResults(res);
      onMistakes(
        res.flatMap((result, index) => {
          if (!result || result.correct) return [];
          const question = questions[index];
          return [{
            question: question.question,
            answer: question.type === "choice"
              ? question.options[Number(answers[index])] ?? "Brak odpowiedzi"
              : answers[index],
            feedback: result.feedback,
          }];
        }),
      );
      if (res.length && res.every((r) => r?.correct)) onPassed();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Błąd");
    } finally {
      setLoading(false);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="quiz-empty">
        <h3>Sprawdź, co już wiesz</h3>
        <p>Krótki quiz pomoże Ci utrwalić temat i wskazać zagadnienia warte powtórki.</p>
        <button onClick={start} disabled={loading}>
          {loading ? "Generuję…" : "Generuj quiz"}
        </button>
        {error && <p className="error">{error}</p>}
      </div>
    );
  }

  const passed = results.length > 0 && results.every((r) => r?.correct);
  const choiceCount = questions.filter((q) => q.type === "choice").length;
  const openCount = questions.length - choiceCount;

  return (
    <div className="quiz">
      <p className="muted">{choiceCount} pytań zamkniętych · {openCount} otwartych</p>
      {questions.map((q, i) => (
        <div key={i} className="card">
          <p>
            <b>
              {i + 1}. {q.question}
            </b>
          </p>
          {q.type === "choice" ? (
            <div className="choices">
              {q.options.map((option, optionIndex) => (
                <label key={optionIndex} className="choice">
                  <input
                    type="radio"
                    name={`question-${i}`}
                    checked={answers[i] === String(optionIndex)}
                    onChange={() => setAnswers(answers.map((a, j) => (j === i ? String(optionIndex) : a)))}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          ) : (
            <>
              <p className="muted">{{
                explain: "Wyjaśnij własnymi słowami",
                example: "Podaj własny przykład",
                apply: "Zastosuj wiedzę w nowej sytuacji",
                compare: "Porównaj i wskaż różnice",
              }[q.taskType]}</p>
              <textarea
                rows={3}
                value={answers[i]}
                onChange={(e) => setAnswers(answers.map((a, j) => (j === i ? e.target.value : a)))}
                placeholder="Napisz własnymi słowami"
              />
            </>
          )}
          {results[i] && (
            <p className={results[i]!.correct ? "ok" : "error"}>{results[i]!.feedback}</p>
          )}
        </div>
      ))}
      <div className="row">
        <button onClick={check} disabled={loading}>
          {loading ? "Sprawdzam…" : "Sprawdź"}
        </button>
        <button onClick={start} disabled={loading}>
          Nowy quiz
        </button>
      </div>
      {passed && <p className="ok">Quiz zaliczony – temat oznaczony jako opanowany.</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
