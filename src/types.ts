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
