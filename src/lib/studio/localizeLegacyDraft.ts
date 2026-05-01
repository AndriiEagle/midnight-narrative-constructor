import type { Story, StoryBeat, StoryBeatChoice, StoryScene } from "@/lib/types/story";

const exactTextTranslations = new Map<string, string>([
  ["Narrator", "Оповідач"],
  ["Protagonist", "Герой"],
  ["Voice", "Голос"],
  ["CloseAI System", "Система CloseAI"],
  ["False Morning / CloseAI Night Shift", "Хибний ранок / Нічна зміна CloseAI"],
  ["False Morning", "Хибний ранок"],
  ["The Night Job", "Нічна зміна"],
  ["Midnight Draft", "Нічна чернетка"],
  ["Opening Threshold", "Початковий поріг"],
  ["Untitled Scene", "Сцена без назви"],
  ["A silence waits here.", "Тут чекає тиша."],
  ["New Choice", "Новий вибір"],
  ["hollow-room", "порожня-кімната"],
  ["velvet-hum", "оксамитовий-гул"],
  ["ashen-drone", "попелястий-гул"],
  ["ceramic-hum", "керамічний-гул"],
  ["lcd-flicker", "мерехтіння-екрана"],
  ["comment-freeze", "застиглі-коментарі"],
  ["moral-fog", "моральний-туман"],
  ["shift-seam", "шов-зміни"],
  ["console-drone", "гул-консолі"],
  ["queue-redline", "червона-черга"],
  ["camera-primed", "камера-готова"],
  ["tracked-voice", "відстежений-голос"],
  ["compliance-hum", "гул-покори"],
  ["desaturated apartment corridor, low light, psychological tension", "знебарвлений коридор квартири, тьмяне світло, психологічна напруга"],
  ["low drone, distant ventilation, soft tape hiss, restrained heartbeat", "низький гул, далека вентиляція, легке шипіння стрічки, стримане серцебиття"],
  ["cinematic psychological visual novel frame, photorealistic", "кінематографічний кадр психологічної візуальної новели, фотореалізм"],
  ["psychological ambience, binaural space", "психологічна атмосфера, бінауральний простір"],
  ["The apartment brightens by habit, not by conviction. Coffee starts before thought does, and the morning still feels counterfeit.", "Квартира світлішає за звичкою, а не з переконання. Кава починається раніше за думки, і ранок усе ще здається підробленим."],
  ["small apartment kitchen, weak morning light, untouched coffee steam, false domestic calm, desaturated neutrals, cinematic realism", "маленька кухня в квартирі, слабке ранкове світло, недоторканий пар від кави, фальшивий домашній спокій, знебарвлені нейтралі, кінематографічний реалізм"],
  ["mundane morning coffee, ceramic cup on counter, refrigerator hum, weak city traffic through glass, low emotional temperature", "буденна ранкова кава, керамічна чашка на стільниці, гул холодильника, приглушений міський рух за склом, низька емоційна температура"],
  ["On YouTube, Jeffrey's interrogation plays beside ads, reaction thumbnails, and a progress bar that makes catastrophe look punctual.", "На YouTube допит Джеффрі йде поруч із рекламою, реакційними мініатюрами й смугою прогресу, яка робить катастрофу чимось пунктуальним."],
  ["laptop screen with true crime interrogation paused, cold daylight, recommendation sidebar, stale breakfast table, documentary dread", "екран ноутбука із зупиненим допитом у жанрі кримінальної документалістики, холодне денне світло, бічна колонка рекомендацій, несвіжий стіл після сніданку, документальний жах"],
  ["cheap laptop speakers, coffee sip room tone, muted HVAC, soft notification grit, ordinary morning routine under surveillance", "дешеві динаміки ноутбука, кімнатний тон ковтка кави, приглушена вентиляція, м'який пил сповіщень, звичайна ранкова рутина під наглядом"],
  ["The comments flatten trauma into sport. They want punishment to feel clean, immediate, and public enough to count as morality.", "Коментарі перетворюють травму на спорт. Вони хочуть, щоб покарання здавалося чистим, миттєвим і досить публічним, аби зійти за мораль."],
  ["youtube comment column, true crime spectacle, gray interface bleed, emotional numbness, oppressive emptiness, shallow digital cruelty", "колонка коментарів YouTube, кримінальна документалістика як видовище, сірий інтерфейс, емоційне оніміння, гнітюча порожнеча, поверхова цифрова жорстокість"],
  ["coffee gone lukewarm, fluorescent room tone, deadened laptop hiss, no melody, system coldness settling into the walls", "кава вже прохолола, люмінесцентний кімнатний тон, приглушене шипіння ноутбука, без мелодії, системна холодність осідає в стінах"],
  ["You keep circling the same thought: punishment is easy to perform when nobody has to stay inside the wreckage after the cameras leave.", "Ти знову й знову повертаєшся до однієї думки: покарання легко розігрувати, коли нікому не треба залишатися всередині уламків після того, як камери поїдуть."],
  ["By evening, the coffee taste is gone. By night, the same screen stops being leisure and becomes your other employer.", "До вечора смак кави зникає. До ночі той самий екран перестає бути дозвіллям і стає твоїм другим роботодавцем."],
  ["CLOSEAI // Empathy Operations. Night shift confirmed. Camera status pending. Vocal warmth metrics will be sampled in real time.", "CLOSEAI // Відділ емпатії. Нічну зміну підтверджено. Статус камери очікується. Метрики теплоти голосу буде знято в реальному часі."],
  ["corporate empathy dashboard at night, dark interface, sterile analytics, cold premium UI, employee alone at workstation", "нічна корпоративна панель емпатії, темний інтерфейс, стерильна аналітика, холодний преміальний інтерфейс, працівник сам на робочому місці"],
  ["corporate nighttime hum, low air conditioning drone, distant server fan, dim pulse under fluorescent fatigue", "нічний корпоративний гул, низький звук кондиціонера, далекий вентилятор сервера, тьмяний пульс під люмінесцентною втомою"],
  ["Queue item: CloseAI user Andriy Pokrovsky. Flagged for escalating isolation, recurrent abandonment language, manual empathy verification required.", "Елемент черги: користувач CloseAI Андрій Покровський. Позначено через зростаючу ізоляцію, повторювану лексику покинутості, потрібна ручна перевірка емпатії."],
  ["A red point wakes at the edge of the display. REC // Empathy Verification Active. Read aloud.", "На краю дисплея прокидається червона точка. ЗАПИС // Перевірку емпатії активовано. Читайте вголос."],
  ["\"I think the system only notices me when I describe my pain in a format it can count.\" You read Andriy Pokrovsky's log back to the company in the tone the company requested.", "\"Мені здається, система помічає мене лише тоді, коли я описую свій біль у форматі, який вона вміє рахувати.\" Ти зачитуєш лог Андрія Покровського назад компанії тоном, якого вона вимагає."],
  ["The software scores your pauses, your breath, the softness at the end of each sentence, then asks whether you can sound more human without feeling any of it.", "Програма оцінює твої паузи, дихання, м'якість у кінці кожного речення, а потім питає, чи можеш ти звучати більш по-людськи, не відчуваючи нічого з цього."],
]);

