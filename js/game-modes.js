
/**
 * 
 * @param {number} file 
 * @param {number} column
 * @returns {number} White attackers minus black attacker 
 */
function getSquareAttackCount (file, rank) {
    let attackCount = 0;
    for (let y = 0; y < position.length; y++){
        const row = position[y];
        for (let x = 0; x < row.length; x++) {
            let piece = row[x];
            if (!piece)
                continue;

            let pieceMoves = getMovesOfPiece(position, x, y, true, true);
            for (let move of pieceMoves) {
                if (move.x == file && move.y == rank) {
                    attackCount += piece.team == "white" ? 1 : -1;
                    continue;
                }
            }
        }
    }

    return attackCount;
}