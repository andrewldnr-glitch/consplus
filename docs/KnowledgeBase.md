# Learn — Knowledge Base (PM/UX/Tech/QA/Content)

> **Reference style:** “FinancePro” — premium minimalism, dark UI, purple gradients, soft glow accents, card-based layouts, bottom navigation.  
> **Domain:** обучение и тестирование по пакетным предложениям КонсультантПлюс.  
> **Источник состава пакетов:** «ИНФОРМАЦИОННОЕ СОДЕРЖАНИЕ (Смарты_ИЮНЬ_2025г.)».

---

## Оглавление

1. [Product Overview](#1-product-overview)  
2. [Information Architecture](#2-information-architecture)  
3. [User Flows](#3-user-flows)  
4. [Design System](#4-design-system)  
5. [Content System](#5-content-system)  
6. [Testing Engine Spec](#6-testing-engine-spec)  
7. [Analytics & Events](#7-analytics--events)  
8. [QA Checklist](#8-qa-checklist)  
9. [Tech Spec](#9-tech-spec)  
10. [Roadmap](#10-roadmap)  
11. [Appendix](#11-appendix)

---

## 1) Product Overview

### 1.1 Позиционирование

**Learn** — премиальное “мини‑приложение” для обучения и тестов:  
- **Knowledge Base:** быстро посмотреть состав пакета/уровня.  
- **Tests:** закрепить знания на логически корректных вопросах.  
- **Stats:** видеть прогресс, точность и streak.

**Ключевой UX‑принцип:** “Сначала важное” — подсветка и быстрый доступ к **Базовый** и **Оптимальный**.

### 1.2 Аудитория

- консультанты/менеджеры, которые продают/объясняют пакеты;  
- новые сотрудники на онбординге;  
- специалисты, повышающие точность ответов.

### 1.3 JTBD

- Быстро найти пакет и перечислить состав для ответа клиенту.  
- Уверенно объяснить отличие уровней (Базовый vs Оптимальный vs Проф vs Эксперт).  
- Регулярно тренироваться и видеть прогресс.

### 1.4 Основные сценарии (core loops)

**Loop A: knowledge → test → result → repeat**
1) Пользователь открывает базу →  
2) изучает пакет/уровень →  
3) проходит тест →  
4) получает разбор →  
5) повторяет слабые темы.

**Loop B: quick answer**
1) Поиск по банку (“ФАС”, “закупок”, “путеводитель”) →  
2) открыть пакет/уровень →  
3) скопировать/перешарить ссылку.

### 1.5 Принципы продукта

- Premium minimalism (темнота, воздух, фокус, glow‑акценты).
- “No logical traps” в тестах.
- Быстрые переходы, но без тяжёлых эффектов.

### 1.6 Scope MVP

В MVP обязательно:
- Splash → Onboarding → Home/Dashboard
- Knowledge Base (поиск, пакеты, уровни, состав)
- Tests Hub → Test Taking → Results
- Stats/Progress (график + streak)
- Profile/Settings + Paywall (демо)
- Empty/Error/Loading states (минимально)

### 1.7 Assumptions

- Контент обновляется через файл `data/content.js` (из docx).  
- “Premium” — UX‑экран (без платежей) до появления backend.  
- Язык: RU (на будущее i18n).

---

## 2) Information Architecture

### 2.1 Карта разделов

**Bottom nav (5):**
1. **Home** — дашборд, фокус, быстрые действия  
2. **Learn** — база знаний (пакеты + поиск)  
3. **Tests** — список тестов  
4. **Stats** — прогресс, график, streak  
5. **Profile** — настройки, docs, premium

**Deeplinks (hash routes):**
- `#/package/:id?v=base|optimal|prof|expert`  
- `#/library?search=...&focus=1`  
- `#/test/:id` → `#/test-run` → `#/test-result`

### 2.2 Сущности данных

| Entity | Описание | Пример полей |
|---|---|---|
| Package | Пакет под аудиторию | `id`, `name`, `audience`, `variants[]` |
| Variant | Уровень смарт‑комплекта | `id`(base/optimal/...), `docs_count`, `what_includes[]`, `priority` |
| KnowledgeItem | Пункт состава | `text`, `category` (derived) |
| Test | Описание теста | `id`, `title`, `kind`, `generator/bank`, `tags` |
| Question | Вопрос | `type`, `prompt`, `options`, `answer`, `explanation`, `ref` |
| Attempt | Результат прохождения | `date`, `testId`, `correct/total`, `accuracy` |

### 2.3 Навигация и приоритеты

- **Priority levels**: базовый/оптимальный помечаются как **focus** и показываются раньше.
- Внутри пакета — табы уровней. По умолчанию открывается **Базовый**.

---

## 3) User Flows

### 3.1 Splash / Loading

- Визуально: карточка, glow, shimmer‑progress.
- Автопереход:
  - если `onboarded=true` → lastRoute / Home
  - иначе → Onboarding

### 3.2 Onboarding (1–3 экрана)

1) Ценность: “Knowledge + Tests”  
2) Фокус: базовый/оптимальный  
3) Выбор цели: подготовка / улучшить знания / практика

