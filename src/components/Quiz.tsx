import { useState } from "react";
import { evaluate, getQuiz } from "../api";

interface Props {
  topic: string;
  onPassed: () => void;
}

interface Result {
  correct: boolean;
  feedback: string;
}

export function Quiz({ topic, onPassed }: Props) {
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [results, setResults] = useState<(Result | null)[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const start = async () => {
    setLoading(true);
    setError("");
    try {
      const { questions } = await getQuiz(topic);
      setQuestions(questions);
      setAnswers(questions.map(() => ""));
      setResults(questions.map(() => null));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Błąd");
    } finally {
      setLoading(false);
    }
  };

  const check = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await Promise.all(
        questions.map((q, i) =>
          answers[i].trim() ? evaluate(topic, q, answers[i]) : Promise.resolve(null),
        ),
      );
      setResults(res);
      if (res.length && res.every((r) => r?.correct)) onPassed();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Błąd");
    } finally {
      setLoading(false);
    }
  };

  if (questions.length === 0) {
    return (
      <div>
        <button onClick={start} disabled={loading}>
          {loading ? "Generuję…" : "Generuj quiz"}
        </button>
        {error && <p className="error">{error}</p>}
      </div>
    );
  }

  const passed = results.length > 0 && results.every((r) => r?.correct);

  return (
    <div className="quiz">
      {questions.map((q, i) => (
        <div key={i} className="card">
          <p>
            <b>
              {i + 1}. {q}
            </b>
          </p>
          <textarea
            rows={3}
            value={answers[i]}
            onChange={(e) => setAnswers(answers.map((a, j) => (j === i ? e.target.value : a)))}
          />
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
