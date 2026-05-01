# Midnight Narrative Constructor

Психологічний конструктор візуальних новел з трьома основними режимами:

- ` / `: локальний demo/player на vertical slice.
- ` /studio `: авторська студія для створення, редагування і публікації історій.
- ` /n/[slug] `: публічний архів опублікованої новели.

Нижче не маркетинговий опис, а реальна інструкція під поточний стан коду.

## 1. Що тобі потрібно

Мінімум:

- `Node.js 20+`
- `npm`

Щоб просто подивитися локальний vertical slice:

- нічого, крім `npm install` і `npm run dev`

Щоб працювала нормальна авторська студія з login, publish і архівом:

- `Supabase project`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Щоб працювали AI-функції:

- `OPENAI_API_KEY`

Опційно:

- `NEXT_PUBLIC_NIGHT_GATE_OVERRIDE=true`
  Це прибирає бар'єр Night Gate для швидкого дев-циклу.

## 2. Швидкий запуск

1. Встанови залежності:

```bash
npm install
```

2. Створи `.env.local` у корені проєкту:

```env
OPENAI_API_KEY=your_openai_key_here
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
NEXT_PUBLIC_NIGHT_GATE_OVERRIDE=true
NEXT_PUBLIC_MIDNIGHT_DEV_UNLOCK=true
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

Для тимчасового локального "все відкрито" режиму:

- `NEXT_PUBLIC_MIDNIGHT_DEV_UNLOCK=true` знімає auth-gates з AI route-ів
- `SUPABASE_SERVICE_ROLE_KEY` додатково дає publish у Studio без login

Це тільки для локальної розробки. Не залишай цей режим увімкненим у shared або production середовищі.

3. Запусти dev server:

```bash
npm run dev
```

4. Відкрий:

- [http://localhost:3000](http://localhost:3000) для demo player
- [http://localhost:3000/studio](http://localhost:3000/studio) для авторської студії

## 3. Перед першим publish: база даних

У репо є **дві** SQL-схеми:

- [supabase/auth_rls.sql](/C:/Users/Andrii/Desktop/ВізНовеллаНаТікток/supabase/auth_rls.sql)
- [supabase/schema.sql](/C:/Users/Andrii/Desktop/ВізНовеллаНаТікток/supabase/schema.sql)

Рекомендований варіант для реальної роботи:

- використовуй **тільки** `supabase/auth_rls.sql`

Чому:

- `auth_rls.sql` налаштований як secure-варіант з ownership і RLS
- `schema.sql` досі містить permissive write policies і не повинен бути твоїм production source of truth

Що зробити:

1. Відкрий SQL Editor у Supabase.
2. Запусти вміст [auth_rls.sql](/C:/Users/Andrii/Desktop/ВізНовеллаНаТікток/supabase/auth_rls.sql).
3. Переконайся, що таблиці `novels`, `scenes`, `beats` і функція `save_story_archive` створилися.

Після цього publish з `/studio` працює через authenticated session і RPC-збереження.

## 4. Доступні команди

```bash
npm run dev
npm run typecheck
npm run build
npm run start
```

Що використовувати в роботі:

- `npm run dev`: щоденна розробка
- `npm run typecheck`: швидка перевірка, що ти не поламав типи
- `npm run build`: фінальна правда перед деплоєм

## 5. Як влаштований продукт

### ` / ` — Demo Player

Що це:

- vertical slice, який підтягується з локального seeded story
- найшвидший спосіб перевірити атмосферу, pacing і player runtime

Коли використовувати:

- протестувати емоційний runtime
- подивитися Night Gate, resonance, choice flow
- швидко прогнати demo без Supabase

### ` /studio ` — Authoring Studio

Що тут можна:

- створювати сцени
- створювати та reorder-ити beats
- редагувати текст, speaker, image/audio prompts
- налаштовувати resonance sliders
- застосовувати resonance presets
- додавати branching choices
- вмикати `Player Memory Resonance` на окремих beats
- генерувати beats через AI
- публікувати новелу в Supabase archive

Важливо:

- драфт студії зберігається в `localStorage`
- ключ store: `midnight-constructor-editor-draft`
- це зручно, але це не заміна publish

Практично:

- якщо закрив вкладку, локальний драфт, як правило, залишиться
- якщо чистиш browser storage, драфт зникне
- publish потрібен, щоб отримати стабільний публічний slug

### ` /n/[slug] ` — Public Archive

Що це:

- публічна сторінка вже збереженої історії з Supabase

Умови:

- без Supabase route не відкриється
- для read-only перегляду login не потрібен

## 6. Як взаємодіяти як автор

### Базовий author flow

1. Зайди в `/studio`.
2. Створи сцену або кілька сцен у лівій колонці.
3. Для кожної сцени створи beats.
4. У центрі редагуй текст beat, speaker, image/audio prompts.
5. Праворуч виставляй emotional mix через resonance panel.
6. Якщо потрібна допомога AI, відкрий `Dictate To AI` і генеруй beats для **вибраної** сцени.
7. Якщо потрібні гілки, додай `Choices` і прив'яжи їх до сцен.
8. Якщо потрібна персоналізація, увімкни `Player Memory Resonance` тільки на тих beats, де гравець справді розкриває щось важливе.
9. Після login натисни `Publish To Archive`.
10. Відкрий `/n/[slug]` і перевір публічну версію.

### Що робить кожна ключова зона

Ліва колонка `Scenes & Beats`:

- структура новели
- reorder beats drag-and-drop
- швидке створення сцен і beats

Центр `Selected Beat`:

- сам текст сцени
- branching
- memory resonance config
- image/audio prompt editing

Права колонка `Psychological Weights`:

- режисура емоційного стану
- пресети
- dual view для кожної емоції
- preview того, як beat відчуватиметься для гравця

## 7. Як взаємодіяти як гравець

### Анонімний гравець

Може:

- проходити сцену
- натискати choices
- читати публічну новелу

Не може повноцінно:

- користуватися AI conversation
- користуватися voice input

Що станеться:

- якщо анонімний гравець спробує говорити/писати в AI-driven runtime, система вставить fallback beat:
  `The system is deaf to anonymous voices. Only authorized operators may speak.`

Це не баг. Це поточний security design, щоб не спалювати OpenAI budget.

### Авторизований гравець

Щоб AI-routes реально працювали:

1. Спочатку зайди в `/studio`.
2. Авторизуйся через `Vault Access`.
3. У тій самій browser session відкрий `/n/[slug]` або `/`.

Тоді server-side auth cookies дадуть доступ до:

- `/api/generate`
- `/api/converse`
- `/api/transcribe`
- `/api/memory-resonance`

## 8. Як отримати максимально шедевральний результат

Ось не “надихаючі поради”, а реальна тактика під цей інструмент.

### 1. Не починай з AI. Починай зі spine.

Спочатку руками зроби:

- 3-7 сцен
- назви сцен
- перший beat кожної сцени
- останній beat кожної сцени

Чому:

- цей продукт найсильніший не як pure text generator, а як engine для режисури ритму і стану
- якщо spine слабкий, AI тільки розмаже слабкість красивими словами

### 2. Генеруй AI по сценах, не по всій новелі одразу

Найкращий режим `Dictate To AI`:

- вставляй rough draft однієї сцени
- або 1-3 абзаци outline
- або transcript конкретного епізоду

Не роби:

- 20 сторінок сирого роману в один запит

Чому:

- поточний генератор інжектить beats у **вибрану сцену**
- локально-керований scene-by-scene workflow дає кращий контроль

### 3. Використовуй Presets як старт, не як фінал

Найсильніший pipeline зараз такий:

1. обери resonance preset
2. прочитай dual view
3. дотягни 1-2 ключові слайдери вручну

Наприклад:

- `Bureaucratic Cruelty` як базова posture
- потім трохи знизити `panic`
- трохи підняти `isolation`

Так сцена перестає бути generic preset-demo і стає конкретною.

### 4. Пам'ять вмикай рідко і точно

`Player Memory Resonance` не треба вішати всюди.

Найкраще працює, коли beat справді:

- витягує з гравця зізнання
- примушує зробити моральний вибір
- відкриває страх, сором, потребу в approval

Найкраща практика:

- 1 memory capture на 2-3 сцени
- таргетуй тільки сцени, які реально йдуть далі по драматургії
- використовуй memory key як людську драматургічну змінну, а не як технічний label

Добрі приклади:

- `need-for-witness`
- `obedience-reflex`
- `fear-of-being-seen`
- `hunger-for-permission`

Погані приклади:

- `memory1`
- `choice_data`
- `user_personalization`

### 5. Branching роби емоційним, не лише логічним

Сильна choice-гілка в цій системі працює так:

- кожен вибір не просто веде в іншу сцену
- кожен вибір змінює emotional future

Питання, яке треба собі ставити:

- “Що гравець відчує після цього вибору через 2 сцени?”

Не тільки:

- “Куди цей вибір технічно веде?”

### 6. Audio Prompt не пиши як саундтрек. Пиши як фізичне середовище

Сильний prompt:

- “ventilation, fluorescent hum, restrained static, distant elevator mechanics”

Слабкий prompt:

- “sad cinematic music, creepy vibes”

Чому:

- цей продукт найкраще звучить, коли аудіо відчувається як простір, а не як підкладка

### 7. Тримай beats короткими

Найсильніший beat у цьому engine зазвичай:

- 1-3 речення
- одна дія
- один психічний поворот

Не перевантажуй beat:

- описом
- бекграундом
- поясненням мотивації

Цей runtime краще працює на тиску, а не на багатослів'ї.

### 8. Завжди роби два кола перевірки

Перед publish:

1. Перевір у `/studio`, чи сцени читаються як структура.
2. Перевір у `/n/[slug]` або `/player-test`, чи воно реально “грається”.

Що часто ламається не в коді, а в драматургії:

- занадто довгі beats
- однакова emotional температура у 5 beats поспіль
- memory capture без реального payoff далі
- branching, який логічно розходиться, але емоційно нічим не відрізняється

## 9. Практичні режими роботи

### Режим А: швидкий атмосферний prototype

Підійде, якщо хочеш швидко зібрати proof of concept.

1. `npm run dev`
2. `/studio`
3. 3 сцени
4. по 3-5 beats на сцену
5. пресети + ручна корекція
6. без publish, просто локально

### Режим B: повноцінна авторська сесія

Підійде, якщо хочеш матеріал, який вже можна показувати.

1. Підключи Supabase і OpenAI
2. Авторизуйся в `/studio`
3. Напиши spine руками
4. AI використовуй тільки для scene fill
5. Додай 1-2 branching points
6. Додай 1-2 memory capture points
7. Publish
8. Програй публічний slug

### Режим C: контрольований публічний показ

Підійде, якщо хочеш дати людям посилання.

1. Publish з авторського акаунта
2. Відкривай `/n/[slug]`
3. Розумій, що анонімний player зараз read-first, а не full-AI-first

## 10. Що зараз важливо знати без самообману

Ось поточна правда про продукт:

- студія вже сильна для authoring
- publish/archive працює тільки при нормальному Supabase setup
- AI authoring і AI runtime вимагають authenticated session
- anonymous public player зараз навмисно обмежений для budget security
- черги/background workers для важкого pregen поки немає; це ще не distributed system

Тобто найкращий досвід зараз такий:

- автор працює із login
- публічна новела читається без login
- AI-інтерактивність показується або автору, або контрольовано авторизованому тестеру

## 11. Мінімальний checklist перед тим, як показувати комусь

- `npm run typecheck`
- `npm run build`
- у Supabase застосований `auth_rls.sql`
- login у `/studio` працює
- publish у `/studio` працює
- `/n/[slug]` відкривається
- branching переходить у правильні сцени
- memory resonance увімкнений тільки там, де він справді драматургічно виправданий

## 12. Якщо хочеш працювати зі мною далі

Найефективніші запити для наступних ітерацій:

- “зроби мені production README англійською для GitHub”
- “зроби onboarding doc для автора окремим файлом”
- “зроби checklist для QA перед publish”
- “зроби guide specifically for writers, not developers”
- “зроби environment hardening і .env.example”

Якщо потрібен наступний крок, найрозумніше зараз:

- або я перетворю цей README на чистий GitHub-ready документ англійською
- або зроблю окремий `AUTHOR_PLAYBOOK.md`, уже без технічного сміття, тільки для творчої роботи
