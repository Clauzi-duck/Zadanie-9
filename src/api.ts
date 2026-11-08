import type { Message, QuizQuestion, QuizResult } from "./types";

async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Błąd serwera");
  return data as T;
}

export const chat = (
  topic: string,
  material: string,
  messages: Message[],
  hintLevel: number,
  focus = "",
) => post<{ reply: string }>("/api/chat", { topic, material, messages, hintLevel, focus });

export const getStudyPlan = (topic: string, material: string) =>
  post<{ objectives: { title: string; description: string }[] }>("/api/plan", { topic, material });

export const getQuiz = (topic: string, material: string) =>
  post<{ questions: QuizQuestion[] }>("/api/quiz", { topic, material });

export const evaluate = (topic: string, question: string, answer: string) =>
  post<QuizResult>("/api/evaluate", { topic, question, answer });

export const evaluateOpen = (
  topic: string,
  material: string,
  question: string,
  answer: string,
  expectedPoints: string[],
) => post<QuizResult>("/api/evaluate", { topic, material, question, answer, expectedPoints });
