interface Props {
  hasTopics: boolean;
  onOpenTopics: () => void;
  onOpenStudy: () => void;
}

const steps = [
  {
    number: "01",
    title: "Dodaj zagadnienie lub materiał",
    description: "W zakładce Zagadnienia możesz wpisać same tematy, wkleić sprawdzian albo wybrać plik PDF, DOCX lub TXT. Nie musisz uzupełniać wszystkich pól.",
    details: [
      "Lista zagadnień podzieli materiał na osobne tematy.",
      "Każdy dodany plik utworzy temat nazwany jego plikiem.",
      "PDF musi zawierać tekst możliwy do zaznaczenia; skany nie są odczytywane.",
    ],
  },
  {
    number: "02",
    title: "Ucz się przez rozmowę",
    description: "W zakładce Nauka tutor zadaje pytania naprowadzające i pomaga samodzielnie dojść do odpowiedzi.",
    details: [
      "Napisz, co już wiesz, albo rozpocznij rozmowę przyciskiem Zacznij.",
      "Przycisk Podpowiedź daje coraz konkretniejsze wskazówki, ale nie gotowe rozwiązanie.",
      "Rozmowa jest zapisywana dla danego tematu w tej przeglądarce.",
    ],
  },
  {
    number: "03",
    title: "Sprawdź, co już umiesz",
    description: "Quiz zawiera zwykle pięć pytań zamkniętych i dwa otwarte. Przy szerszym materiale może być ich więcej.",
    details: [
      "Pytania otwarte mogą prosić o wyjaśnienie, przykład, zastosowanie albo porównanie.",
      "Błędne odpowiedzi zapisują się w zakładce Powtórka błędów.",
      "Wybierz Przećwicz tę trudność, aby wrócić do niej z pomocą tutora.",
    ],
  },
  {
    number: "04",
    title: "Ułóż plan i wracaj do materiału",
    description: "Cele i termin dzieli temat na umiejętności, ustala plan przed sprawdzianem i rozkłada powtórki w czasie.",
    details: [
      "Zaznaczaj cele, które opanowałeś.",
      "Ustaw datę sprawdzianu i czas nauki dziennie.",
      "Quiz oznacza temat jako opanowany, gdy wszystkie odpowiedzi są poprawne.",
    ],
  },
];

export function Help({ hasTopics, onOpenTopics, onOpenStudy }: Props) {
  return (
    <section className="help-page">
      <header className="workspace-header">
        <div>
          <p className="eyebrow">PRZEWODNIK EDUBOT</p>
          <h2>Jak korzystać z Edubota?</h2>
          <p className="manager-description">Od dodania materiału do samodzielnego opanowania tematu.</p>
        </div>
      </header>

      <div className="help-steps">
        {steps.map((step) => (
          <article className="help-step" key={step.number}>
            <span className="help-step-number">{step.number}</span>
            <div className="help-step-content">
              <h3>{step.title}</h3>
              <p>{step.description}</p>
              <ul>
                {step.details.map((detail) => <li key={detail}>{detail}</li>)}
              </ul>
            </div>
          </article>
        ))}
      </div>

      <footer className="help-actions">
        <p>Twoje tematy, rozmowy i postęp są zapisywane lokalnie w tej przeglądarce.</p>
        <div>
          <button className="help-secondary" onClick={onOpenTopics}>Dodaj materiał</button>
          {hasTopics && <button className="help-primary" onClick={onOpenStudy}>Przejdź do nauki</button>}
        </div>
      </footer>
    </section>
  );
}
