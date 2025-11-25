// TreemapView.tsx
import React from "react";
// import type { ShapeWithBid } from "./types";
import { treeMap } from "../TreeMap/TreeMap";
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
  const positioned = treeMap(sources, (p) => p.value, {
    width: 800,
    height: 400,
    direction: "horizontal",
    padding: 2,
    minValue: 0.01,
  });

  return (
    <div>
      <h2>Auction Treemap (by current price)</h2>
      <div
        style={{
          position: "relative",
          width: 800,
          height: 400,
          border: "1px solid #333",
        }}
      >
        {positioned.map(({ rect, source }) => (
          <TreeMapPlate rect={rect} source={source} />
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
      key={source.id}
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
        // background: shape.color, // or some mapping
      }}
    >
      <div>{source.label}</div>
      <div>{source.value.toFixed(3)}</div>
    </div>
  );
};
