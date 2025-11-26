import "./styles.css";
import { useAppState } from "./Types/AppState";
import { AccountSelector } from "./Components/AccountSelector";
import { ViewToggle } from "./Components/ViewToggle";
import { TreeMapView } from "./Components/TreeMapView";
import { ListView } from "./Components/ListView";
import { lotListingToPlate } from "./Types";

export default function App() {
  const {
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
  } = useAppState();


  const availableBalance = currentAccount ? currentAccount.balance - usedBalance : 0;

  return (
    <div className="App">
      <h1>Stock Bidding Platform</h1>

      <AccountSelector
        accounts={state.accounts}
        currentAccountId={state.currentAccountId}
        onAccountChange={setAccount}
        usedBalance={usedBalance}
      />

      <ViewToggle
        viewMode={state.viewMode}
        onViewChange={setViewMode}
      />

      {state.viewMode === 'treemap' ? (
        <TreeMapView toDistribute={lotsWithBids.map(lotListingToPlate)} />
      ) : (
        <ListView
          lots={sortedLots}
          availableBalance={availableBalance}
          timeRemaining={timeRemaining}
          onPlaceBid={placeBid}
          onRemoveBid={removeBid}
        />
      )}
    </div>
  );
}