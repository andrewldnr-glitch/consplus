# Analytics & Events — Learn (draft)

> В MVP события можно логировать локально (console/localStorage).  
> Документ — для будущей серверной аналитики (Amplitude/Mixpanel/Firebase).

---

## 1) Event naming

- snake_case
- один event = одно действие пользователя
- параметры — плоские, без PII

---

## 2) Core events (MVP)

### 2.1 App

| Event | When | Props |
|---|---|---|
| `app_open` | приложение открылось | `platform`, `referrer` |
| `splash_shown` | показан splash | `build` |

### 2.2 Onboarding

| Event | When | Props |
|---|---|---|
| `onboarding_view` | показ шага | `step` |
| `goal_selected` | выбрана цель | `goal` |
| `onboarding_complete` | завершено | `goal` |

### 2.3 Navigation

| Event | When | Props |
|---|---|---|
| `nav_tab_click` | клик по bottom nav | `tab` |

### 2.4 Knowledge Base

| Event | When | Props |
|---|---|---|
| `kb_view` | открыт экран KB | `focus_only` |
| `kb_search` | поиск | `query_len`, `focus_only` |
| `kb_open_package` | открыт пакет | `package_id` |
| `kb_switch_variant` | переключен уровень | `package_id`, `variant_id` |
| `share_click` | “скопировать ссылку” | `context` |

### 2.5 Tests

| Event | When | Props |
|---|---|---|
| `tests_view` | открыт хаб тестов | — |
| `test_open` | открыт тест (preview) | `test_id` |
| `test_start` | старт | `test_id`, `question_count` |
| `test_answer` | ответ | `test_id`, `question_id`, `type`, `is_correct` |
| `test_complete` | завершение | `test_id`, `accuracy`, `correct`, `total` |
| `repeat_click` | “пройти ещё раз” | `test_id` |

### 2.6 Premium

| Event | When | Props |
|---|---|---|
| `premium_view` | открыт paywall | `source` |
| `premium_toggle` | включили демо‑premium | `enabled` |

---

## 3) Funnels

### 3.1 Learning funnel

1. `app_open`  
2. `kb_view` or `tests_view`  
3. `kb_open_package`  
4. `test_start`  
5. `test_complete`

### 3.2 Premium funnel (будущее)

1. `premium_view`  
2. `premium_subscribe_click`  
3. `purchase_success`

---

## 4) Metrics (MVP)

- **Test completion rate** = completed / started
- **Accuracy trend** = avg accuracy by day
- **Streak** = consecutive days with ≥1 test
- **Search usage** = kb_search / sessions
