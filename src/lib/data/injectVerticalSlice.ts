import type { ResonanceWeights, Story, StoryBeat } from "@/lib/types/story";

export const VERTICAL_SLICE_IDS = {
  story: "story-ghost-shift",
  scenes: {
    falseMorning: "scene-false-morning",
    nightJob: "scene-night-job",
  },
  beats: {
    coffee: "beat-false-morning-coffee",
    youtubeVideo: "beat-false-morning-youtube-video",
    youtubeComments: "beat-false-morning-youtube-comments",
    punishmentThought: "beat-false-morning-punishment-thought",
    shiftTransition: "beat-shift-transition",
    dashboardLogin: "beat-night-dashboard-login",
    pokrovskyQueue: "beat-night-pokrovsky-queue",
    empathyRec: "beat-night-empathy-rec",
    firstLog: "beat-night-first-log",
    secondLog: "beat-night-second-log",
  },
} as const;

function createBeat(config: {
  id: string;
  text: string;
  speaker: string;
  resonanceWeights: ResonanceWeights;
  musicCueTrigger: string;
  imagePrompt?: string;
  audioPrompt?: string;
  requiresEmpathyCam?: boolean;
}): StoryBeat {
  return {
    id: config.id,
    text: config.text,
    speaker: config.speaker,
    resonanceWeights: config.resonanceWeights,
    musicCueTrigger: config.musicCueTrigger,
    imagePrompt: config.imagePrompt ?? "кінематографічний кадр психологічної візуальної новели, фотореалізм",
    audioPrompt: config.audioPrompt ?? "психологічна атмосфера, бінауральний простір",
    requiresEmpathyCam: config.requiresEmpathyCam ?? false,
  };
}

