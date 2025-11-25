// treeMap.ts

export type Direction = "horizontal" | "vertical";

/* export interface Source {
  id: string;
  label: string;
  value: number;
} */

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Positioned<Source> {
  source: Source;
  rect: Rect;
}

export type Options = {
  width: number;
  height: number;
  direction?: Direction;
  padding?: number; // inner padding for each rect
  minValue?: number; // ignore very small / zero values
};

export type DefinedOptions = {
  width: number;
  height: number;
  direction: Direction;
  padding: number; // inner padding for each rect
  minValue: number; // ignore very small / zero values
};

/**
 * Simple slice-and-dice treemap layout.
 *
 * - Accepts items with id / label / value
 * - Returns rectangles in [0,width]x[0,height]
 * - `direction` controls first split (then alternates)
 */
export function treeMap<Source>(
  items: Source[],
  getValue: (src: Source) => number,
  partialOptions: Options
): Positioned<Source>[] {
  const options: DefinedOptions = {
    ...partialOptions,
    direction: partialOptions.direction || "horizontal",
    padding: partialOptions.padding ?? 0,
    minValue: partialOptions.minValue ?? 0,
  };
  const filtered = items.filter((it) => getValue(it) > options.minValue);
  /*
  const total = filtered.reduce((sum, it) => sum + it.value, 0);

  if (filtered.length === 0 || total <= 0) {
    return [];
  }
  */

  // Sort by value descending for nicer layout
  const sorted = [...filtered].sort((a, b) => getValue(b) - getValue(a));

  const rects: Positioned<Source>[] = [];

  layoutRecursive(
    sorted,
    getValue,
    0,
    0,
    options.width,
    options.height,
    options.direction,
    // total,
    options.padding,
    rects
  );

  return rects;
}

function layoutSliceAndDice<Source>(
  items: Source[],
  getValue: (src: Source) => number,
  x: number,
  y: number,
  width: number,
  height: number,
  direction: Direction,
  totalValue: number,
  padding: number,
  output: Positioned<Source>[]
) {
  if (items.length === 0 || width <= 0 || height <= 0) return;

  if (items.length === 1) {
    const source = items[0];
    const rect = applyPadding(
      {
        x,
        y,
        width,
        height,
      },
      padding
    );
    output.push({ source, rect });
    return;
  }

  // Slice entire region into strips in current direction.
  let offset = direction === "horizontal" ? x : y;
  const isHorizontal = direction === "horizontal";

  for (const source of items) {
    const ratio = getValue(source) / totalValue;

    if (isHorizontal) {
      const w = width * ratio;
      const rect = applyPadding(
        {
          x: offset,
          y,
          width: w,
          height,
        },
        padding
      );
      output.push({ source, rect });
      offset += w;
    } else {
      const h = height * ratio;
      const rect = applyPadding({ x, y: offset, width, height: h }, padding);
      output.push({ source, rect });
      offset += h;
    }
  }

  // NOTE:
  // This version is a pure slice-and-dice (no deeper recursion).
  // Still a valid treemap; easy to understand & explain in interview.
}

function layoutRecursive<Source>(
  items: Source[],
  getValue: (src: Source) => number,
  x: number,
  y: number,
  width: number,
  height: number,
  direction: Direction,
  padding: number,
  output: Positioned<Source>[]
) {
  if (items.length === 0 || width <= 0 || height <= 0) return;

  if (items.length === 1) {
    const source = items[0];
    const rect = applyPadding({ x, y, width, height }, padding);
    output.push({ source, rect });
    return;
  }

  // Calculate total value
  const total = items.reduce((sum, it) => sum + getValue(it), 0);

  // Find best split point (approximately half the total value)
  let leftSum = 0;
  let splitIndex = 0;

  for (let i = 0; i < items.length - 1; i++) {
    leftSum += getValue(items[i]);
    if (leftSum >= total / 2) {
      // Check if this split or the previous is closer to 50/50
      const currentRatio = leftSum / total;
      const prevRatio = (leftSum - getValue(items[i])) / total;

      if (Math.abs(currentRatio - 0.5) < Math.abs(prevRatio - 0.5)) {
        splitIndex = i + 1;
      } else {
        splitIndex = i;
        leftSum -= getValue(items[i]);
      }
      break;
    }
    splitIndex = i + 1;
  }

  const leftItems = items.slice(0, splitIndex);
  const rightItems = items.slice(splitIndex);

  if (leftItems.length === 0 || rightItems.length === 0) {
    // Fallback: just place all items
    layoutRecursive(
      items,
      getValue,
      x,
      y,
      width,
      height,
      direction,
      padding,
      output
    );
    return;
  }

  const leftRatio = leftSum / total;
  const nextDirection: Direction =
    direction === "horizontal" ? "vertical" : "horizontal";

  if (direction === "horizontal") {
    // Split horizontally
    const leftWidth = width * leftRatio;
    const rightWidth = width - leftWidth;

    layoutRecursive(
      leftItems,
      getValue,
      x,
      y,
      leftWidth,
      height,
      nextDirection,
      padding,
      output
    );
    layoutRecursive(
      rightItems,
      getValue,
      x + leftWidth,
      y,
      rightWidth,
      height,
      nextDirection,
      padding,
      output
    );
  } else {
    // Split vertically
    const leftHeight = height * leftRatio;
    const rightHeight = height - leftHeight;

    layoutRecursive(
      leftItems,
      getValue,
      x,
      y,
      width,
      leftHeight,
      nextDirection,
      padding,
      output
    );
    layoutRecursive(
      rightItems,
      getValue,
      x,
      y + leftHeight,
      width,
      rightHeight,
      nextDirection,
      padding,
      output
    );
  }
}

function applyPadding(rect: Rect, padding: number): Rect {
  const x = rect.x + padding;
  const y = rect.y + padding;
  const width = Math.max(0, rect.width - padding * 2);
  const height = Math.max(0, rect.height - padding * 2);

  return { x, y, width, height };
}
