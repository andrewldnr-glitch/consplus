# Tech Spec — Learn (MVP)

**Stack:** Vanilla HTML/CSS/JS (static SPA)  
**Deploy:** GitHub Pages  
**Storage:** localStorage (client-only)

---

## 1) Repository structure

```
/
  index.html
  styles.css
  app.js
  /data
    content.js        # knowledge base (packages/variants/items)
    tests.js          # test catalog + question banks
  /docs              # PRD + KB + specs
```

---

## 2) Runtime architecture

### 2.1 Router

- Hash routes (под GitHub Pages):
  - `#/home`, `#/library`, `#/package/:id`, `#/test/:id`, `#/test-run`, `#/test-result`, `#/stats`, `#/profile`, `#/paywall`
- `hashchange` → `render()`

### 2.2 State

Хранение:
- `localStorage['learn_state_v8']`

State (MVP):
- `onboarded: boolean`
- `goal: 'prepare'|'improve'|'practice'|null`
- `premium: boolean` (demo)
- `lastRoute: string`
- `history: Attempt[]`

### 2.3 Data layer

- `CONTENT` — экспортируется в глобальную область из `data/content.js`
- `TEST_CATALOG`, `QUESTION_BANKS` — из `data/tests.js`
- Генераторы:
  - `packageByBank` (single/multi)
  - `upgradeDiff` (single)

---

## 3) Draft API contracts (future)

> Пока API нет, но формат фиксируем заранее — чтобы позже заменить data/*.js на backend.

### 3.1 GET /packages

**Response**
```json
{
  "packages": [
    {
      "id": "consultant_lawyer",
      "name": "СПС Консультант Юрист",
      "audience": "Юрист",
      "variants": [
        {
          "id": "base",
          "docs_count": "112 500",
          "what_includes": ["...", "..."]
        }
      ]
    }
  ]
}
```

### 3.2 GET /tests

**Response**
```json
{
  "tests": [
    { "id":"focus_upgrade", "title":"...", "kind":"generated", "tags":["focus"] }
  ]
}
```

### 3.3 POST /attempts

**Request**
```json
{
  "test_id": "exam_30",
  "started_at": "2026-02-17T10:00:00Z",
  "finished_at": "2026-02-17T10:10:00Z",
  "correct": 24,
  "total": 30,
  "answers": [
    { "question_id":"t1_q1", "picked":["..."], "is_correct":true }
  ]
}
```

---

## 4) Security & Privacy

MVP:
- не используем auth
- не отправляем данные
- сохраняем только прогресс тестов в localStorage

Future:
- auth token (short-lived) + refresh
- минимизация PII
- TLS everywhere
- server-side validation content + attempts

---

## 5) Performance constraints

- списки “что входит” могут быть длинными → используем:
  - простую разметку (без тяжёлых компонентов)
  - минимальные анимации
- blur/backdrop-filter может быть тяжёлым → fallback: прозрачные слои без blur (браузер сам деградирует)

---

## 6) QA hooks

- режим “reset” через профиль
- safe fallback при ошибках localStorage (defaultState)
