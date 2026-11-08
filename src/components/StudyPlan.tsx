import { useState } from "react";
import { getStudyPlan } from "../api";
import type { ExamSchedule, LearningObjective } from "../types";

interface Props {
  topic: string;
  material: string;
  objectives: LearningObjective[];
  onObjectivesChange: (objectives: LearningObjective[]) => void;
  schedule?: ExamSchedule;
  onScheduleChange: (schedule: ExamSchedule) => void;
}

interface StudyDay {
  date: Date;
  newObjectives: LearningObjective[];
  reviewObjectives: LearningObjective[];
}

function dateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createSchedule(objectives: LearningObjective[], examDate: string, dailyMinutes: number): StudyDay[] {
  if (!objectives.length || !examDate) return [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = new Date(`${examDate}T00:00:00`);
  const dayCount = Math.max(1, Math.floor((deadline.getTime() - today.getTime()) / 86400000) + 1);
  const dates = Array.from({ length: dayCount }, (_, index) => {
    const date = new Date(today);
    date.setDate(date.getDate() + index);
    return { date, newObjectives: [] as LearningObjective[], reviewObjectives: [] as LearningObjective[] };
  });
  const activeObjectives = objectives.filter((objective) => !objective.completed);
  const objectivesToSchedule = activeObjectives.length ? activeObjectives : objectives;
  const capacity = Math.max(1, Math.floor(dailyMinutes / 20));
  const studyDayCount = Math.min(dayCount, Math.ceil(objectivesToSchedule.length / capacity));

  objectivesToSchedule.forEach((objective, index) => {
    const firstDay = Math.floor(index * studyDayCount / objectivesToSchedule.length);
    dates[firstDay].newObjectives.push(objective);
    for (const gap of [1, 3]) {
      const reviewDay = firstDay + gap;
      if (reviewDay < dates.length) dates[reviewDay].reviewObjectives.push(objective);
    }
  });

  return dates.filter((day) => day.newObjectives.length || day.reviewObjectives.length);
}

export function StudyPlan({
  topic,
  material,
  objectives,
  onObjectivesChange,
  schedule,
  onScheduleChange,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [examDate, setExamDate] = useState(schedule?.examDate ?? "");
  const [dailyMinutes, setDailyMinutes] = useState(schedule?.dailyMinutes ?? 30);
  const [savedSchedule, setSavedSchedule] = useState(schedule);

  const generate = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getStudyPlan(topic, material);
      onObjectivesChange(result.objectives.map((objective) => ({
        ...objective,
        id: crypto.randomUUID(),
        completed: false,
      })));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Nie udało się utworzyć planu.");
    } finally {
      setLoading(false);
    }
  };

  const toggleObjective = (id: string) =>
    onObjectivesChange(objectives.map((objective) =>
      objective.id === id ? { ...objective, completed: !objective.completed } : objective,
    ));

  const saveSchedule = () => {
    if (!examDate) {
      setError("Wybierz datę sprawdzianu.");
      return;
    }
    const next = { examDate, dailyMinutes };
    setSavedSchedule(next);
    onScheduleChange(next);
    setError("");
  };

  const days = createSchedule(objectives, savedSchedule?.examDate ?? "", savedSchedule?.dailyMinutes ?? dailyMinutes);
  const completed = objectives.filter((objective) => objective.completed).length;
  const activeCount = objectives.length - completed;
  const capacity = Math.max(1, Math.floor((savedSchedule?.dailyMinutes ?? dailyMinutes) / 20));
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const daysAvailable = savedSchedule?.examDate
    ? Math.max(1, Math.floor((new Date(`${savedSchedule.examDate}T00:00:00`).getTime() - todayDate.getTime()) / 86400000) + 1)
    : 0;
  const today = dateInputValue(todayDate);
  const maxDate = new Date(todayDate);
  maxDate.setDate(maxDate.getDate() + 365);

  return (
    <section className="study-plan">
      <div className="section-heading">
        <div>
          <h3>Cele nauki</h3>
          {objectives.length > 0 && <p className="muted">Opanowane: {completed} z {objectives.length}</p>}
        </div>
        <button onClick={() => void generate()} disabled={loading}>
          {loading ? "Analizuję materiał…" : objectives.length ? "Ułóż plan ponownie" : "Wyodrębnij cele z materiału"}
        </button>
      </div>
      {objectives.length > 0 ? (
        <ul className="objective-list">
          {objectives.map((objective) => (
            <li key={objective.id} className={objective.completed ? "objective completed" : "objective"}>
              <label>
                <input type="checkbox" checked={objective.completed} onChange={() => toggleObjective(objective.id)} />
                <span>
                  <strong>{objective.title}</strong>
                  <small>{objective.description}</small>
                </span>
              </label>
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">Plan podzieli materiał na konkretne umiejętności do opanowania.</p>
      )}

      <div className="schedule-form">
        <h3>Przygotowanie do sprawdzianu</h3>
        <div className="schedule-controls">
          <label>
            Termin
            <input type="date" min={today} max={dateInputValue(maxDate)} value={examDate} onChange={(e) => setExamDate(e.target.value)} />
          </label>
          <label>
            Czas dziennie
            <select value={dailyMinutes} onChange={(e) => setDailyMinutes(Number(e.target.value))}>
              <option value={15}>15 minut</option>
              <option value={30}>30 minut</option>
              <option value={45}>45 minut</option>
              <option value={60}>60 minut</option>
              <option value={90}>90 minut</option>
            </select>
          </label>
          <button onClick={saveSchedule}>Zaplanuj naukę</button>
        </div>
        {savedSchedule && (
          <p className="muted">Cel: około {savedSchedule.dailyMinutes} minut dziennie, maksymalnie {capacity} nowe cele dziennie. Plan uwzględnia powtórki po 1 i 3 dniach.</p>
        )}
      </div>

      {savedSchedule && activeCount > capacity * daysAvailable && (
        <p className="error">Przy tym czasie dziennym materiał może nie zmieścić się przed sprawdzianem. Rozważ wydłużenie sesji albo rozpoczęcie wcześniej.</p>
      )}

      {days.length > 0 && (
        <ol className="schedule-list">
          {days.map((day) => (
            <li key={dateInputValue(day.date)}>
              <time dateTime={dateInputValue(day.date)}>{day.date.toLocaleDateString("pl-PL", { weekday: "short", day: "numeric", month: "short" })}</time>
              {day.newObjectives.length > 0 && <p><b>Nowe:</b> {day.newObjectives.map((objective) => objective.title).join(", ")}</p>}
              {day.reviewObjectives.length > 0 && <p><b>Powtórka:</b> {day.reviewObjectives.map((objective) => objective.title).join(", ")}</p>}
            </li>
          ))}
        </ol>
      )}
      {error && <p className="error">{error}</p>}
    </section>
  );
}
