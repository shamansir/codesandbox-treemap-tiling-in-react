import React, { useMemo } from "react";
import * as TreeMap from "../TreeMap/TreeMap";
import { Plate } from "../Types";


export type Props = {
  toDistribute: Plate[];
};

export const TreeMapView: React.FC<Props> = ({ toDistribute }) => {
  // Calculate max price for color normalization
  const maxValue = Math.max(...toDistribute.map((s) => s.currentValue), 1);

  const positioned = useMemo(
    () =>
      TreeMap.treeMap(toDistribute, (p) => p.currentValue, {
        width: 800,
        height: 400,
        direction: "horizontal",
        padding: 2,
        minValue: 0.01,
      }),
    [toDistribute]
  );

  return (
    <div>
      <h2>Stock Portfolio Treemap (by current price)</h2>
      <div
        style={{
          position: "relative",
          width: 800,
          height: 400,
          border: "1px solid #333",
        }}
      >
        {positioned.map(({ rect, source }) => (
          <TreeMapPlate
            key={source.id}
            rect={rect}
            source={source}
            maxValue={maxValue}
          />
        ))}
      </div>
    </div>
  );
};

const TreeMapPlate: React.FC<
  TreeMap.Positioned<Plate> & { maxValue: number }
> = ({ rect, source, maxValue }) => {
  const normalizedValue = source.currentValue / maxValue;
  const isEnabled = source.enabled;

  return (
    <div
      style={{
        position: "absolute",
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height,
        border: "1px solid #000",
        boxSizing: "border-box",
        fontSize: 10,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: valueToColor(normalizedValue),
      }}
    >
      <div
        style={{
          fontWeight: "bold",
          color: isEnabled ? "#888" : "#000",
        }}
      >
        {source.label}
      </div>
      <div style={{ fontSize: 9 }}>${source.currentValue.toFixed(2)}</div>
      {isEnabled && (
        <div
          style={{
            fontSize: 8,
            color: "#555",
            marginTop: 2,
            fontStyle: "italic",
          }}
        >
          { source.lines.join("; ") }
          {/* Owner: {source.ownerName} */}
        </div>
      )}
    </div>
  );
};

/**
 * Generates an eye-friendly hex color for a value in range [0.0, 1.0]
 * - 0.0 → dark red (like stock losses)
 * - 0.5 → yellow/orange (neutral)
 * - 1.0 → bright green (like stock gains)
 */
export function valueToColor(value: number): string {
  const clamped = Math.max(0, Math.min(1, value));

  let r: number, g: number, b: number;

  if (clamped < 0.5) {
    const t = clamped * 2;
    r = Math.round(139 + (255 - 139) * t);
    g = Math.round(0 + 200 * t);
    b = 0;
  } else {
    const t = (clamped - 0.5) * 2;
    r = Math.round(255 - 255 * t);
    g = Math.round(200 + (220 - 200) * t);
    b = Math.round(0 + 50 * t);
  }

  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
