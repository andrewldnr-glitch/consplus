# Learn — Consultant Plus (Premium Knowledge + Tests)

Static mobile-first app (GitHub Pages / Telegram WebView):  
- **Knowledge Base** по смарт‑комплектам (пакеты → уровни → “что входит”)  
- **Тесты без логических ошибок** (single/multiple + “отличия уровней”)  
- **Статистика** (7 дней, streak)  
- **Премиальный UI** в стиле FinancePro (dark + purple + glow)

---

## 1) Быстрый старт (локально)

1) Скачай репозиторий  
2) Открой `index.html` двойным кликом (или через любой статик-сервер)

Рекомендуемый способ (чтобы hash-router и файлы работали стабильно):

```bash
# (опционально) простой сервер
python -m http.server 8000
# открыть: http://localhost:8000
```

---

## 2) Деплой на GitHub Pages

1) Создай новый репозиторий на GitHub  
2) Залей файлы (папки `data`, `docs` и файлы в корне)  
3) Settings → Pages →  
   - Source: Deploy from a branch  
   - Branch: `main` / root  
4) Открой ссылку GitHub Pages вида `https://<user>.github.io/<repo>/`

---

## 3) Использование в Telegram (Web App)

Вариант A (просто ссылка):
- отправляй ссылку GitHub Pages клиентам/внутри бота

Вариант B (Telegram Web App через BotFather):
- укажи URL как Web App URL  
- приложение откроется внутри Telegram

---

## 4) Где лежит контент

### 4.1 Knowledge Base
`/data/content.js`

Структура:
- `CONTENT.meta`
- `CONTENT.packages[] -> variants[] -> what_includes[]`

### 4.2 Тесты
`/data/tests.js`

- `TEST_CATALOG` — список тестов
- `QUESTION_BANKS` — готовые банки вопросов (например `exam_30`)
- Генераторы тестов работают по текущему `CONTENT`.

---

## 5) Логическая корректность тестов (важно)

Правило:
- если пункт входит в несколько пакетов → вопрос **multiple choice**  
- для однозначности используем тесты “на отличия уровней” (Базовый → Оптимальный)

Документация: `docs/Testing-Engine-Spec.md`

---

## 6) Документация / артефакты

- `docs/PRD.md`
- `docs/KnowledgeBase.md`
- `docs/UI-Spec.md`
- `docs/Design-System.md`
- `docs/Testing-Engine-Spec.md`
- `docs/Analytics-Events.md`
- `docs/QA-Checklist.md`
- `docs/Tech-Spec.md`
- `docs/Roadmap.md`
- `docs/Background-Prompts.md`

---

## 7) Лицензии / библиотеки

- Интерфейс: vanilla HTML/CSS/JS
- Иконки: Lucide-inspired SVG (stroke icons)
- Шрифт: Inter (Google Fonts)
