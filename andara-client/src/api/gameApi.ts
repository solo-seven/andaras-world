import axios from 'axios';
import type {
  Origin,
  Attributes,
  Appearance,
} from '../types/character';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

export interface StartNewGameRequest {
  name: string;
  origin: Origin;
  attributes: Attributes;
  skillFocuses: string[];
  appearance: Appearance;
}

export interface StartNewGameResponse {
  success: boolean;
  instanceId: string;
  partyId: string;
  characterId: string;
  error?: string;
}

/**
 * Start a new game instance with character creation.
 * POST /api/v1/game/start
 */
export async function startNewGame(
  data: StartNewGameRequest
): Promise<StartNewGameResponse> {
  try {
    const response = await axios.post<{
      success: boolean;
      instanceId: string;
      partyId: string;
      characterId: string;
    }>(`${API_BASE_URL}/game/start`, {
      name: data.name,
      origin: data.origin,
      attributes: {
        strength: data.attributes.strength,
        agility: data.attributes.agility,
        endurance: data.attributes.endurance,
        intellect: data.attributes.intellect,
        perception: data.attributes.perception,
        charisma: data.attributes.charisma,
      },
      skillFocuses: data.skillFocuses,
      appearance: {
        bodyType: data.appearance.bodyType,
        hairStyle: data.appearance.hairStyle,
        hairColor: data.appearance.hairColor,
        skinTone: data.appearance.skinTone,
        eyeColor: data.appearance.eyeColor,
        ageAppearance: data.appearance.ageAppearance,
        scarsMarks: data.appearance.scarsMarks,
      },
    });

    if (!response.data.success) {
      return {
        success: false,
        instanceId: '',
        partyId: '',
        characterId: '',
        error: 'Failed to create character',
      };
    }

    return {
      success: true,
      instanceId: response.data.instanceId,
      partyId: response.data.partyId,
      characterId: response.data.characterId,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        'Failed to start new game';
      return {
        success: false,
        instanceId: '',
        partyId: '',
        characterId: '',
        error: errorMessage,
      };
    }
    return {
      success: false,
      instanceId: '',
      partyId: '',
      characterId: '',
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Retry a function with exponential backoff.
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error | unknown;
  let delay = initialDelay;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
  }

  throw lastError;
}
