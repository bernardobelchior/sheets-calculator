export const calculateCuts = (mainSheet, pieces, sheetQuantity) => {
  if (!mainSheet.width || !mainSheet.height || pieces.some(p => !p.width || !p.height)) {
    return;
  }

  const positions: Position[] = [];
  
  // Sort pieces by area (decreasing) and create working copy with tracking info
  const remainingPieces = pieces
    .map((piece, index) => ({
      ...piece,
      index,
      remaining: piece.quantity,
      area: piece.width * piece.height
    }))
    .sort((a, b) => b.area - a.area); // Sort by area decreasing
  
  // Process each sheet
  for (let sheetIndex = 0; sheetIndex < sheetQuantity; sheetIndex++) {
    // Keep track of free spaces on the current sheet
    const freeSpaces = [{ x: 0, y: 0, width: mainSheet.width, height: mainSheet.height }];
    
    // Try to place remaining pieces on this sheet
    let placedPieceOnSheet;
    do {
      placedPieceOnSheet = false;
      
      // Try each remaining piece in decreasing order of size
      for (let pieceIndex = 0; pieceIndex < remainingPieces.length; pieceIndex++) {
        const piece = remainingPieces[pieceIndex];
        if (piece.remaining <= 0) continue;
        
        // Try to place the piece in each free space (with both orientations)
        let placed = false;
        
        // Try normal orientation first
        for (let spaceIndex = 0; spaceIndex < freeSpaces.length; spaceIndex++) {
          const space = freeSpaces[spaceIndex];
          
          // Check if the piece fits in this space
          if (space.width >= piece.width && space.height >= piece.height) {
            // Place the piece in this space
            positions.push({
              x: space.x,
              y: space.y,
              width: piece.width,
              height: piece.height,
              pieceIndex: piece.index,
              sheetIndex,
              rotated: false
            });
            
            piece.remaining--;
            placedPieceOnSheet = true;
            placed = true;
            
            // Update free spaces
            updateFreeSpaces(freeSpaces, spaceIndex, piece.width, piece.height);
            break;
          }
        }
        
        // If piece wasn't placed, try rotated orientation
        if (!placed) {
          for (let spaceIndex = 0; spaceIndex < freeSpaces.length; spaceIndex++) {
            const space = freeSpaces[spaceIndex];
            
            // Check if the rotated piece fits in this space
            if (space.width >= piece.height && space.height >= piece.width) {
              // Place the rotated piece
              positions.push({
                x: space.x,
                y: space.y,
                width: piece.height,
                height: piece.width,
                pieceIndex: piece.index,
                sheetIndex,
                rotated: true
              });
              
              piece.remaining--;
              placedPieceOnSheet = true;
              
              // Update free spaces
              updateFreeSpaces(freeSpaces, spaceIndex, piece.height, piece.width);
              break;
            }
          }
        }
        
        // If we placed a piece, start over with the largest pieces
        if (placed) break;
      }
    } while (placedPieceOnSheet);
  }
  
  // Calculate unused pieces
  const unusedPieces = remainingPieces
    .filter(p => p.remaining > 0)
    .map(p => ({
      pieceIndex: p.index,
      quantity: p.remaining,
    }));
  
  // Calculate wasted area and cuts
  const usedArea = positions.reduce(
    (sum, pos) => sum + pos.width * pos.height,
    0
  );
  const totalArea = mainSheet.width * mainSheet.height * sheetQuantity;
  const wastedArea = totalArea - usedArea;
  
  // Count unique cut lines per sheet
  const totalCuts = Array.from({ length: sheetQuantity }).reduce((total, _, sheetIndex) => {
    const sheetPositions = positions.filter(p => p.sheetIndex === sheetIndex);
    
    // Collect all horizontal and vertical lines
    const horizontalLines = new Set();
    const verticalLines = new Set();
    
    sheetPositions.forEach(pos => {
      // Top and bottom edges
      if (pos.y > 0) horizontalLines.add(pos.y);
      if (pos.y + pos.height < mainSheet.height) horizontalLines.add(pos.y + pos.height);
      
      // Left and right edges
      if (pos.x > 0) verticalLines.add(pos.x);
      if (pos.x + pos.width < mainSheet.width) verticalLines.add(pos.x + pos.width);
    });
    
    return total + horizontalLines.size + verticalLines.size;
  }, 0);
  
  return {
    mainSheet,
    pieces,
    layout: {
      positions,
      wastedArea,
      totalCuts,
      unusedPieces,
    },
  };
};

// Update free spaces after placing a piece
const updateFreeSpaces = (freeSpaces, spaceIndex, pieceWidth, pieceHeight) => {
  const space = freeSpaces[spaceIndex];
  
  // Remove the used space
  freeSpaces.splice(spaceIndex, 1);
  
  // Create up to two new spaces (to the right and below the placed piece)
  
  // Space to the right of the piece
  if (space.width > pieceWidth) {
    freeSpaces.push({
      x: space.x + pieceWidth,
      y: space.y,
      width: space.width - pieceWidth,
      height: pieceHeight
    });
  }
  
  // Space below the piece (spanning the full width of the original space)
  if (space.height > pieceHeight) {
    freeSpaces.push({
      x: space.x,
      y: space.y + pieceHeight,
      width: space.width,
      height: space.height - pieceHeight
    });
  }
  
  // Sort free spaces by position (top-left first) to maintain first-fit behavior
  freeSpaces.sort((a, b) => {
    if (a.y !== b.y) return a.y - b.y;
    return a.x - b.x;
  });
};