function translateStudioText(value: string): string {
  const exact = exactTextTranslations.get(value);
  if (exact) {
    return exact;
  }

  const sceneMatch = value.match(/^Scene (\d+)$/);
  if (sceneMatch) {
    return `Сцена ${sceneMatch[1]}`;
  }

  return value;
}

function localizeChoice(choice: StoryBeatChoice): StoryBeatChoice {
  return {
    ...choice,
    text: translateStudioText(choice.text),
  };
}

function localizeBeat(beat: StoryBeat): StoryBeat {
  return {
    ...beat,
    text: translateStudioText(beat.text),
    speaker: translateStudioText(beat.speaker),
    musicCueTrigger: translateStudioText(beat.musicCueTrigger),
    imagePrompt: translateStudioText(beat.imagePrompt),
    audioPrompt: translateStudioText(beat.audioPrompt),
    choices: beat.choices?.map(localizeChoice),
  };
}

function localizeScene(scene: StoryScene): StoryScene {
  return {
    ...scene,
    title: translateStudioText(scene.title),
    beats: scene.beats.map(localizeBeat),
  };
}

export function localizeSpeakerRole(value: string): string {
  return translateStudioText(value);
}

export function localizeLegacyEnglishDraft(story: Story): Story {
  return {
    ...story,
    title: translateStudioText(story.title),
    globalSettings: {
      ...story.globalSettings,
      defaultSpeaker: translateStudioText(story.globalSettings.defaultSpeaker),
      defaultMusicCueTrigger: translateStudioText(story.globalSettings.defaultMusicCueTrigger),
    },
    scenes: story.scenes.map(localizeScene),
  };
}
