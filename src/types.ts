export type Status = "new" | "learning" | "mastered";

export interface Topic {
  id: string;
  title: string;
  status: Status;
  material?: string;
  objectives?: LearningObjective[];
  mistakes?: StudyMistake[];
  schedule?: ExamSchedule;
}

export interface Message {
  role: "user" | "bot";
  text: string;
}

export type QuizQuestion =
  | { type: "choice"; question: string; options: string[]; correctIndex: number }
  | {
      type: "open";
      question: string;
      expectedPoints: string[];
      taskType: "explain" | "example" | "apply" | "compare";
    };

export interface QuizResult {
  correct: boolean;
  feedback: string;
}

export interface LearningObjective {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export interface StudyMistake {
  id: string;
  question: string;
  answer: string;
  feedback: string;
  createdAt: string;
}

export interface ExamSchedule {
  examDate: string;
  dailyMinutes: number;
}
