import type { Message } from "./types";

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

export const chat = (topic: string, messages: Message[], hintLevel: number) =>
  post<{ reply: string }>("/api/chat", { topic, messages, hintLevel });

export const getQuiz = (topic: string) => post<{ questions: string[] }>("/api/quiz", { topic });

export const evaluate = (topic: string, question: string, answer: string) =>
  post<{ correct: boolean; feedback: string }>("/api/evaluate", { topic, question, answer });
