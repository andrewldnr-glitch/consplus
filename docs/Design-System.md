# Design System — Learn (Premium Minimalism)

**Style:** dark + purple gradients + soft glow + card UI (FinancePro-inspired)  
**Target:** mobile-first (Telegram WebView / GitHub Pages)

---

## 1) Brand & Visual Principles

1. **Минимализм**: минимум линий, максимум воздуха.  
2. **Контраст**: читаемость важнее “красоты”.  
3. **Glow**: мягкая подсветка только на интерактивных/акцентных элементах.  
4. **Cards first**: смысловые блоки оформлены карточками.  
5. **Motion**: микро-анимации короткие и спокойные.

---

## 2) Color Tokens

### 2.1 Base

| Token | Value | Usage |
|---|---|---|
| `--bg0` | `#07070c` | фон градиента/самый тёмный |
| `--bg1` | `#0B0B10` | основной фон |
| `--bg2` | `#10101a` | альтернативные области |

### 2.2 Text

| Token | Value | Usage |
|---|---|---|
| `--text` | `rgba(244,247,255,0.92)` | основной текст |
| `--muted` | `rgba(244,247,255,0.66)` | вторичный текст |
| `--faint` | `rgba(244,247,255,0.45)` | подсказки, подписи |

### 2.3 Surfaces

| Token | Value | Usage |
|---|---|---|
| `--card` | `rgba(255,255,255,0.06)` | карточки |
| `--card2` | `rgba(255,255,255,0.04)` | вторичный слой |
| `--stroke` | `rgba(255,255,255,0.12)` | границы |
| `--stroke2` | `rgba(255,255,255,0.08)` | тонкие границы |

### 2.4 Accents

| Token | Value | Usage |
|---|---|---|
| `--accentA` | `#A855F7` | primary accent (purple) |
| `--accentB` | `#6D28D9` | secondary accent (violet) |
| `--accentC` | `#22D3EE` | optional secondary (cyan) |

### 2.5 Semantic

| Token | Value | Usage |
|---|---|---|
| `--good` | `#22C55E` | success/correct |
| `--warn` | `#FBBF24` | warning/wrong selection |
| `--bad` | `#F87171` | error |

---

## 3) Layout Tokens

### 3.1 Radii

| Token | Value |
|---|---|
| `--r-sm` | 12px |
| `--r-md` | 18px |
| `--r-lg` | 24px |
| `--r-xl` | 28px |

### 3.2 Spacing (8pt grid)

| Token | Value |
|---|---|
| `--s-1` | 8px |
| `--s-2` | 12px |
| `--s-3` | 16px |
| `--s-4` | 20px |
| `--s-5` | 24px |
| `--s-6` | 32px |

### 3.3 Shadows & Glow

| Token | Value | Notes |
|---|---|---|
| `--shadow-1` | `0 10px 30px rgba(0,0,0,.40)` | card |
| `--shadow-2` | `0 20px 60px rgba(0,0,0,.55)` | nav |
| `--glow-p` | purple outline + мягкая тень | акцент |

---

## 4) Typography

### 4.1 Выбор шрифтов

**Основной (cross-platform):** `Inter`  
- читаемый, “продуктовый стандарт”, хорошо смотрится в карточных UI.

**Fallback:**
- iOS: SF Pro (системный)
- Android/Windows: system-ui, Roboto, Segoe UI

> В проекте `Inter` подключён через Google Fonts. При необходимости можно заменить на self-hosted.

### 4.2 Шкала

| Style | Size | Weight | Line-height | Usage |
|---|---:|---:|---:|---|
| Display | 30 | 800 | 1.15 | hero, KPI |
| H1 | 22 | 750 | 1.2 | заголовки экранов |
| H2 | 18 | 700 | 1.25 | секции |
| Body | 15 | 500 | 1.35 | основной текст |
| Caption | 12 | 500 | 1.35 | подписи |

### 4.3 Числа

- В идеале: tabular numbers (если будет подключение font-feature-settings).
- Для MVP: аккуратный кернинг, избегать “мелких” чисел на ярком фоне.

---

## 5) Icon System

### 5.1 Библиотеки

- **iOS:** SF Symbols (совместимость с SF Pro, идеальная системность).
- **Cross-platform / Web:** Lucide icons (stroke-based, минимализм).

### 5.2 Размеры

| Context | Size |
|---|---|
| small | 16 |
| default | 20 |
| nav / primary | 24 |

### 5.3 Stroke & Alignment

- stroke: 2px (как в Lucide)
- выравнивание: иконка должна “сидеть” по оптическому центру
- в кнопках: иконка + подпись через 8px

---

## 6) Components

### 6.1 Buttons

**Primary**
- фон: градиент purple
- радиус: 18px
- состояние pressed: translateY(1px), легкое затемнение

**Ghost**
- полупрозрачный фон + тонкая граница

### 6.2 Cards

- фон: `--card`
- граница: `--stroke2`
- hero: добавляет gradient overlay + glow

### 6.3 Inputs

- glass input: `rgba(255,255,255,0.04)`
- focus ring: `rgba(168,85,247,0.15)` (3px)

### 6.4 Tabs

- контейнер: glass + border
- active: gradient + outline

### 6.5 Bottom Navigation

- стеклянная панель с blur
- active: gradient + glow, label появляется на широких экранах

### 6.6 Charts

- минимальная сетка (тонкие линии)
- линия: purple
- точка: белая + фиолетовый glow

---

## 7) States

| Component | Default | Pressed | Disabled | Loading | Error/Success |
|---|---|---|---|---|---|
| Button | градиент | translateY(1px) | opacity 0.5 | (опц.) spinner | toast |
| Option | glass | selected border | disabled | — | correct/wrong |
| Input | stroke | focus ring | disabled | — | border warn/bad |

---

## 8) Accessibility Checklist (Design)

- Контраст текста с фоном ≥ 4.5:1 для body.
- Тап‑таргеты ≥ 44×44.
- `prefers-reduced-motion`.
- Safe area inset для iOS (нижняя панель не перекрывает контент).