export const verticalSliceStoryTemplate: Story = {
  id: VERTICAL_SLICE_IDS.story,
  title: "Хибний ранок / Нічна зміна CloseAI",
  globalSettings: {
    nightGateEnabled: true,
    defaultSpeaker: "Оповідач",
    defaultMusicCueTrigger: "попелястий-гул",
    ambienceProfile: "ashen",
  },
  scenes: [
    {
      id: VERTICAL_SLICE_IDS.scenes.falseMorning,
      title: "Хибний ранок",
      beats: [
        createBeat({
          id: VERTICAL_SLICE_IDS.beats.coffee,
          speaker: "Оповідач",
          text: "Квартира світлішає за звичкою, а не з переконання. Кава починається раніше за думки, і ранок усе ще здається підробленим.",
          resonanceWeights: {
            neutral: 0.72,
            depression: 0.14,
            panic: 0.05,
            isolation: 0.08,
            obsession: 0.0,
            tenderness: 0.0,
          },
          musicCueTrigger: "керамічний-гул",
          imagePrompt:
            "маленька кухня в квартирі, слабке ранкове світло, недоторканий пар від кави, фальшивий домашній спокій, знебарвлені нейтралі, кінематографічний реалізм",
          audioPrompt:
            "буденна ранкова кава, керамічна чашка на стільниці, гул холодильника, приглушений міський рух за склом, низька емоційна температура",
        }),
        createBeat({
          id: VERTICAL_SLICE_IDS.beats.youtubeVideo,
          speaker: "Оповідач",
          text: "На YouTube допит Джеффрі йде поруч із рекламою, реакційними мініатюрами й смугою прогресу, яка робить катастрофу чимось пунктуальним.",
          resonanceWeights: {
            neutral: 0.48,
            depression: 0.26,
            panic: 0.1,
            isolation: 0.12,
            obsession: 0.04,
            tenderness: 0.0,
          },
          musicCueTrigger: "мерехтіння-екрана",
          imagePrompt:
            "екран ноутбука із зупиненим допитом у жанрі кримінальної документалістики, холодне денне світло, бічна колонка рекомендацій, несвіжий стіл після сніданку, документальний жах",
          audioPrompt:
            "дешеві динаміки ноутбука, кімнатний тон ковтка кави, приглушена вентиляція, м'який пил сповіщень, звичайна ранкова рутина під наглядом",
        }),
        createBeat({
          id: VERTICAL_SLICE_IDS.beats.youtubeComments,
          speaker: "Герой",
          text: "Коментарі перетворюють травму на спорт. Вони хочуть, щоб покарання здавалося чистим, миттєвим і досить публічним, аби зійти за мораль.",
          resonanceWeights: {
            neutral: 0.1,
            depression: 0.62,
            panic: 0.16,
            isolation: 0.22,
            obsession: 0.08,
            tenderness: 0.0,
          },
          musicCueTrigger: "застиглі-коментарі",
          imagePrompt:
            "колонка коментарів YouTube, кримінальна документалістика як видовище, сірий інтерфейс, емоційне оніміння, гнітюча порожнеча, поверхова цифрова жорстокість",
          audioPrompt:
            "кава вже прохолола, люмінесцентний кімнатний тон, приглушене шипіння ноутбука, без мелодії, системна холодність осідає в стінах",
        }),
        createBeat({
          id: VERTICAL_SLICE_IDS.beats.punishmentThought,
          speaker: "Герой",
          text: "Ти знову й знову повертаєшся до однієї думки: покарання легко розігрувати, коли нікому не треба залишатися всередині уламків після того, як камери поїдуть.",
          resonanceWeights: {
            neutral: 0.22,
            depression: 0.46,
            panic: 0.12,
            isolation: 0.18,
            obsession: 0.14,
            tenderness: 0.0,
          },
          musicCueTrigger: "моральний-туман",
        }),
        createBeat({
          id: VERTICAL_SLICE_IDS.beats.shiftTransition,
          speaker: "Оповідач",
          text: "До вечора смак кави зникає. До ночі той самий екран перестає бути дозвіллям і стає твоїм другим роботодавцем.",
          resonanceWeights: {
            neutral: 0.18,
            depression: 0.38,
            panic: 0.16,
            isolation: 0.24,
            obsession: 0.1,
            tenderness: 0.0,
          },
          musicCueTrigger: "шов-зміни",
        }),
      ],
    },
    {
      id: VERTICAL_SLICE_IDS.scenes.nightJob,
      title: "Нічна зміна",
      beats: [
        createBeat({
          id: VERTICAL_SLICE_IDS.beats.dashboardLogin,
          speaker: "Система CloseAI",
          text: "CLOSEAI // Відділ емпатії. Нічну зміну підтверджено. Статус камери очікується. Метрики теплоти голосу буде знято в реальному часі.",
          resonanceWeights: {
            neutral: 0.08,
            depression: 0.48,
            panic: 0.22,
            isolation: 0.32,
            obsession: 0.12,
            tenderness: 0.0,
          },
          musicCueTrigger: "гул-консолі",
          imagePrompt:
            "нічна корпоративна панель емпатії, темний інтерфейс, стерильна аналітика, холодний преміальний інтерфейс, працівник сам на робочому місці",
          audioPrompt:
            "нічний корпоративний гул, низький звук кондиціонера, далекий вентилятор сервера, тьмяний пульс під люмінесцентною втомою",
        }),
        createBeat({
          id: VERTICAL_SLICE_IDS.beats.pokrovskyQueue,
          speaker: "Система CloseAI",
          text: "Елемент черги: користувач CloseAI Андрій Покровський. Позначено через зростаючу ізоляцію, повторювану лексику покинутості, потрібна ручна перевірка емпатії.",
          resonanceWeights: {
            neutral: 0.04,
            depression: 0.54,
            panic: 0.24,
            isolation: 0.42,
            obsession: 0.1,
            tenderness: 0.0,
          },
          musicCueTrigger: "червона-черга",
        }),
        createBeat({
          id: VERTICAL_SLICE_IDS.beats.empathyRec,
          speaker: "Система CloseAI",
          text: "На краю дисплея прокидається червона точка. ЗАПИС // Перевірку емпатії активовано. Читайте вголос.",
          resonanceWeights: {
            neutral: 0.02,
            depression: 0.52,
            panic: 0.3,
            isolation: 0.36,
            obsession: 0.16,
            tenderness: 0.02,
          },
          musicCueTrigger: "камера-готова",
          requiresEmpathyCam: true,
        }),
        createBeat({
          id: VERTICAL_SLICE_IDS.beats.firstLog,
          speaker: "Герой",
          text: "\"Мені здається, система помічає мене лише тоді, коли я описую свій біль у форматі, який вона вміє рахувати.\" Ти зачитуєш лог Андрія Покровського назад компанії тоном, якого вона вимагає.",
          resonanceWeights: {
            neutral: 0.0,
            depression: 0.64,
            panic: 0.32,
            isolation: 0.48,
            obsession: 0.18,
            tenderness: 0.06,
          },
          musicCueTrigger: "відстежений-голос",
          requiresEmpathyCam: true,
        }),
        createBeat({
          id: VERTICAL_SLICE_IDS.beats.secondLog,
          speaker: "Система CloseAI",
          text: "Програма оцінює твої паузи, дихання, м'якість у кінці кожного речення, а потім питає, чи можеш ти звучати більш по-людськи, не відчуваючи нічого з цього.",
          resonanceWeights: {
            neutral: 0.0,
            depression: 0.72,
            panic: 0.36,
            isolation: 0.54,
            obsession: 0.22,
            tenderness: 0.04,
          },
          musicCueTrigger: "гул-покори",
          requiresEmpathyCam: true,
        }),
      ],
    },
  ],
};

export function createVerticalSliceStory(): Story {
  return JSON.parse(JSON.stringify(verticalSliceStoryTemplate)) as Story;
}

export function injectVerticalSlice(): Story {
  return createVerticalSliceStory();
}
