import { useReducer, useMemo, useCallback, useEffect, useState } from 'react';
import type { AppAction } from './AppAction';
import type { PresentedLot, Lot, Bid, Account } from './index';

// Configuration constants
export const AUCTION_DURATION_MS = 60000; // 1 minute
export const FREEZE_DURATION_MS = 3000; // 3 seconds freeze between auctions
export const LOTS_PER_AUCTION = 3;

export interface AppState {
  lots: Lot[];
  bids: Bid[];
  accounts: Account[];
  currentAccountId: string | null;
  viewMode: 'treemap' | 'list';
  availableLotIds: string[];
  auctionEndTime: number | null;
  isFrozen: boolean;
  freezeEndTime: number | null;
}

// Master list of all possible lots
const ALL_LOTS: PresentedLot[] = [
// const ALL_LOTS: Omit<Lot, 'currentPrice' | 'ownerId'>[] = [
  { id: "lot-1", label: "Tesla", minPrice: 100 },
  { id: "lot-2", label: "Apple", minPrice: 150 },
  { id: "lot-3", label: "Google", minPrice: 200 },
  { id: "lot-4", label: "Amazon", minPrice: 180 },
  { id: "lot-5", label: "Microsoft", minPrice: 250 },
  { id: "lot-6", label: "Meta", minPrice: 120 },
  { id: "lot-7", label: "Netflix", minPrice: 90 },
  { id: "lot-8", label: "NVIDIA", minPrice: 300 },
  { id: "lot-9", label: "AMD", minPrice: 110 },
  { id: "lot-10", label: "Intel", minPrice: 95 },
  { id: "lot-11", label: "IBM", minPrice: 130 },
  { id: "lot-12", label: "Oracle", minPrice: 85 },
  { id: "lot-13", label: "Salesforce", minPrice: 170 },
  { id: "lot-14", label: "Adobe", minPrice: 220 },
  { id: "lot-15", label: "PayPal", minPrice: 75 },
  { id: "lot-16", label: "Square", minPrice: 65 },
  { id: "lot-17", label: "Uber", minPrice: 55 },
  { id: "lot-18", label: "Lyft", minPrice: 45 },
  { id: "lot-19", label: "Airbnb", minPrice: 140 },
  { id: "lot-20", label: "Spotify", minPrice: 80 },
  { id: "lot-21", label: "Zoom", minPrice: 70 },
  { id: "lot-22", label: "Slack", minPrice: 60 },
  { id: "lot-23", label: "Twitter", minPrice: 50 },
  { id: "lot-24", label: "Snap", minPrice: 40 },
  { id: "lot-25", label: "Pinterest", minPrice: 35 },
];

const initialState: AppState = {
  lots: ALL_LOTS.map(lot => ({
    ...lot,
    currentPrice: lot.minPrice,
    ownerId: null,
  })),
  bids: [],
  accounts: [
    { id: "acc-1", name: "Alice", balance: 5000 },
    { id: "acc-2", name: "Bob", balance: 7500 },
    { id: "acc-3", name: "Charlie", balance: 10000 },
  ],
  currentAccountId: "acc-1",
  viewMode: 'treemap',
  availableLotIds: [],
  auctionEndTime: null,
  isFrozen: false,
  freezeEndTime: null,
};

function getRandomLots(lots: Lot[], count: number): string[] {
  const shuffled = [...lots].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(lot => lot.id);
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'PLACE_BID': {
      const { lotId, amount } = action.payload;

      if (!state.currentAccountId) return state;

      // Prevent bidding during freeze period
      if (state.isFrozen) return state;

      const lot = state.lots.find(l => l.id === lotId);
      if (!lot || amount < lot.minPrice) return state;

      if (!state.availableLotIds.includes(lotId)) return state;

      const account = state.accounts.find(a => a.id === state.currentAccountId);
      if (!account) return state;

      // Calculate used balance (excluding current bid on this lot)
      const otherBids = state.bids.filter(
        b => b.accountId === state.currentAccountId && b.lotId !== lotId
      );
      const usedBalance = otherBids.reduce((sum, b) => sum + b.amount, 0);

      if (account.balance < usedBalance + amount) return state;

      // Remove existing bid on this lot from this account
      const filteredBids = state.bids.filter(
        b => !(b.lotId === lotId && b.accountId === state.currentAccountId)
      );

      const newBid: Bid = {
        lotId,
        accountId: state.currentAccountId,
        amount,
      };

      return {
        ...state,
        bids: [...filteredBids, newBid],
      };
    }

    case 'REMOVE_BID': {
      const { lotId } = action.payload;

      // Prevent removing bids during freeze period
      if (state.isFrozen) return state;

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

    case 'START_AUCTION': {
      return {
        ...state,
        availableLotIds: action.payload.lotIds,
        auctionEndTime: action.payload.endTime,
        bids: [], // Clear all bids for new auction
        isFrozen: false,
        freezeEndTime: null,
      };
    }

    case 'END_AUCTION': {
      // Process winning bids
      const updatedLots = state.lots.map(lot => {
        if (!state.availableLotIds.includes(lot.id)) return lot;

        const lotBids = state.bids.filter(b => b.lotId === lot.id);
        if (lotBids.length === 0) return lot;

        // Find highest bid
        const winningBid = lotBids.reduce((max, bid) =>
          bid.amount > max.amount ? bid : max
        );

        return {
          ...lot,
          currentPrice: winningBid.amount,
          ownerId: winningBid.accountId,
        };
      });

      // Deduct winning bids from account balances
      const updatedAccounts = state.accounts.map(account => {
        const winningBids = state.bids.filter(bid => {
          const lotBids = state.bids.filter(b => b.lotId === bid.lotId);
          const maxBid = Math.max(...lotBids.map(b => b.amount));
          return bid.accountId === account.id && bid.amount === maxBid;
        });

        const totalCost = winningBids.reduce((sum, b) => sum + b.amount, 0);

        return {
          ...account,
          balance: account.balance - totalCost,
        };
      });

      return {
        ...state,
        lots: updatedLots,
        accounts: updatedAccounts,
        bids: [],
        availableLotIds: [],
        auctionEndTime: null,
        isFrozen: true,
        freezeEndTime: Date.now() + FREEZE_DURATION_MS,
      };
    }

    case 'END_FREEZE': {
      return {
        ...state,
        isFrozen: false,
        freezeEndTime: null,
      };
    }

    default:
      return state;
  }
}

