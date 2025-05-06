export interface SheetDimensions {
  width: number;
  height: number;
}

export interface PieceRequirement extends SheetDimensions {
  id: string;
  name: string;
  quantity: number;
  color: string;
}

export interface Position {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  sheetIndex: number;
}

export interface Result {
  mainSheet: SheetDimensions;
  pieces: PieceRequirement[];
  layout: {
    positions: Position[];
    wastedArea: number;
    totalCuts: number;
    unusedPieces: { id: string; name: string; quantity: number }[];
  };
}

export const calculateCuts = (
  mainSheet: SheetDimensions,
  pieces: PieceRequirement[],
  sheetQuantity: number,
): Result | null => {
  if (
    !mainSheet.width ||
    !mainSheet.height ||
    pieces.some((p) => !p.width || !p.height)
  ) {
    return null;
  }

  const allPieces = [];

  for (const piece of pieces) {
    for (let i = 0; i < piece.quantity; i++) {
      allPieces.push({
        width: piece.width,
        height: piece.height,
        id: piece.id,
      });
    }
  }

  const solution = bestFitDecreasing2D(
    allPieces,
    mainSheet.width,
    mainSheet.height,
    sheetQuantity,
  );

  return {
    mainSheet,
    pieces,
    layout: {
      positions: solution.placements.map((p) => ({
        id: p.rectId,
        x: p.x,
        y: p.y,
        width: p.width,
        height: p.height,
        sheetIndex: p.binIndex,
      })),
      wastedArea: 0,
      totalCuts: 0,
      unusedPieces: solution.rejected.map((r) => ({
        id: r.id,
        name: pieces.find((p) => p.id === r.id)?.name ?? 'Unknown',
        quantity: 1,
      })),
    },
  };
};

type Rect = {
  width: number;
  height: number;
  id: string;
};

type Shelf = {
  y: number;
  height: number;
  usedWidth: number;
};

type Bin = {
  width: number;
  height: number;
  shelves: Shelf[];
  placements: Placement[];
};

type Placement = {
  rectId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  binIndex: number;
};

function fitsInShelf(rect: Rect, shelf: Shelf, binWidth: number): boolean {
  return (
    rect.width + shelf.usedWidth <= binWidth && rect.height <= shelf.height
  );
}

function addToShelf(rect: Rect, shelf: Shelf): { x: number; y: number } {
  const x = shelf.usedWidth;
  const y = shelf.y;
  shelf.usedWidth += rect.width;
  return { x, y };
}

function canStartNewShelf(rect: Rect, bin: Bin): boolean {
  const usedHeight = bin.shelves.reduce((sum, shelf) => sum + shelf.height, 0);
  return usedHeight + rect.height <= bin.height;
}

interface BestFitDecreasing2DResult {
  placements: Placement[];
  rejected: Rect[];
}

function bestFitDecreasing2D(
  rects: Rect[],
  binWidth: number,
  binHeight: number,
  maxBins: number,
): BestFitDecreasing2DResult {
  const sortedRects = [...rects].sort(
    (a, b) => b.height * b.width - a.height * a.width,
  );
  const bins: Bin[] = [];
  const rejected: Rect[] = [];

  for (const rect of sortedRects) {
    let bestBinIndex = -1;
    let bestShelf: Shelf | null = null;
    let bestSpaceLeft = Number.MAX_VALUE;

    // Look for best shelf in existing bins
    for (let i = 0; i < bins.length; i++) {
      const bin = bins[i];
      for (const shelf of bin.shelves) {
        if (fitsInShelf(rect, shelf, bin.width)) {
          const spaceLeft = bin.width - (shelf.usedWidth + rect.width);
          if (spaceLeft < bestSpaceLeft) {
            bestBinIndex = i;
            bestShelf = shelf;
            bestSpaceLeft = spaceLeft;
          }
        }
      }
    }

    if (bestShelf) {
      const bin = bins[bestBinIndex];
      const pos = addToShelf(rect, bestShelf);
      bin.placements.push({
        rectId: rect.id,
        x: pos.x,
        y: pos.y,
        width: rect.width,
        height: rect.height,
        binIndex: bestBinIndex,
      });
    } else {
      // Try to add new shelf to an existing bin
      let placedInExistingBin = false;
      for (let i = 0; i < bins.length; i++) {
        const bin = bins[i];
        if (canStartNewShelf(rect, bin)) {
          const y = bin.shelves.reduce((sum, shelf) => sum + shelf.height, 0);
          const newShelf: Shelf = {
            y,
            height: rect.height,
            usedWidth: rect.width,
          };
          bin.shelves.push(newShelf);
          bin.placements.push({
            rectId: rect.id,
            x: 0,
            y,
            width: rect.width,
            height: rect.height,
            binIndex: i,
          });
          placedInExistingBin = true;
          break;
        }
      }

      if (!placedInExistingBin) {
        if (bins.length < maxBins) {
          // Create a new bin and place the rectangle
          const newShelf: Shelf = {
            y: 0,
            height: rect.height,
            usedWidth: rect.width,
          };
          const newBin: Bin = {
            width: binWidth,
            height: binHeight,
            shelves: [newShelf],
            placements: [
              {
                rectId: rect.id,
                x: 0,
                y: 0,
                width: rect.width,
                height: rect.height,
                binIndex: bins.length,
              },
            ],
          };
          bins.push(newBin);
        } else {
          // Can't place this rect — maxBins limit hit
          rejected.push(rect);
        }
      }
    }
  }

  const allPlacements = bins.flatMap((bin) => bin.placements);
  return { placements: allPlacements, rejected };
}
