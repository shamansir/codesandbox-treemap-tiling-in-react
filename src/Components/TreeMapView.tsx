import React from "react";
import * as TreeMap from "../TreeMap/TreeMap";

export type Plate = {
  id: string;
  label: string;
  value: number;
};

export type Props = {
  sources: Plate[];
};

export const TreeMapView: React.FC<Props> = ({ sources }) => {
  const positioned = TreeMap.treeMap(sources, (p) => p.value, {
    width: 800,
    height: 400,
    direction: "horizontal",
    padding: 2,
    minValue: 0.01,
  });

  return (
    <div>
      <h2>Stock Treemap (by value)</h2>
      <div
        style={{
          position: "relative",
          width: 800,
          height: 400,
          border: "1px solid #333",
        }}
      >
        {positioned.map(({ rect, source }) => (
          <TreeMapPlate key={source.id} rect={rect} source={source} />
        ))}
      </div>
    </div>
  );
};

const TreeMapPlate: React.FC<TreeMap.Positioned<Plate>> = ({
  rect,
  source,
}) => {
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
        background: valueToColor(source.value),
      }}
    >
      <div style={{ fontWeight: 'bold' }}>{source.label}</div>
      <div>{source.value.toFixed(3)}</div>
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