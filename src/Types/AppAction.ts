export type AppAction =
  | { type: 'PLACE_BID'; payload: { lotId: string; amount: number } }
  | { type: 'REMOVE_BID'; payload: { lotId: string } }
  | { type: 'SET_ACCOUNT'; payload: string }
  | { type: 'SET_VIEW_MODE'; payload: 'treemap' | 'list' }
  | { type: 'START_AUCTION'; payload: { lotIds: string[]; endTime: number } }
  | { type: 'END_AUCTION' };