import axios from 'axios';
import type {
  CreateCharacterRequest,
  CharacterResponse,
  OriginDefinition,
  Skill,
} from '../types/character';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

/**
 * Create a new character.
 */
export async function createCharacter(
  data: CreateCharacterRequest
): Promise<CharacterResponse> {
  const response = await axios.post<{ success: boolean; characterId: string }>(
    `${API_BASE_URL}/characters`,
    data
  );
  
  if (!response.data.success) {
    throw new Error('Failed to create character');
  }
  
  // For now, return a basic response - in full implementation, 
  // the API would return the full character
  return {
    characterId: response.data.characterId,
    name: data.name,
    origin: data.origin,
    attributes: data.attributes,
    skills: {},
    appearance: data.appearance,
    isProtagonist: data.isProtagonist,
  };
}

/**
 * Get available character origins.
 */
export async function getOrigins(): Promise<OriginDefinition[]> {
  const response = await axios.get<OriginDefinition[]>(
    `${API_BASE_URL}/characters/origins`
  );
  return response.data;
}

/**
 * Get available skills.
 */
export async function getSkills(): Promise<Skill[]> {
  const response = await axios.get<Skill[]>(
    `${API_BASE_URL}/characters/skills`
  );
  return response.data;
}

/**
 * Get character by ID.
 */
export async function getCharacterById(characterId: string): Promise<any> {
  const response = await axios.get<{ success: boolean; character: any }>(
    `${API_BASE_URL}/characters/${characterId}`
  );
  if (!response.data.success) {
    throw new Error('Failed to fetch character');
  }
  return response.data.character;
}

