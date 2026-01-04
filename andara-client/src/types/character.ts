// Character creation types

export enum Origin {
  VAULT_DWELLER = 'VAULT_DWELLER',
  WASTELANDER = 'WASTELANDER',
  RIFT_TOUCHED = 'RIFT_TOUCHED',
  CARAVAN_GUARD = 'CARAVAN_GUARD',
  SETTLEMENT_MILITIA = 'SETTLEMENT_MILITIA',
  OUTCAST = 'OUTCAST',
}

export interface Attributes {
  strength: number;
  agility: number;
  endurance: number;
  intellect: number;
  perception: number;
  charisma: number;
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  NON_BINARY = 'NON_BINARY',
  OTHER = 'OTHER',
}

export enum BodyType {
  MASCULINE = 'MASCULINE',
  FEMININE = 'FEMININE',
  NEUTRAL = 'NEUTRAL',
}

export enum HairStyle {
  BALD = 'BALD',
  SHORT = 'SHORT',
  MEDIUM = 'MEDIUM',
  LONG = 'LONG',
  MOHAWK = 'MOHAWK',
  BRAIDED = 'BRAIDED',
}

export enum HairColor {
  BLACK = 'BLACK',
  BROWN = 'BROWN',
  BLONDE = 'BLONDE',
  RED = 'RED',
  WHITE = 'WHITE',
  BLUE = 'BLUE',
}

export enum SkinTone {
  PALE = 'PALE',
  FAIR = 'FAIR',
  MEDIUM = 'MEDIUM',
  TAN = 'TAN',
  BROWN = 'BROWN',
  DARK = 'DARK',
}

export enum EyeColor {
  BROWN = 'BROWN',
  BLUE = 'BLUE',
  GREEN = 'GREEN',
  HAZEL = 'HAZEL',
  GRAY = 'GRAY',
  AMBER = 'AMBER',
}

export enum ScarsMarks {
  NONE = 'NONE',
  WEATHERED = 'WEATHERED',
  BATTLE_WORN = 'BATTLE_WORN',
  RIFT_MARKED = 'RIFT_MARKED',
}

export interface Appearance {
  bodyType: BodyType;
  hairStyle: HairStyle;
  hairColor: HairColor;
  skinTone: SkinTone;
  eyeColor: EyeColor;
  ageAppearance: number; // 18-70
  scarsMarks: ScarsMarks;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  description: string;
}

export interface OriginStat {
  label: string;
  value: string;
  type?: 'positive' | 'negative' | 'neutral';
}

export interface OriginDefinition {
  id: string;
  displayName: string;
  description: string;
  icon?: string;
  bonuses?: string[];
  penalties?: string[];
  startingGear?: string;
  factionRelationships?: Record<string, number>;
  specialAbilities?: string[];
  stats?: OriginStat[];
}

export interface CreateCharacterRequest {
  name: string;
  origin: Origin;
  attributes: Attributes;
  skillFocuses: string[]; // Skill IDs
  appearance: Appearance;
  isProtagonist: boolean;
  instanceId: string;
  agentId: string;
}

export interface CharacterResponse {
  characterId: string;
  name: string;
  origin: string;
  attributes: Attributes;
  skills: Record<string, number>;
  appearance: Appearance;
  isProtagonist: boolean;
}

export interface Character {
  characterId: string;
  name: string;
  origin: Origin;
  attributes: Attributes;
  skills: Record<string, number>;
  appearance: Appearance;
  isProtagonist: boolean;
}

