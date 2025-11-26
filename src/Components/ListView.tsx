import React, { useState, useCallback, useEffect, useRef } from 'react';
import { valueToColor } from './TreeMapView';
import { LotListing } from '../Types';


interface Props {
  lots: LotListing[];
  availableBalance: number;
  timeRemaining: number;
  onPlaceBid: (lotId: string, amount: number) => void;
  onRemoveBid: (lotId: string) => void;
}

export const ListView: React.FC<Props> = ({
  lots,
  availableBalance,
  timeRemaining,
  onPlaceBid,
  onRemoveBid,
}) => {
  const [bidAmounts, setBidAmounts] = useState<Record<string, string>>({});
  const [displayTime, setDisplayTime] = useState(timeRemaining);
  const rafRef = useRef<number | null>(null);

  // Update display time using requestAnimationFrame
  useEffect(() => {
    setDisplayTime(timeRemaining);

    const updateTimer = () => {
      setDisplayTime((prev : number) => {
        const newTime = Math.max(0, prev - 16); // Approximate frame time
        return newTime;
      });
      rafRef.current = requestAnimationFrame(updateTimer);
    };

    if (timeRemaining > 0) {
      rafRef.current = requestAnimationFrame(updateTimer);
    }

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [timeRemaining]);

  const handleBidChange = useCallback((lotId: string, value: string) => {
    setBidAmounts(prev => ({ ...prev, [lotId]: value }));
  }, []);

  const handlePlaceBid = useCallback((lotId: string, minPrice: number) => {
    const amount = parseFloat(bidAmounts[lotId] || '0');
    if (amount >= minPrice && amount <= availableBalance) {
      onPlaceBid(lotId, amount);
      setBidAmounts(prev => ({ ...prev, [lotId]: '' }));
    }
  }, [bidAmounts, availableBalance, onPlaceBid]);

  const formatTime = (ms: number) => {
    const seconds = Math.ceil(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        padding: 15,
        background: '#f8f9fa',
        borderRadius: 8,
      }}>
        <h2 style={{ margin: 0 }}>Stock Auction - List View</h2>
        <div style={{
          fontSize: 24,
          fontWeight: 'bold',
          color: displayTime < 10000 ? '#dc3545' : '#007bff',
        }}>
          ⏱️ {formatTime(displayTime)}
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f0f0f0' }}>
            <th style={cellStyle}>Stock</th>
            <th style={cellStyle}>Min Price</th>
            <th style={cellStyle}>Current Price</th>
            <th style={cellStyle}>Owner</th>
            <th style={cellStyle}>Highest Bid</th>
            <th style={cellStyle}>Your Bid</th>
            <th style={cellStyle}>Action</th>
          </tr>
        </thead>
        <tbody>
          {lots.map((lot: LotListing) => {
            const isDisabled = !lot.isAvailable;
            const rowStyle: React.CSSProperties = {
              borderBottom: '1px solid #ddd',
              opacity: isDisabled ? 0.4 : 1,
              background: isDisabled ? '#f5f5f5' : 'transparent',
            };

            return (
              <tr key={lot.id} style={rowStyle}>
                <td style={cellStyle}>
                  <strong>{lot.label}</strong>
                  {lot.isAvailable && (
                    <span style={{
                      marginLeft: 8,
                      color: '#28a745',
                      fontSize: 12
                    }}>
                      🟢 Available
                    </span>
                  )}
                </td>
                <td style={cellStyle}>${lot.minPrice.toFixed(2)}</td>
                <td style={cellStyle}>
                  <strong>${lot.currentPrice.toFixed(2)}</strong>
                </td>
                <td style={cellStyle}>
                  {lot.ownerName ? (
                    <span style={{ color: '#6c757d', fontStyle: 'italic' }}>
                      {lot.ownerName}
                    </span>
                  ) : (
                    '-'
                  )}
                </td>
                <td style={cellStyle}>
                  {lot.highestBid > 0 ? (
                    <span style={{ color: '#ffc107', fontWeight: 'bold' }}>
                      ${lot.highestBid.toFixed(2)}
                    </span>
                  ) : (
                    '-'
                  )}
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
                  {!lot.isAvailable ? (
                    <span style={{ color: '#6c757d' }}>Not available</span>
                  ) : lot.hasBid ? (
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
                    <div style={{ display: 'flex', gap: 5, justifyContent: 'center' }}>
                      <input
                        type="number"
                        min={lot.minPrice}
                        step="0.01"
                        value={bidAmounts[lot.id] || ''}
                        onChange={(e) => handleBidChange(lot.id, e.target.value)}
                        placeholder={`Min: ${lot.minPrice}`}
                        style={{ width: 100, padding: 5 }}
                      />
                      <button
                        onClick={() => handlePlaceBid(lot.id, lot.minPrice)}
                        disabled={
                          !bidAmounts[lot.id] ||
                          parseFloat(bidAmounts[lot.id]) < lot.minPrice ||
                          parseFloat(bidAmounts[lot.id]) > availableBalance
                        }
                        style={{
                          padding: '5px 10px',
                          background: '#28a745',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 4,
                          cursor: 'pointer',
                          opacity: (
                            !bidAmounts[lot.id] ||
                            parseFloat(bidAmounts[lot.id]) < lot.minPrice ||
                            parseFloat(bidAmounts[lot.id]) > availableBalance
                          ) ? 0.5 : 1,
                        }}
                      >
                        Bid
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const cellStyle: React.CSSProperties = {
  padding: 12,
  textAlign: 'center',
};