export function useAppState() {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Update current time for reactive timer calculations
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 100); // Update every 100ms for smooth countdown

    return () => clearInterval(interval);
  }, []);

  // Start new auction automatically after freeze ends
  useEffect(() => {
    const startNewAuction = () => {
      const randomLotIds = getRandomLots(state.lots, LOTS_PER_AUCTION);
      const endTime = Date.now() + AUCTION_DURATION_MS;
      dispatch({ type: 'START_AUCTION', payload: { lotIds: randomLotIds, endTime } });
    };

    // Start first auction
    if (state.auctionEndTime === null && !state.isFrozen) {
      startNewAuction();
    }
  }, [state.auctionEndTime, state.isFrozen, state.lots]);

  // Timer to end auction
  useEffect(() => {
    if (!state.auctionEndTime) return;

    const timeLeft = state.auctionEndTime - Date.now();
    if (timeLeft <= 0) {
      dispatch({ type: 'END_AUCTION' });
      return;
    }

    const timer = setTimeout(() => {
      dispatch({ type: 'END_AUCTION' });
    }, timeLeft);

    return () => clearTimeout(timer);
  }, [state.auctionEndTime]);

  // Timer to end freeze period
  useEffect(() => {
    if (!state.freezeEndTime) return;

    const timeLeft = state.freezeEndTime - Date.now();
    if (timeLeft <= 0) {
      dispatch({ type: 'END_FREEZE' });
      return;
    }

    const timer = setTimeout(() => {
      dispatch({ type: 'END_FREEZE' });
    }, timeLeft);

    return () => clearTimeout(timer);
  }, [state.freezeEndTime]);

  // Memoized current account
  const currentAccount = useMemo(
    () => state.accounts.find(a => a.id === state.currentAccountId) || null,
    [state.accounts, state.currentAccountId]
  );

  // Memoized lots with bid information
  const lotsWithBids = useMemo(() => {
    return state.lots.map(lot => {
      const lotBids = state.bids.filter(b => b.lotId === lot.id);
      const highestBid = lotBids.length > 0
        ? Math.max(...lotBids.map(b => b.amount))
        : 0;
      const currentUserBid = lotBids.find(b => b.accountId === state.currentAccountId);
      const isAvailable = state.availableLotIds.includes(lot.id);
      const owner = lot.ownerId ? state.accounts.find(a => a.id === lot.ownerId) : null;

      return {
        ...lot,
        totalBids: lotBids.length,
        highestBid,
        currentUserBid: currentUserBid?.amount || 0,
        hasBid: !!currentUserBid,
        isAvailable,
        ownerName: owner?.name || null,
      };
    });
  }, [state.lots, state.bids, state.currentAccountId, state.availableLotIds, state.accounts]);

  // Memoized sorted lots for Auction
  const sortedLots = useMemo(() => {
    return [...lotsWithBids].sort((a, b) => {
      // Available lots first
      if (a.isAvailable !== b.isAvailable) {
        return a.isAvailable ? -1 : 1;
      }
      // Then by current price descending
      return b.currentPrice - a.currentPrice;
    });
  }, [lotsWithBids]);

  // Memoized used balance
  const usedBalance = useMemo(() => {
    return state.bids
      .filter(b => b.accountId === state.currentAccountId)
      .reduce((sum, b) => sum + b.amount, 0);
  }, [state.bids, state.currentAccountId]);

  // Calculate time remaining (including freeze time) - now reactive with currentTime
  const timeRemaining = useMemo(() => {
    if (state.freezeEndTime) {
      return Math.max(0, state.freezeEndTime - currentTime);
    }
    if (!state.auctionEndTime) return 0;
    return Math.max(0, state.auctionEndTime - currentTime);
  }, [state.auctionEndTime, state.freezeEndTime, currentTime]);

  // Callbacks
  const placeBid = useCallback(
    (lotId: string, amount: number) => {
      dispatch({ type: 'PLACE_BID', payload: { lotId, amount } });
    },
    []
  );

  const removeBid = useCallback(
    (lotId: string) => {
      dispatch({ type: 'REMOVE_BID', payload: { lotId } });
    },
    []
  );

  const setAccount = useCallback(
    (accountId: string) => {
      dispatch({ type: 'SET_ACCOUNT', payload: accountId });
    },
    []
  );

  const setViewMode = useCallback(
    (mode: 'treemap' | 'list') => {
      dispatch({ type: 'SET_VIEW_MODE', payload: mode });
    },
    []
  );

  return {
    state,
    currentAccount,
    lotsWithBids,
    sortedLots,
    usedBalance,
    timeRemaining,
    placeBid,
    removeBid,
    setAccount,
    setViewMode,
    isFrozen: state.isFrozen,
  };
}