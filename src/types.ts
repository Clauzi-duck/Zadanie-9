export type Status = "new" | "learning" | "mastered";

export interface Topic {
  id: string;
  title: string;
  status: Status;
}

export interface Message {
  role: "user" | "bot";
  text: string;
}

export type QuizQuestion =
  | { type: "choice"; question: string; options: string[]; correctIndex: number }
  | { type: "open"; question: string; expectedPoints: string[] };

export interface QuizResult {
  correct: boolean;
  feedback: string;
}
