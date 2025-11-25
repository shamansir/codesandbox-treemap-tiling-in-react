import React, { useState, useCallback } from 'react';
import { valueToColor } from './TreeMapView';

interface LotWithBids {
  id: string;
  label: string;
  value: number;
  totalBids: number;
  totalBidAmount: number;
  currentUserBid: number;
  hasBid: boolean;
}

interface Props {
  lots: LotWithBids[];
  availableBalance: number;
  onPlaceBid: (lotId: string, amount: number) => void;
  onRemoveBid: (lotId: string) => void;
}

export const ListView: React.FC<Props> = ({
  lots,
  availableBalance,
  onPlaceBid,
  onRemoveBid,
}) => {
  const [bidAmounts, setBidAmounts] = useState<Record<string, string>>({});

  const handleBidChange = useCallback((plateId: string, value: string) => {
    setBidAmounts(prev => ({ ...prev, [plateId]: value }));
  }, []);

  const handlePlaceBid = useCallback((plateId: string) => {
    const amount = parseFloat(bidAmounts[plateId] || '0');
    if (amount > 0 && amount <= availableBalance) {
      onPlaceBid(plateId, amount);
      setBidAmounts(prev => ({ ...prev, [plateId]: '' }));
    }
  }, [bidAmounts, availableBalance, onPlaceBid]);

  return (
    <div>
      <h2>Stock List View</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f0f0f0' }}>
            <th style={cellStyle}>Stock</th>
            <th style={cellStyle}>Value</th>
            <th style={cellStyle}>Color</th>
            <th style={cellStyle}>Total Bids</th>
            <th style={cellStyle}>Your Bid</th>
            <th style={cellStyle}>Action</th>
          </tr>
        </thead>
        <tbody>
          {lots.map(lot => (
            <tr key={lot.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={cellStyle}>
                <strong>{lot.label}</strong>
              </td>
              <td style={cellStyle}>{lot.value.toFixed(3)}</td>
              <td style={cellStyle}>
                <div
                  style={{
                    width: 50,
                    height: 25,
                    background: valueToColor(lot.value),
                    border: '1px solid #000',
                    margin: '0 auto',
                  }}
                />
              </td>
              <td style={cellStyle}>
                {lot.totalBids} (${lot.totalBidAmount.toFixed(2)})
              </td>
              <td style={cellStyle}>
                {lot.hasBid ? (
                  <span style={{ color: '#28a745', fontWeight: 'bold' }}>
                    ${lot.currentUserBid.toFixed(2)}
                  </span>
                ) : (
                  '-'
                )}
              </td>
              <td style={cellStyle}>
                {lot.hasBid ? (
                  <button
                    onClick={() => onRemoveBid(lot.id)}
                    style={{
                      padding: '5px 10px',
                      background: '#dc3545',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 4,
                      cursor: 'pointer',
                    }}
                  >
                    Remove Bid
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: 5 }}>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={bidAmounts[lot.id] || ''}
                      onChange={(e) => handleBidChange(lot.id, e.target.value)}
                      placeholder="Amount"
                      style={{ width: 80, padding: 5 }}
                    />
                    <button
                      onClick={() => handlePlaceBid(lot.id)}
                      disabled={!bidAmounts[lot.id] || parseFloat(bidAmounts[lot.id]) <= 0}
                      style={{
                        padding: '5px 10px',
                        background: '#28a745',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer',
                        opacity: !bidAmounts[lot.id] || parseFloat(bidAmounts[lot.id]) <= 0 ? 0.5 : 1,
                      }}
                    >
                      Bid
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const cellStyle: React.CSSProperties = {
  padding: 12,
  textAlign: 'center',
};