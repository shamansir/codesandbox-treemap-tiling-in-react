import "./styles.css";
import { TreeMapView, Plate } from "./Components/TreeMapView";

const sources: Plate[] = [
  { id: "test-1", label: "Test 1", value: 0.1 },
  { id: "test-2", label: "Test 2", value: 0.45 },
  { id: "test-3", label: "Test 3", value: 0.35 },
  { id: "test-4", label: "Test 4", value: 0.95 },
  { id: "test-5", label: "Test 5", value: 0.05 },
];

export default function App() {
  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <h2>Start evolving to see some magic happen!</h2>
      <TreeMapView sources={sources} />
    </div>
  );
}
