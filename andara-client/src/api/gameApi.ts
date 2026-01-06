import apiClient from './client';
import type {
  Origin,
  Attributes,
  Appearance,
} from '../types/character';

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
    const response = await apiClient.post<{
      success: boolean;
      instanceId: string;
      partyId: string;
      characterId: string;
    }>('/game/start', {
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
  } catch (error: any) {
    return {
      success: false,
      instanceId: '',
      partyId: '',
      characterId: '',
      error: error.message || 'Failed to start new game',
    };
  }
}

// API Response Types
export interface CommandResponse {
  success: boolean;
  message?: string;
  data?: unknown;
  error?: string;
}

export interface QueryResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface GameLoadResponse {
  success: boolean;
  instanceId: string;
  partyId: string;
  zoneId: string;
  error?: string;
}

export interface SaveGameResponse {
  success: boolean;
  saveId: string;
  timestamp: number;
  error?: string;
}

export interface GameStateResponse {
  success: boolean;
  instanceId: string;
  partyId: string;
  zoneId: string;
  worldTime: number;
  party: unknown;
  zone: unknown;
  error?: string;
}

/**
 * Load a saved game instance.
 * POST /api/v1/game/load
 */
export async function loadGame(saveId: string): Promise<GameLoadResponse> {
  try {
    const response = await apiClient.post<{
      success: boolean;
      instanceId: string;
      partyId: string;
      zoneId: string;
    }>('/game/load', { saveId });

    return {
      success: response.data.success,
      instanceId: response.data.instanceId,
      partyId: response.data.partyId,
      zoneId: response.data.zoneId,
    };
  } catch (error: any) {
    return {
      success: false,
      instanceId: '',
      partyId: '',
      zoneId: '',
      error: error.message || 'Failed to load game',
    };
  }
}

/**
 * Save the current game instance.
 * POST /api/v1/game/save
 */
export async function saveGame(): Promise<SaveGameResponse> {
  try {
    const response = await apiClient.post<{
      success: boolean;
      saveId: string;
      timestamp: number;
    }>('/game/save');

    return {
      success: response.data.success,
      saveId: response.data.saveId,
      timestamp: response.data.timestamp,
    };
  } catch (error: any) {
    return {
      success: false,
      saveId: '',
      timestamp: 0,
      error: error.message || 'Failed to save game',
    };
  }
}

/**
 * Move party to a different zone.
 * POST /api/v1/party/move
 */
export async function moveParty(
  partyId: string,
  targetZoneId: string
): Promise<CommandResponse> {
  try {
    const response = await apiClient.post<{
      success: boolean;
      message?: string;
      data?: unknown;
    }>('/party/move', {
      partyId,
      targetZoneId,
    });

    return {
      success: response.data.success,
      message: response.data.message,
      data: response.data.data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to move party',
    };
  }
}

/**
 * Execute a game action.
 * POST /api/v1/game/action
 */
export async function executeAction(
  action: unknown
): Promise<CommandResponse> {
  try {
    const response = await apiClient.post<{
      success: boolean;
      message?: string;
      data?: unknown;
    }>('/game/action', action);

    return {
      success: response.data.success,
      message: response.data.message,
      data: response.data.data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to execute action',
    };
  }
}

/**
 * Send a generic command to the backend.
 * POST /api/v1/command
 */
export async function command(cmd: {
  type: string;
  payload?: unknown;
}): Promise<CommandResponse> {
  try {
    const response = await apiClient.post<{
      success: boolean;
      message?: string;
      data?: unknown;
    }>('/command', cmd);

    return {
      success: response.data.success,
      message: response.data.message,
      data: response.data.data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Command failed',
    };
  }
}

/**
 * Query game state or data.
 * GET /api/v1/query/{path}
 */
export async function query(path: string): Promise<QueryResponse> {
  try {
    const response = await apiClient.get<{
      success: boolean;
      data?: unknown;
    }>(`/query/${path}`);

    return {
      success: response.data.success,
      data: response.data.data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Query failed',
    };
  }
}

/**
 * Get current game state.
 * GET /api/v1/game/state
 */
export async function getGameState(): Promise<GameStateResponse> {
  try {
    const response = await apiClient.get<{
      success: boolean;
      instanceId: string;
      partyId: string;
      zoneId: string;
      worldTime: number;
      party: unknown;
      zone: unknown;
    }>('/game/state');

    return {
      success: response.data.success,
      instanceId: response.data.instanceId,
      partyId: response.data.partyId,
      zoneId: response.data.zoneId,
      worldTime: response.data.worldTime,
      party: response.data.party,
      zone: response.data.zone,
    };
  } catch (error: any) {
    return {
      success: false,
      instanceId: '',
      partyId: '',
      zoneId: '',
      worldTime: 0,
      party: null,
      zone: null,
      error: error.message || 'Failed to get game state',
    };
  }
}
