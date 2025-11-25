export interface Lot {
  id: string;
  label: string;
  value: number;
}

export interface Bid {
  lotId: string;
  accountId: string;
  amount: number;
  timestamp: number;
}

export interface Account {
  id: string;
  name: string;
  balance: number;
}

export interface AppState {
  lots: Lot[];
  bids: Bid[];
  accounts: Account[];
  currentAccountId: string | null;
  viewMode: 'treemap' | 'list';
}

export type AppAction =
  | { type: 'PLACE_BID'; payload: { lotId: string; amount: number } }
  | { type: 'REMOVE_BID'; payload: { lotId: string } }
  | { type: 'SET_ACCOUNT'; payload: string }
  | { type: 'SET_VIEW_MODE'; payload: 'treemap' | 'list' }
  | { type: 'UPDATE_VALUES'; payload: Lot[] };