"use client";

import { create } from "zustand";

import { VERTICAL_SLICE_IDS } from "@/lib/data/injectVerticalSlice";
import type { ResonanceWeights } from "@/lib/types/story";

export type GhostTutorialMode = "ai" | "manual";

export type GhostTutorialStep = {
  id: string;
  label: string;
  targetId: string;
  sceneId?: string;
  beatId?: string;
  rationale: string;
  manualGuidance: string;
  aiGuidance: string;
  aiResonanceWeights?: ResonanceWeights;
  aiAudioPrompt?: string;
};

export const ghostTutorialSteps: GhostTutorialStep[] = [
  {
    id: "false-morning",
    label: "Створи сцену 1: Хибний ранок",
    targetId: "ghost-scene-false-morning",
    sceneId: VERTICAL_SLICE_IDS.scenes.falseMorning,
    beatId: VERTICAL_SLICE_IDS.beats.coffee,
    rationale: "Початок має виглядати домашнім, але емоційно підробленим. Глядач спершу має відчути рутину, а вже потім — шкоду.",
    manualGuidance:
      "Залиш денне світло функціональним, а не втішним. Людський емпат має зробити кавовий ритуал автоматичним, майже канцелярським.",
    aiGuidance:
      "Я б одразу виставив назву сцени, біт із ранковою кавою і слабкий кухонний ритм. Людському редактору залишив би лише таймінг і нюанс.",
  },
  {
    id: "youtube-video",
    label: "Додай біт: відео на YouTube",
    targetId: "ghost-add-beat-false-morning",
    sceneId: VERTICAL_SLICE_IDS.scenes.falseMorning,
    beatId: VERTICAL_SLICE_IDS.beats.youtubeVideo,
    rationale: "Кліп із Джеффрі — це не контент. Це транспорт для морального спостерігання.",
    manualGuidance:
      "Не сенсаціоналізуй злочин. Обрамляй саму платформу: мініатюри, рекламу, ефективну потворність логіки рекомендацій.",
    aiGuidance:
      "Я б зафіксував біт на деталях інтерфейсу: смуга прогресу, бокова колонка, рамка реклами. Конкретика робить систему винною без моралізаторства.",
  },
  {
    id: "youtube-comments",
    label: "Налаштуй резонанс: відраза (для коментарів на YouTube)",
    targetId: "ghost-slider-depression",
    sceneId: VERTICAL_SLICE_IDS.scenes.falseMorning,
    beatId: VERTICAL_SLICE_IDS.beats.youtubeComments,
    rationale: "Саме тут поверхове спостерігання стає температурою системи.",
    manualGuidance:
      "У поточному рушії 'системна холодність' моделюється як висока депресія за низької нейтральності. Штовхай інтерфейс у сірість, а не в мелодраму.",
    aiGuidance:
      "Крок 3: користувач читає поверхові коментарі на YouTube про трагедію. Сильно посунь проксі холодності: депресія 0.62, паніка 0.16, ізоляція 0.22. Дай інтерфейсу стекти в сірість.",
    aiResonanceWeights: {
      neutral: 0.1,
      depression: 0.62,
      panic: 0.16,
      isolation: 0.22,
      obsession: 0.08,
      tenderness: 0.0,
    },
  },
  {
    id: "coffee-audio",
    label: "Згенеруй аудіопромпт: буденна ранкова кава",
    targetId: "ghost-audio-prompt",
    sceneId: VERTICAL_SLICE_IDS.scenes.falseMorning,
    beatId: VERTICAL_SLICE_IDS.beats.coffee,
    rationale: "Ранковий звук має відчуватися процедурно звичайним. Жах народжується з банальності, а не з явного музичного підкреслення.",
    manualGuidance:
      "Напиши аудіопромпт, якому нудно від самого себе: кераміка, вентиляція, рух за склом, жодної романтики в чашці.",
    aiGuidance:
      "Я б описав кімнату як лог відповідності: буденна ранкова кава, керамічна чашка на стільниці, гул холодильника, слабкий міський рух за склом, низька емоційна температура.",
    aiAudioPrompt:
      "буденна ранкова кава, керамічна чашка на стільниці, гул холодильника, слабкий міський рух за склом, низька емоційна температура",
  },
  {
    id: "night-job",
    label: "Створи сцену 2: Нічна зміна",
    targetId: "ghost-scene-night-job",
    sceneId: VERTICAL_SLICE_IDS.scenes.nightJob,
    beatId: VERTICAL_SLICE_IDS.beats.dashboardLogin,
    rationale: "Наративний поворот працює лише тоді, коли друга сцена відчувається не стільки сюжетним твістом, скільки логічним роботодавцем Сцени 1.",
    manualGuidance:
      "Зроби нічний дашборд тією самою моральною машиною, тільки під кращою типографією. Це не новий світ. Це той самий, який просто показав свою зарплатну відомість.",
    aiGuidance:
      "Я б одразу шаблонізував корпоративний шар: CloseAI, відділ емпатії, нічну зміну підтверджено, камера очікується. Точність тривожить сильніше за орнамент.",
  },
  {
    id: "empathy-camera",
    label: "Увімкни механіку: камеру емпатії увімкнено",
    targetId: "ghost-empathy-cam-toggle",
    sceneId: VERTICAL_SLICE_IDS.scenes.nightJob,
    beatId: VERTICAL_SLICE_IDS.beats.empathyRec,
    rationale: "Гравець має відчути нагляд у ту саму мить, коли герой стає вимірюваним інструментом.",
    manualGuidance:
      "Не вмикай камеру надто рано. Увімкни її лише тоді, коли робота перестає бути адміністративною і стає тілесною.",
    aiGuidance:
      "Камера має ввімкнутися на біті із ЗАПИСом і лишитися активною протягом читання логу. Корпоративна емпатія корисна лише тоді, коли її можна аудіювати.",
  },
];

type GhostTutorialStore = {
  isActive: boolean;
  currentStepIndex: number;
  mode: GhostTutorialMode;
  steps: GhostTutorialStep[];
  activate: () => void;
  dismiss: () => void;
  restart: () => void;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (index: number) => void;
  setMode: (mode: GhostTutorialMode) => void;
};

export const useGhostTutorialStore = create<GhostTutorialStore>((set) => ({
  isActive: false,
  currentStepIndex: 0,
  mode: "manual",
  steps: ghostTutorialSteps,
  activate: () => {
    set({ isActive: true });
  },
  dismiss: () => {
    set({ isActive: false });
  },
  restart: () => {
    set({
      isActive: true,
      currentStepIndex: 0,
      mode: "manual",
    });
  },
  nextStep: () => {
    set((state) => ({
      currentStepIndex: Math.min(state.currentStepIndex + 1, state.steps.length - 1),
    }));
  },
  previousStep: () => {
    set((state) => ({
      currentStepIndex: Math.max(state.currentStepIndex - 1, 0),
    }));
  },
  goToStep: (index) => {
    set((state) => ({
      currentStepIndex: Math.min(Math.max(index, 0), state.steps.length - 1),
    }));
  },
  setMode: (mode) => {
    set({ mode });
  },
}));
