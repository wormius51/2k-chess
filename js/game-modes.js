var attacksCounts = [];

/**
 * 
 * @param {number} file 
 * @param {number} column
 * @returns {number} White attackers minus black attacker 
 */
function getSquareAttackCount (file, rank) {
    let attackCount = 0;
    let movesGrid = [];
    for (let y = 0; y < boardHeight; y++){
        const row = position[y];
        const movesRow = []
        movesGrid.push(movesRow);
        for (let x = 0; x < boardWidth; x++) {
            let piece = row[x];
            if (!piece)
                continue;

            let pieceMoves = getMovesOfPiece(position, x, y, false, true, true, true);
            let attackMove;
            for (const move of pieceMoves) {
                if (move.attack && move.x == file && move.y == rank) {
                    attackMove = move;
                }
            }

            if (attackMove) {
                movesRow[x] = {
                    piece: piece,
                    move: attackMove
                };
            }
        }
    }

    // Checking pieces in-between the piece and the target for x-ray attacks (or batteries).
    for (let y = 0; y < boardHeight; y++) {
        const row = movesGrid[y];
        for (let x = 0; x < boardWidth; x++) {
            let pieceMove = row[x];
            if (!pieceMove)
                continue;
            
            let piece = pieceMove.piece;
            let move = pieceMove.move;

            if (piece.type == "queen" || piece.type == "rook" || piece.type == "bishop") {
                let dx = file - x;
                let dy = rank - y;
                let stepX = Math.sign(dx);
                let stepY = Math.sign(dy);
                let pathLength = Math.max(Math.abs(dx), Math.abs(dy));
                
                let blocked = false;

                for (let i = 1; i < pathLength; i++) {
                    let blockingX = x + stepX * i;
                    let blockingY = y + stepY * i;
                    let xRayedPieceMove = movesGrid[blockingY][blockingX];
                    if (!xRayedPieceMove) {
                        let blockingPiece = position[blockingY][blockingX];
                        if (blockingPiece){
                            blocked = true;
                            break;
                        }
                    }
                }

                if (blocked)
                    continue;
            }

            attackCount += piece.team == "white" ? 1 : -1;
        }
    }

    return attackCount;
}

function calculateAttacksCounts () {
    for (let rank = 0; rank < boardHeight; rank++) {
        if (!attacksCounts[rank])
            attacksCounts[rank] = [];
        
        for (let file = 0; file < boardWidth; file++) {
            attacksCounts[rank][file] = getSquareAttackCount(file, rank);
        }
    }
}