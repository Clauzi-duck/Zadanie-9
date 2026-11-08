import { useRef, useState } from "react";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_MATERIAL_LENGTH = 25000;

interface Props {
  onAdd: (items: { title: string; material?: string }[]) => void;
}

export function TopicInput({ onAdd }: Props) {
  const [text, setText] = useState("");
  const [material, setMaterial] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const submit = async () => {
    setError("");
    const titles = text
      .split("\n")
      .map((l) => l.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "").trim())
      .filter(Boolean);
    const pastedMaterial = material.trim().slice(0, MAX_MATERIAL_LENGTH);
    if (!titles.length && !pastedMaterial && !files.length) return;

    setLoading(true);
    try {
      const items = titles.map((title) => ({ title, material: pastedMaterial || undefined }));
      if (pastedMaterial && !titles.length) {
        const firstLine = pastedMaterial.split("\n").find((line) => line.trim())?.trim() ?? "";
        items.push({ title: firstLine.slice(0, 80) || "Wklejony materiał", material: pastedMaterial });
      }

      const failures: string[] = [];
      for (const file of files) {
        try {
          if (file.size > MAX_FILE_SIZE) throw new Error("plik przekracza limit 10 MB");
          const extension = file.name.split(".").pop()?.toLowerCase();
          let extracted = "";
          if (extension === "txt") {
            extracted = await file.text();
          } else if (extension === "docx") {
            const mammoth = await import("mammoth/mammoth.browser");
            const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
            extracted = result.value;
          } else if (extension === "pdf") {
            const [pdfjsLib, pdfWorker] = await Promise.all([
              import("pdfjs-dist"),
              import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
            ]);
            pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker.default;
            const loadingTask = pdfjsLib.getDocument({ data: await file.arrayBuffer() });
            const document = await loadingTask.promise;
            try {
              if (document.numPages > 120) throw new Error("PDF może mieć maksymalnie 120 stron");
              const pages: string[] = [];
              for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber++) {
                const page = await document.getPage(pageNumber);
                const content = await page.getTextContent();
                pages.push(content.items.map((item) => ("str" in item ? item.str : "")).join(" "));
              }
              extracted = pages.join("\n");
            } finally {
              await loadingTask.destroy();
            }
          } else {
            throw new Error("obsługiwane formaty to PDF, DOCX i TXT");
          }

          extracted = extracted.trim().slice(0, MAX_MATERIAL_LENGTH);
          if (!extracted) throw new Error("nie udało się odczytać tekstu; skany PDF wymagają OCR");
          const title = file.name.replace(/\.[^.]+$/, "").trim().slice(0, 80) || "Materiał z pliku";
          items.push({ title, material: extracted });
        } catch (e) {
          failures.push(`${file.name}: ${e instanceof Error ? e.message : "błąd odczytu"}`);
        }
      }

      if (items.length) {
        onAdd(items);
        setText("");
        setMaterial("");
      }
      setFiles(failures.length ? files.filter((file) => failures.some((failure) => failure.startsWith(`${file.name}:`))) : []);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (failures.length) setError(failures.join("; "));
      else if (!items.length) setError("Dodaj zagadnienie, wklej materiał albo wybierz plik.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card topic-input">
      <div className="topic-input-heading">
        <h3>Dodaj materiał do nauki</h3>
        <p>Wystarczy dodać zagadnienie, wkleić materiał lub wybrać plik. Tytuły pomogą podzielić jeden materiał na kilka tematów.</p>
      </div>

      <div className="topic-field">
        <label htmlFor="topic-titles">Zagadnienia</label>
        <textarea
          id="topic-titles"
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Np. Ułamki zwykłe, dodawanie ułamków"
        />
      </div>

      <div className="topic-field">
        <label htmlFor="topic-material">Treść sprawdzianu lub notatki <span>opcjonalnie</span></label>
        <textarea
          id="topic-material"
          rows={4}
          value={material}
          onChange={(e) => setMaterial(e.target.value)}
          placeholder="Wklej tutaj treść materiału..."
        />
        {text.trim() && material.trim() && (
          <p className="field-help">Ta treść będzie źródłem dla każdego wpisanego wyżej zagadnienia.</p>
        )}
      </div>

      <div className="topic-field">
        <label>Pliki <span>opcjonalnie</span></label>
        <label className="file-picker">
          Wybierz pliki PDF, DOCX lub TXT
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            multiple
            onChange={(e) => {
              const incoming = Array.from(e.currentTarget.files ?? []);
              setFiles((current) => [
                ...current,
                ...incoming.filter((file) => !current.some((item) =>
                  item.name === file.name && item.size === file.size && item.lastModified === file.lastModified,
                )),
              ]);
              e.currentTarget.value = "";
            }}
          />
        </label>
        {files.length > 0 && (
          <div className="selected-files">
            <ul>
              {files.map((file) => (
                <li key={`${file.name}-${file.size}-${file.lastModified}`}>
                  <span>{file.name}</span>
                  <button
                    type="button"
                    className="remove-file"
                    aria-label={`Usuń plik ${file.name}`}
                    title={`Usuń plik ${file.name}`}
                    onClick={() => setFiles((current) => current.filter((item) => item !== file))}
                  >
                    Usuń
                  </button>
                </li>
              ))}
            </ul>
            {files.length > 1 && (
              <button type="button" className="clear-files" onClick={() => setFiles([])}>
                Wyczyść wybrane pliki
              </button>
            )}
          </div>
        )}
        <p className="field-help">Każdy plik utworzy osobny temat. PDF musi zawierać zaznaczalny tekst, nie skan.</p>
      </div>

      {error && <p className="error">{error}</p>}
      <button className="submit-topics" onClick={() => void submit()} disabled={loading || !(text.trim() || material.trim() || files.length)}>
        {loading ? "Odczytuję materiał…" : "Dodaj do nauki"}
      </button>
    </div>
  );
}
