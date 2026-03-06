var position = [];

function setStartingPosition () {
   position = copyPosition(startPosition);
   position.turn = "white";
   position.castling = {white: {short: true, long: true}, black: {short: true, long: true}};
   position.ball = position[3][4];
}

const emptyPosition = [
    [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
    [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
    [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
    [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
    [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
    [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
    [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
    [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined]
];

const startPosition = [
    [Piece("black", "rook"), Piece("black", "knight"), Piece("black", "bishop"), Piece("black", "queen"), Piece("black", "king"), Piece("black", "bishop"), Piece("black", "knight"), Piece("black", "rook")],
    [Piece("black", "pawn"), Piece("black", "pawn"), Piece("black", "pawn"), Piece("black", "pawn"), Piece("black", "pawn"), Piece("black", "pawn"), Piece("black", "pawn"), Piece("black", "pawn")],
    [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
    [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
    [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
    [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
    [Piece("white", "pawn"), Piece("white", "pawn"), Piece("white", "pawn"), Piece("white", "pawn"), Piece("white", "pawn"), Piece("white", "pawn"), Piece("white", "pawn"), Piece("white", "pawn")],
    [Piece("white", "rook"), Piece("white", "knight"), Piece("white", "bishop"), Piece("white", "queen"), Piece("white", "king"), Piece("white", "bishop"), Piece("white", "knight"), Piece("white", "rook")]
];

function copyPosition(position) {
    let newPosition = [];
    for (let y = 0; y < position.length; y++) {
        newPosition.push([]);
        for (let x = 0; x < position[y].length; x++) {
            let piece = copyPiece(position[y][x]);
            newPosition[y].push(piece);
            if (piece && piece.type == "ball")
                newPosition.ball = piece;
        }
    }
    newPosition.turn = position.turn;
    if (position.castling) {
        newPosition.castling = {white: {
                short: position.castling.white.short,
                long: position.castling.white.long
            },
            black: {
                short: position.castling.black.short,
                long: position.castling.black.long
            }
        }
    }
    return newPosition;
}

function isTheSamePosition(a, b) {
    for (let y = 0; y < a.length; y++) {
        for (let x = 0; x < a[y].length; x++) {
            if (a[y][x] != b[y][x]) {
                if (!a[y][x] || !b[y][x]) {
                    return false;
                }
                if (a[y][x].team != b[y][x].team || a[y][x].type != b[y][x].type) {
                    return false;
                }
            }
        }
    }
    return true;
}

function numberToFile(num) {
    switch (num) {
        case 0:
            return "a";
        case 1:
            return "b";
        case 2:
            return "c";
        case 3:
            return "d";
        case 4:
            return "e";
        case 5:
            return "f";
        case 6:
            return "g";
        case 7:
            return "h";
    }
}

function positionAfterMove (position, move) {
    let afterPosition = copyPosition(position);
    positionPlayMove(afterPosition, move);
    return afterPosition;
}

function positionPlayMove (position, move) {   
    let piece = position[move.sy][move.sx];
    position[move.sy][move.sx] = undefined;
    if (move.bx != undefined)
        position[move.by][move.bx] = position.ball;
    position[move.y][move.x] = piece;
    
    if (piece.type == "pawn") {
        let colorSign = (piece.team == "white") ? 1 : -1;
        if (position.enpassant && position.enpassant.x == move.x && position.enpassant.y == move.y)
            position[move.y + colorSign][move.x] = undefined;
        if ((move.sy - move.y) * colorSign > 1)
            position.enpassant = {x: move.x, y: move.y + colorSign, team: piece.team};
        if (move.promotion)
            piece.type = move.promotion;
    } else if (piece.type == "rook") {
        if (move.sx == 0)
            position.castling[piece.team].long = false;
        else
            position.castling[piece.team].short = false;
    } else if (piece.type == "king") {
        position.castling[piece.team].long = false;
        position.castling[piece.team].short = false;
        if (move.x - move.sx == -2) {
            let rook = position[move.y][0]
            position[move.y][move.x + 1] = rook;
            position[move.y][0] = undefined;
        } else if (move.x - move.sx == 2) {
            let rook = position[move.y][position[0].length - 1]
            position[move.y][move.x - 1] = rook;
            position[move.y][position[0].length - 1] = undefined;
        }
    }
    piece.firstMove = false;
    if (position.enpassant && position.turn != position.enpassant.team)
        position.enpassant = undefined;
    if (!skipEmenyTurn)
        position.turn = (position.turn == "white") ? "black" : "white";
}


/**
 * Is this team in check
 */
function isCheck(position, team) {
    for (let y = 0; y < position.length; y++) {
        for (let x = 0; x < position[y].length; x++) {
            if (!position[y][x] || position[y][x].team == team) continue;
            let moves = getMovesOfPiece(position, x, y, true, true);
            for (let i = 0; i < moves.length; i++) {
                let move = moves[i];
                if (position[move.y][move.x]) {
                    if (position[move.y][move.x].type == "king" && position[move.y][move.x].team == team) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}

function copyMove (move, copyTo) {
    if (!copyTo) return;
    copyTo.x = move.x;
    copyTo.y = move.y;
    copyTo.sx = move.sx;
    copyTo.sy = move.sy;
    copyTo.bx = move.bx;
    copyTo.by = move.by;
    copyTo.promotion = move.promotion;
}

function isSavingMove (position, team, move) {
    let pos = positionAfterMove(position, move)
    return !isCheck(pos, team) || isGoal(pos, team);
}

/**
 * Is this team mated
 */
function isMate (position, team, savingMove) {
    if (!isCheck(position, team)) return false;
    for (let y = 0; y < position.length; y++) {
        for (let x = 0; x < position[y].length; x++) {
            if (!position[y][x] || position[y][x].team != team) continue;
            let moves = getMovesOfPiece(position, x, y);
            for (let i = 0; i < moves.length; i++) {
                let move = moves[i];
                if (move.ballMoves) {
                    for (let i = 0; i < move.ballMoves.length; i++) {
                        if (isSavingMove(position, team, move.ballMoves[i])) {
                            copyMove(move.ballMoves[i], savingMove);
                            return false;
                        }
                    }
                } else if (move.promotions) {
                    for (let i = 0; i < move.promotions.length; i++) {
                        if (isSavingMove(position, team, move.promotions[i])) {
                            copyMove(move.promotions[i], savingMove);
                            return false;
                        }
                    }
                } else if (isSavingMove(position, team, move)) {
                    copyMove(move, savingMove);
                    return false;
                }
            }
        }
    }
    return true;
}

function isStalemate (position) {
    if (isMate(position, position.turn) || isGoal(position, "white") || isGoal(position, "black"))
        return false;
    for (let y = 0; y < position.length; y++) {
        for (let x = 0; x < position[y].length; x++) {
            let moves = getMovesOfPiece(position, x, y);
            if (moves.length > 0)
                return false;
        }
    }
    return true;
}

function isGoal (position, team) {
    let goalRank = (team == "white") ? 0 : (position.length - 1);
    for (let file = 0; file < position[goalRank].length; file++) {
        if (position[goalRank][file] && position[goalRank][file].type == "ball")
            return true;
    }
    return false;
}

function positionResult (position) {
    if (isGoal(position, "white"))
        return "goal white";
    if (isGoal(position, "black"))
        return "goal black";
    let attackingTeam = position.turn == "white" ? "black" : "white";
    if (isMate(position, position.turn))
        return "mate " + attackingTeam;
    if (isStalemate(position))
        return "stalemate";
    return "playing";
}