**События:** `onboarding_view`, `goal_selected`, `onboarding_complete`.

### 3.3 Home / Dashboard

- Hero карточка: краткое описание
- KPI: последний результат, число сессий
- CTA: “фокус‑тест”, “открыть базу”
- Секция “Фокус” — список пакетов с подсвеченными уровнями

### 3.4 Knowledge Base (Learn)

- Search input + кнопка
- Toggle: focus only / all levels
- Список пакетов карточками
- Переход в пакет → вкладки уровней → список “что входит”
- Возможность поделиться deeplink

### 3.5 Package Detail (Lesson Viewer)

- Табы уровней
- Плашка Focus/Дополнительно
- Docs_count
- “Что входит” сгруппировано по категориям (derived rules)
- CTA: тест по отличиям уровней

### 3.6 Tests Hub

- список тестов
- каждый тест: title, subtitle, difficulty, tags
- экран превью теста → Start

### 3.7 Test Taking

- Прогресс бар + счётчик (N/Total)
- Типы вопросов: single/multiple/boolean/matching/ordering/fill
- Фидбек:
  - single/boolean — сразу после выбора
  - multi/matching/ordering/fill — после кнопки “Проверить”
- Пояснение + “Дальше”

### 3.8 Test Results

- % точности
- Верно/ошибок
- Разбивка по темам
- “Что повторить” (deeplink на материал)
- CTA: “ещё раз”, “статистика”

### 3.9 Statistics / Progress

- streak
- график точности за 7 дней
- список дней с точностью/—  

### 3.10 Profile / Settings

- цель пользователя
- reset progress
- Premium demo toggle + Paywall screen
- Docs links (PRD, KB, Design System, Testing spec, QA)

---

## 4) Design System

> Полная версия: **/docs/Design-System.md** (токены + компоненты + состояния).

### 4.1 Токены (основные)

**Colors**
- Background: `#07070c`, `#0B0B10`
- Text: `rgba(244,247,255,0.92)`
- Muted: `rgba(244,247,255,0.66)`
- Card: `rgba(255,255,255,0.06)`
- Stroke: `rgba(255,255,255,0.12)`
- Accent: `#A855F7` / `#6D28D9`

**Radii**
- sm 12 / md 18 / lg 24 / xl 28

**Shadows**
- card: `0 10px 30px rgba(0,0,0,.40)`
- glow: purple outline + мягкая тень

### 4.2 Компоненты

- Buttons: primary / ghost
- Cards: base / hero
- Input: glass input
- Chips: neutral / focus / accent
- Tabs: variant selector
- Bottom nav: glass bar + active gradient
- Toast
- Progress bar
- Question option (states: selected/correct/wrong)

### 4.3 Состояния (минимум)

| Component | States |
|---|---|
| Button | default / pressed / disabled |
| Card | default / highlighted |
| Option | default / selected / correct / wrong / disabled |
| Input | default / focus / error |
| Loading | shimmer / skeleton |
| Error | toast + empty state |

### 4.4 Accessibility

- Контраст: текст на dark должен быть ≥ WCAG AA (целимся на 4.5:1 для body).
- Touch targets ≥ 44×44 px.
- `prefers-reduced-motion`: отключаем интенсивные анимации.
- Safe area: `viewport-fit=cover` + `env(safe-area-*)`.

---

## 5) Content System

### 5.1 Tone of voice

- профессионально, коротко, без канцелярита  
- “помогаем учиться”, не “наказываем за ошибку”  
- ошибки: “Есть ошибка — давай разберём” вместо “Неверно”

### 5.2 Правила микрокопи

