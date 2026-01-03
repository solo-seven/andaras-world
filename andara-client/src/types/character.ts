// Character creation types

export enum Origin {
  VAULT_DWELLER = 'VAULT_DWELLER',
  WASTELANDER = 'WASTELANDER',
  RIFT_TOUCHED = 'RIFT_TOUCHED',
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
  SLENDER = 'SLENDER',
  AVERAGE = 'AVERAGE',
  STOCKY = 'STOCKY',
}

export interface Appearance {
  gender: Gender;
  bodyType: BodyType;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  description: string;
}

export interface OriginDefinition {
  id: string;
  displayName: string;
  description: string;
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

