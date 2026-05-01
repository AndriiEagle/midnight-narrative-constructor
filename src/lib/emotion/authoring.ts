import { EMOTION_PROFILES } from "./profiles";
import type { EmotionId } from "./types";

type EmotionMeaningGuide = {
  summary: string;
  cues: string[];
};

export type EmotionDualView = {
  authorMeaning: EmotionMeaningGuide;
  engineEffect: EmotionMeaningGuide;
};

const AUTHOR_MEANING: Record<EmotionId, EmotionMeaningGuide> = {
  neutral: {
    summary: "Використовуй це, коли сцена має відчуватися зібраною, настороженою і досить відкритою, щоб напругу ніс сам текст.",
    cues: [
      "Утримує момент читабельним, а не штовхає його в бік спецефекту.",
      "Добре працює для підвідних бітів, експозиції під тиском або нервового спокою перед загостренням.",
    ],
  },
  depression: {
    summary: "Використовуй це для важкості, морального виснаження, наслідків і сцен, де персонаж радше спустошений, ніж вибуховий.",
    cues: [
      "Найкраще працює, коли біль осів у кімнаті, а не кричить у бік гравця.",
      "Корисно для оніміння, інституційної холодності й повільного емоційного розпаду.",
    ],
  },
  panic: {
    summary: "Використовуй це, коли контроль ламається, тіло веде сцену, а гравець має відчувати терміновість, а не рефлексію.",
    cues: [
      "Найкраще для сплесків загрози, втрати самовладання або моментів, яким потрібна негайна нервова енергія.",
      "Підіймай це, коли хочеш, щоб сцена відчувалася нестійкою, гострою й важкою для перебування.",
    ],
  },
  isolation: {
    summary: "Використовуй це для дистанції, емоційного відчуження, соціального вакууму й сцен, де до персонажа неможливо дотягнутися.",
    cues: [
      "Працює, коли кімната має відчуватися порожньою, навіть якщо хтось говорить.",
      "Сильне для відчуження, спостереження, покинутості або відстороненого корпоративного тону.",
    ],
  },
  obsession: {
    summary: "Використовуй це для фіксації, тунельного зору, нав'язливості й сцен, де увага стає неприродно вузькою або перегрітою.",
    cues: [
      "Добре працює, коли персонаж не може відпустити думку, предмет, людину або систему.",
      "Використовуй це, щоб сцена відчувалася намагніченою, а не просто напруженою.",
    ],
  },
  tenderness: {
    summary: "Використовуй це для крихкого тепла, оголеної близькості й моментів, де м'якість важлива саме тому, що світ навколо небезпечний.",
    cues: [
      "Найкраще, коли потрібна емоційна відкритість без втрати серйозності.",
      "Корисно для людського зв'язку, милості, зізнання або короткого полегшення всередині темнішого матеріалу.",
    ],
  },
};

function compareTone(value: number, neutral: number, stronger: string, softer: string, threshold: number) {
  if (value >= neutral + threshold) {
    return stronger;
  }

  if (value <= neutral - threshold) {
    return softer;
  }

  return null;
}

function describeTransition(emotionId: EmotionId): string {
  const profile = EMOTION_PROFILES[emotionId];
  const neutralMs = EMOTION_PROFILES.neutral.defaultTransitionMs;

  if (emotionId === "neutral") {
    return `Переходи тримаються близько до базового темпу, приблизно ${profile.defaultTransitionMs} мс, тож сцена дихає без відчутного ривка чи затягування.`;
  }

  if (profile.defaultTransitionMs < neutralMs - 200) {
    return `Переходи стискаються до приблизно ${profile.defaultTransitionMs} мс, тож сцена сідає швидше й відчувається гострішою за нейтральну.`;
  }

  if (profile.defaultTransitionMs > neutralMs + 200) {
    return `Переходи розтягуються до приблизно ${profile.defaultTransitionMs} мс, тож зміни настрою приходять повільніше й лишаються довше, ніж у нейтральному режимі.`;
  }

  return `Переходи лишаються близькими до нейтрального темпу, приблизно ${profile.defaultTransitionMs} мс, тож ефект більше йде від тону, а не від швидкості.`;
}

function describeVisual(emotionId: EmotionId): string {
  const profile = EMOTION_PROFILES[emotionId];
  const neutral = EMOTION_PROFILES.neutral.image;
  const fragments: string[] = [];

  const saturation = compareTone(
    profile.image.saturation,
    neutral.saturation,
    "насиченіший колір",
    "меншу насиченість",
    0.08,
  );
  if (saturation) fragments.push(saturation);

  const brightness = compareTone(
    profile.image.brightness,
    neutral.brightness,
    "світліший кадр",
    "темніший кадр",
    0.05,
  );
  if (brightness) fragments.push(brightness);

  const contrast = compareTone(
    profile.image.contrast,
    neutral.contrast,
    "гостріший контраст",
    "м'якший контраст",
    0.05,
  );
  if (contrast) fragments.push(contrast);

  const blur = compareTone(
    profile.image.blurPx,
    neutral.blurPx,
    "сильніший оптичний блюр",
    "чистіший фокус",
    0.18,
  );
  if (blur) fragments.push(blur);

  const vignette = compareTone(
    profile.image.vignette,
    neutral.vignette,
    "щільнішу віньєтку по краях",
    "відкритіший край кадру",
    0.08,
  );
  if (vignette) fragments.push(vignette);

  if (fragments.length === 0) {
    return "Візуальна обробка лишається близькою до нейтральної, тож біт залишається читабельним і лише злегка стилізованим, а не агресивно обробленим.";
  }

  return `Візуально це зміщується в бік ${fragments.join(", ")}, змінюючи те, наскільки миттєвим, замкненим або оголеним відчувається момент на екрані.`;
}

function describeAudio(emotionId: EmotionId): string {
  const profile = EMOTION_PROFILES[emotionId];
  const neutral = EMOTION_PROFILES.neutral.audio;
  const fragments: string[] = [];

  const gain = compareTone(
    profile.audio.gain,
    neutral.gain,
    "гостріший звуковий край",
    "нижчу й м'якшу подушку",
    0.07,
  );
  if (gain) fragments.push(gain);

  const pitch = compareTone(
    profile.audio.pitchSemitones,
    neutral.pitchSemitones,
    "вищу тональну напругу",
    "нижчу вагу тону",
    0.35,
  );
  if (pitch) fragments.push(pitch);

  const lowpass = compareTone(
    profile.audio.lowpassHz,
    neutral.lowpassHz,
    "більше деталей у верхах",
    "приглушеніший верх",
    1200,
  );
  if (lowpass) fragments.push(lowpass);

  const reverb = compareTone(
    profile.audio.reverbMix,
    neutral.reverbMix,
    "простір, що довше висить",
    "сухіший сигнал",
    0.05,
  );
  if (reverb) fragments.push(reverb);

  if (fragments.length === 0) {
    return "Звук лишається близьким до базової подушки, тож біт читається як присутній і стабільний, а не емоційно оброблений.";
  }

  return `У звуці це зміщується в бік ${fragments.join(", ")}, тож гравець чує зміну настрою, а не лише зчитує її текстом.`;
}

export function getEmotionDualView(emotionId: EmotionId): EmotionDualView {
  return {
    authorMeaning: AUTHOR_MEANING[emotionId],
    engineEffect: {
      summary: describeTransition(emotionId),
      cues: [describeVisual(emotionId), describeAudio(emotionId)],
    },
  };
}