- Заголовки: 1 строка, действие/смысл.
- Подзаголовок: максимум 2 строки, зачем это.
- В тестах избегаем:
  - “часто/иногда” без условий
  - двойных отрицаний
  - “все вышеперечисленное”
- Вопрос должен проверять **один критерий** правильности.

### 5.3 Форматирование базы знаний

- “Что входит” — списки, сгруппированные по категории.
- Длинные пункты допускаются, но:
  - не более 2–3 строк на экран без необходимости
  - при необходимости используем переносы и аккуратный line-height

---

## 6) Testing Engine Spec

> Полная версия: **/docs/Testing-Engine-Spec.md** (правила, алгоритмы, примеры контента).

### 6.1 Типы вопросов (минимум)

1) Single choice  
2) Multiple choice  
3) True/False (boolean)  
4) Matching  
5) Ordering  
6) Fill-in-the-blank

### 6.2 Контент‑валидация (анти‑логические ошибки)

**Правила качества:**
- Если правильных вариантов > 1 → вопрос **не может быть single choice**.  
- Для multiple-choice:
  - количество correct не больше 3–4 (иначе вопрос тяжёлый/плохой)  
- Дистракторы:
  - правдоподобны, но однозначно неверны
- Формулировка:
  - без “зависит”
  - без терминов, которых нет в базе знаний

### 6.3 Скоринг

- base score: 1 балл за вопрос
- точность: correct / total
- topic accuracy: по `topic` / `tags`

### 6.4 Результаты и рекомендации

- показываем объяснение + deeplink на материал
- секция “что повторить” строится по неправильным ответам

### 6.5 Рандомизация и защита от заучивания

- pool вопросов → случайная выборка `N`
- shuffle вариантов ответа
- режим “ещё раз” генерирует новый набор (для generated tests)

---

## 7) Analytics & Events

> Полная версия: **/docs/Analytics-Events.md**.

Минимальный список событий:
- `app_open`
- `onboarding_view`, `goal_selected`, `onboarding_complete`
- `nav_tab_click`
- `kb_search`, `kb_open_package`, `kb_switch_variant`
- `test_open`, `test_start`, `test_answer`, `test_complete`
- `premium_view`, `premium_toggle`

Метрики:
- completion rate тестов
- accuracy trend
- time-to-first-answer (KB)
- streak

---

## 8) QA Checklist

> Полная версия: **/docs/QA-Checklist.md**.

Smoke ядро:
- загрузка (splash → home/onboarding)
- навигация bottom nav
- KB поиск и открытие пакета
- тест: single + multiple + results
- статистика рисуется, не ломается
- deeplink открывается корректно

---

## 9) Tech Spec

> Полная версия: **/docs/Tech-Spec.md**.

### 9.1 Архитектура MVP

- Static SPA на чистом HTML/CSS/JS  
- Hash routing для GitHub Pages
- Data layer: `data/content.js`, `data/tests.js`
- Persist: `localStorage` (`learn_state_v8`)

### 9.2 Модули

- router
- screens (home/library/package/tests/stats/profile)
- test engine (renderers by question type)
- analytics (local, future-ready)

### 9.3 Модели данных (черновик)

```ts
type Package = {
  id: string;
  name: string;
  audience?: string;
  variants: Variant[];
}

type Variant = {
  id: 'base'|'optimal'|'prof'|'expert'|'other';
  name: string;
  priority: 'high'|'normal';
  docs_count?: string;
  what_includes: string[];
}

type Test = {
  id: string;
  title: string;
  kind: 'generated'|'bank';
  generator?: 'packageByBank'|'upgradeDiff';
  bank?: string;
  settings?: any;
  tags?: string[];
}
```

### 9.4 Безопасность/приватность

- нет передачи данных на сервер
- localStorage можно очистить в профиле
- для будущего backend:
  - токены, шифрование, минимизация PII

---

## 10) Roadmap

### MVP (сейчас)
- Premium UI + KB + Tests + Results + Stats
- Документация (docs)

### v1
- рекомендации по слабым темам
- расширение question pool
- режим “экзамен” с временем/попытками
- экспорт результатов

### v2
- аккаунт и синхронизация
- полноценный premium (платежи)
- контент-редактор и CMS

---

## 11) Appendix

- Background prompts: **/docs/Background-Prompts.md**
- Шрифты/иконки: **/docs/Design-System.md**
