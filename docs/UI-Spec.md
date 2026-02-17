# UI Spec — Learn (Screens → blocks → states → events)

> Формат: **экран → цель → блоки → состояния → события**  
> Примечание: в MVP “Modules/Courses” = **Пакеты**, “Lessons” = **Уровни смарт‑комплектов**.

---

## Основные экраны

| Экран | Цель | Основные блоки | Состояния | События (events) |
|---|---|---|---|---|
| Splash / Loading (“Learn”) | Премиальный старт + быстрый переход | brand card, shimmer/progress | loading | `app_open`, `splash_shown` |
| Onboarding (1–3) | Донести ценность + выбрать цель | hero, steps, goal picker | step1/2/3 | `onboarding_view`, `goal_selected`, `onboarding_complete` |
| Auth (optional) | Вход (не в MVP) | Apple/Google/Email | loading/error/success | `auth_start`, `auth_success`, `auth_error` |
| Home / Dashboard | Быстрые действия + фокус | hero, KPI, focus list, recommendations | empty history | `home_view`, `nav_tab_click`, `cta_click` |
| Learn / Knowledge Base | Поиск и переход в пакет | search bar, focus toggle, list of packages, glossary link | empty search, no results | `kb_view`, `kb_search`, `kb_toggle_focus`, `kb_open_package` |
| Package / Lesson Viewer | Состав уровня + табы | hero, tabs (base/opt/prof/exp), grouped list, share | loading, empty list | `kb_open_package`, `kb_switch_variant`, `share_click` |
| Tests Hub | Выбрать тест | list of tests, tags, difficulty | empty (no tests) | `tests_view`, `test_open` |
| Test Preview | Понять правила + старт | title/subtitle, meta chips, “Start” | — | `test_open`, `test_start` |
| Test Taking | Ответить на вопросы | progress, question card, options, explain, next | single/multi/matching/fill, error | `test_answer`, `test_next`, `test_abort` |
| Test Results | Итоги + разбор | accuracy, topic breakdown, “repeat”, “to stats”, wrong list | no mistakes | `test_complete`, `result_view`, `repeat_click` |
| Statistics / Progress | Прогресс во времени | hero, 7-day chart, streak, list | empty stats | `stats_view` |
| Profile / Settings | Настройки + docs + premium | goal, reset, premium toggle, docs links | — | `profile_view`, `goal_change`, `reset_progress`, `premium_toggle` |
| Paywall / Premium | Премиум UX (без агрессии) | benefits, plan, restore | — | `premium_view`, `premium_subscribe_click`, `premium_restore_click` |

---

## Empty / Error / Loading states (минимум)

| Ситуация | Где | Как выглядит | Что делаем |
|---|---|---|---|
| Нет истории тестов | Home/Stats | KPI “—”, empty copy | CTA “Пройти тест” |
| Поиск без результатов | Knowledge Base | card с текстом “Ничего не найдено” | предложить примеры запросов |
| Ошибка сохранения | localStorage | toast “Не удалось сохранить” | не блокируем UX |
| Данные отсутствуют | content.js пуст | fallback на Home | показать toast + link на Docs |

---

## UI Quality Bar (must-have)

- Bottom nav **всегда доступен** на главных разделах.
- Deeplink сохраняет контекст (package + variant).
- В тестах: **нет single-choice**, если правильных вариантов несколько.
- Визуально: 1 главный акцентный элемент на экране (hero/CTA), остальное — воздух.
