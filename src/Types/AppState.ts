import { useReducer, useMemo, useCallback } from 'react';
import type { AppState, AppAction, Lot, Bid } from '../Types';

const initialState: AppState = {
  lots: [
    { id: "lot-1", label: "Tesla", value: 0.75 },
    { id: "lot-2", label: "Apple", value: 0.85 },
    { id: "lot-3", label: "Google", value: 0.65 },
    { id: "lot-4", label: "Amazon", value: 0.55 },
    { id: "lot-5", label: "Microsoft", value: 0.90 },
  ],
  bids: [],
  accounts: [
    { id: "acc-1", name: "Alice", balance: 1000 },
    { id: "acc-2", name: "Bob", balance: 1500 },
    { id: "acc-3", name: "Charlie", balance: 2000 },
  ],
  currentAccountId: "acc-1",
  viewMode: 'treemap',
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'PLACE_BID': {
      const { lotId, amount } = action.payload;

      if (!state.currentAccountId) return state;

      const account = state.accounts.find(a => a.id === state.currentAccountId);
      if (!account || account.balance < amount) return state;

      // Remove existing bid from this account
      const filteredBids = state.bids.filter(
        b => b.accountId !== state.currentAccountId
      );

      const newBid: Bid = {
        lotId,
        accountId: state.currentAccountId,
        amount,
        timestamp: Date.now(),
      };

      return {
        ...state,
        bids: [...filteredBids, newBid],
      };
    }

    case 'REMOVE_BID': {
      const { lotId } = action.payload;
      return {
        ...state,
        bids: state.bids.filter(
          b => !(b.lotId === lotId && b.accountId === state.currentAccountId)
        ),
      };
    }

    case 'SET_ACCOUNT': {
      return {
        ...state,
        currentAccountId: action.payload,
      };
    }

    case 'SET_VIEW_MODE': {
      return {
        ...state,
        viewMode: action.payload,
      };
    }

    case 'UPDATE_VALUES': {
      return {
        ...state,
        lots: action.payload,
      };
    }

    default:
      return state;
  }
}

export function useAppState() {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Memoized current account
  const currentAccount = useMemo(
    () => state.accounts.find(a => a.id === state.currentAccountId) || null,
    [state.accounts, state.currentAccountId]
  );

  // Memoized plates with bid information
  const lotsWithBids = useMemo(() => {
    return state.lots.map(lot => {
      const lotBids = state.bids.filter(b => b.lotId === lot.id);
      const totalBidAmount = lotBids.reduce((sum, b) => sum + b.amount, 0);
      const currentUserBid = lotBids.find(b => b.accountId === state.currentAccountId);

      return {
        ...lot,
        totalBids: lotBids.length,
        totalBidAmount,
        currentUserBid: currentUserBid?.amount || 0,
        hasBid: !!currentUserBid,
      };
    });
  }, [state.lots, state.bids, state.currentAccountId]);

  // Memoized sorted plates for list view
  const sortedLots = useMemo(() => {
    return [...lotsWithBids].sort((a, b) => b.value - a.value);
  }, [lotsWithBids]);

  // Memoized used balance
  const usedBalance = useMemo(() => {
    const userBid = state.bids.find(b => b.accountId === state.currentAccountId);
    return userBid?.amount || 0;
  }, [state.bids, state.currentAccountId]);

  // Callbacks
  const placeBid = useCallback(
    (lotId: string, amount: number) => {
      dispatch({ type: 'PLACE_BID', payload: { lotId, amount } });
    },
    [dispatch]
  );

  const removeBid = useCallback(
    (lotId: string) => {
      dispatch({ type: 'REMOVE_BID', payload: { lotId } });
    },
    [dispatch]
  );

  const setAccount = useCallback(
    (accountId: string) => {
      dispatch({ type: 'SET_ACCOUNT', payload: accountId });
    },
    [dispatch]
  );

  const setViewMode = useCallback(
    (mode: 'treemap' | 'list') => {
      dispatch({ type: 'SET_VIEW_MODE', payload: mode });
    },
    [dispatch]
  );

  return {
    state,
    currentAccount,
    lotsWithBids,
    sortedLots,
    usedBalance,
    placeBid,
    removeBid,
    setAccount,
    setViewMode,
  };
}