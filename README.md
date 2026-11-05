# Zadanie-9 – Bot do nauki

Tutor sokratejski (React + TypeScript + Gemini): prowadzi pytaniami i podpowiedziami, nie podaje gotowych rozwiązań.

## Uruchomienie

1. `npm install`
2. Skopiuj `.env.example` do `.env` i wpisz `GEMINI_API_KEY`.
3. `npm run dev` – front na http://localhost:5173, API na porcie 3001.

## Funkcje

- wklejanie listy zagadnień i wybór tematu
- czat z podpowiedziami w 3 poziomach
- quiz sprawdzający wiedzę (zaliczony quiz oznacza temat jako opanowany)
- pasek postępu, zapis w localStorage