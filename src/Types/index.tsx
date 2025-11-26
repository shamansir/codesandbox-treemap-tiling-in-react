export interface PresentedLot {
  id: string;
  label: string;
  minPrice: number;
}

export interface Lot extends PresentedLot {
  currentPrice: number;
  ownerId: string | null;
}

export interface Bid {
  lotId: string;
  accountId: string;
  amount: number;
}

export interface LotListing extends Lot {
  ownerName: string | null;
  totalBids: number;
  highestBid: number;
  currentUserBid: number;
  hasBid: boolean;
  isAvailable: boolean;
}

export interface Account {
  id: string;
  name: string;
  balance: number;
}

export type Plate = {
  id: string;
  label: string;
  currentValue: number;
  enabled: boolean;
  lines : string[];
  // ownerId: string | null;
  // ownerName: string | null;
};

export function lotListingToPlate(lot : LotListing): Plate {
  return {
    id: lot.id,
    label: lot.label,
    currentValue: lot.currentPrice,
    enabled: lot.ownerId !== null,
    lines: lot.ownerName !== null
      ? [ `Owner: ${lot.ownerName}` ]
      : []
  };
}