import React from 'react';
import type { Account } from '../Types';

interface Props {
  accounts: Account[];
  currentAccountId: string | null;
  onAccountChange: (accountId: string) => void;
  usedBalance: number;
}

export const AccountSelector: React.FC<Props> = ({
  accounts,
  currentAccountId,
  onAccountChange,
  usedBalance,
}) => {
  const currentAccount = accounts.find(a => a.id === currentAccountId);

  return (
    <div style={{ marginBottom: 20, padding: 15, background: '#f5f5f5', borderRadius: 8 }}>
      <div style={{ marginBottom: 10 }}>
        <label style={{ marginRight: 10, fontWeight: 'bold' }}>Account:</label>
        <select
          value={currentAccountId || ''}
          onChange={(e) => onAccountChange(e.target.value)}
          style={{ padding: 5, fontSize: 14 }}
        >
          {accounts.map(account => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </select>
      </div>

      {currentAccount && (
        <div style={{ fontSize: 14 }}>
          <strong>Balance:</strong> ${currentAccount.balance.toFixed(2)} |{' '}
          <strong>Available:</strong> ${(currentAccount.balance - usedBalance).toFixed(2)} |{' '}
          <strong>Bid:</strong> ${usedBalance.toFixed(2)}
        </div>
      )}
    </div>
  );
};