export type RoomId = 'room1' | 'room2' | 'room3' | 'room4' | 'corridor';

export type StrictRoomId = 'room1' | 'room2' | 'room3' | 'room4';

export type Direction = 'up' | 'down' | 'left' | 'right';

export type AvatarWingStyle = 'left_classic' | 'right_cyber';

export type ExhibitType = 'image' | 'text' | 'video';

export type VideoPresetId =
  | 'cosmos_wave'
  | 'botanical_wind'
  | 'cyber_matrix'
  | 'clockwork_pulse';

export interface RectBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ExhibitItem {
  id: string;
  roomId: StrictRoomId;
  type: ExhibitType;
  placement: 'wall' | 'pedestal';
  x: number;
  y: number;
  width: number;
  height: number;
   interactRadius: number;
  title: string;
  subtitle: string;
  artist: string;
  year: string;
  medium: string;
  description: string;
  imageUrl?: string;
  textContent?: {
    leadQuote: string;
    paragraphs: string[];
    curatorNote: string;
  };
  videoPreset?: VideoPresetId;
  customVideoUrl?: string;
  isCustomized?: boolean;
  lastModified?: string;
  frameColor: string;
  accentColor: string;
}

export interface NPCPalette {
  skin: string;
  hair: string;
  top: string;
  bottom: string;
  accent: string;
}

export interface QuizChoice {
  text: string;
  response: string;
  isCorrect: boolean;
}

export interface NPCEntity {
  id: string;
  roomId: StrictRoomId;
  name: string;
  role: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
  direction: Direction;
  state: 'walking' | 'pausing' | 'talking';
  stateTimer: number;
  talkTimer: number;
  dialoguePages: string[];
  currentPageIndex: number;
  typewriterCharCount: number;
  dialogue: string;
  secondaryDialogues: string[];
  dialogueIndex: number;
  palette: NPCPalette;
  animFrame: number;
  isGhost?: boolean;
  isStationary?: boolean;
  isChild?: boolean;
  quiz?: {
    question: string;
    choices: QuizChoice[];
    selectedChoiceIndex: number | null;
  };
  hasTalked: boolean;
}

export interface DoorEntity {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  orientation: 'vertical' | 'horizontal';
  connects: [RoomId, RoomId];
  openProgress: number; // 0 = closed, 1 = open
}

export interface RoomConfig {
  id: StrictRoomId;
  roomNumber: 1 | 2 | 3 | 4;
  name: string;
  englishName: string;
  wing: 'left' | 'right';
  subtitle: string;
  bounds: RectBox;
  innerBounds: RectBox; // Walkable interior bounds
  floorPrimary: string;
  floorSecondary: string;
  wallTopColor: string;
  wallFaceColor: string;
  accentColor: string;
  ambientLightColor: string;
}

export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
  direction: Direction;
  isMoving: boolean;
  wingStyle: AvatarWingStyle;
  currentRoom: RoomId;
  animTime: number;
  transformFlashTimer: number;
}
