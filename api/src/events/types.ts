// filepath: api/events/types.ts

/**
 * Action types for the event system
 */
export enum ActionType {
  PLACE_STICKER = 'PLACE_STICKER',
  ENTER_MOON = 'ENTER_MOON',
  MOVE_USER = 'MOVE_USER',
}

/**
 * Payload for PLACE_STICKER action
 */
export interface PlaceStickerPayload {
  stickerId: string;
  position: {
    x: number;
    y: number;
  };
  moonId: string;
}

/**
 * Payload for ENTER_MOON action
 */
export interface EnterMoonPayload {
  moonId: string;
  userId: string;
  username: string;
}

/**
 * Payload for MOVE_USER action
 */
export interface MoveUserPayload {
  userId: string;
  position: {
    x: number;
    y: number;
  };
}

/**
 * Base Action interface
 */
export interface Action {
  type: ActionType;
  timestamp: number;
  userId: string;
}

/**
 * PLACE_STICKER action
 */
export interface PlaceStickerAction extends Action {
  type: ActionType.PLACE_STICKER;
  payload: PlaceStickerPayload;
}

/**
 * ENTER_MOON action
 */
export interface EnterMoonAction extends Action {
  type: ActionType.ENTER_MOON;
  payload: EnterMoonPayload;
}

/**
 * MOVE_USER action
 */
export interface MoveUserAction extends Action {
  type: ActionType.MOVE_USER;
  payload: MoveUserPayload;
}

/**
 * Union type for all actions
 */
export type EventAction = PlaceStickerAction | EnterMoonAction | MoveUserAction;

/**
 * Raw WebSocket message before parsing
 */
export interface RawWebSocketMessage {
  type: string;
  payload: unknown;
  userId: string;
  timestamp?: number;
}

export type Event =
  | { type: "TEST"; userId: string; payload: any }
  | { type: "MOVE"; userId: string; payload: any }
  | { type: "PLACE"; userId: string; payload: any };