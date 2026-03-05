
/**
 * Returns a new chess piece.
 * @param {String} team The team to which this piece belongs.
 * @param {String} type The type of piece.
 */
function Piece(team, type) {
    let piece = {
        team: team,
        type: type,
        firstMove: true
    };
    return piece;
}

function copyPiece (piece) {
    if (!piece)
        return undefined;
    return {
        team: piece.team,
        type: piece.type,
        firstMove: piece.firstMove
    };
}

/**
 * Returns the legal moves of the piece at position (x,y);
 * @param {Piece[][]} board 
 * @param {Number} x 
 * @param {Number} y 
 * @param {bool} ignoreAttacks 
 */
function getMovesOfPiece(board, x, y, ignoreAttacks = false, ignoreTurn = false, allowEmptyAttacks = false, xRay = false) {
    if (!board[y] || !board[y][x]) return [];
    if (!pieceMoves[board[y][x].type]) return [];
    if (!ignoreTurn && board[y][x].team != position.turn) return [];
    let moves = pieceMoves[board[y][x].type](board, x, y, ignoreAttacks, ignoreTurn, allowEmptyAttacks, xRay);
    moves.forEach(move => {
        move.sx = x;
        move.sy = y;
    });
    addKickMoves(board, moves);
    if (!ignoreAttacks) {
        moves = moves.filter(move => {
            if (!move.ballMoves) {
                let afterPosition = positionAfterMove(board, move);
                let check = isCheck(afterPosition, board[y][x].team);
                return !check;
            }
            move.ballMoves = move.ballMoves.filter(bm => {
                let afterPosition = positionAfterMove(board, bm);
                let check = isCheck(afterPosition, board[y][x].team);
                let goal = isGoal(afterPosition, board[y][x].team);
                return !check || goal;
            });
            return move.ballMoves.length != 0;
        });
    }
    return moves;
}

function addKickMoves (board, moves) {
    let kickMove = moves.find(move => {
        let piece = board[move.y][move.x];
        return piece && piece.type == "ball";
    });
    if (!kickMove)
        return;
    let afterPosition = positionAfterMove(board, kickMove);
    let ballMoves = pieceMoves[board[kickMove.sy][kickMove.sx].type](afterPosition, kickMove.x, kickMove.y, false);
    ballMoves = ballMoves.filter(move => {
        return !afterPosition[move.y][move.x];
    });
    board[kickMove.y][kickMove.x].team = "nan";
    kickMove.ballMoves = ballMoves;
    ballMoves.forEach(move => {
        move.bx = move.x;
        move.by = move.y;
        move.x = kickMove.x;
        move.y = kickMove.y;
        move.sx = kickMove.sx;
        move.sy = kickMove.sy;
    });
}

const pieceMoves = {
    king: (board, x, y, ignoreAttacks, ignoreTurn, allowEmptyAttacks, xRay) => {
        let attackerMoves = [];
        if (!ignoreAttacks) {
            for (let j = 0; j < board.length; j++) {
                for (let i = 0; i < board[j].length; i++) {
                    if (board[j][i] && board[j][i].team != board[y][x].team) {
                        getMovesOfPiece(board, i, j, true, true).forEach(attackerMove => {
                            attackerMoves.push(attackerMove);
                        });
                    }
                }
            }
        }
        let moves = [];
        let freeXDirections = [0];
        let freeYDirections = [0];
        if (x > 0) freeXDirections.push(-1);
        if (x < board[y].length - 1) freeXDirections.push(1);
        if (y > 0) freeYDirections.push(-1);
        if (y < board.length - 1) freeYDirections.push(1);
        freeXDirections.forEach(dx => {
            freeYDirections.forEach(dy => {
                if (dx == 0 && dy == 0)
                    return;
                
                if (ignoreAttacks) {
                    moves.push({ x: x + dx, y: y + dy });
                } else if (xRay || !board[y + dy][x + dx] || board[y + dy][x + dx].team != board[y][x].team) {
                    moves.push({ x: x + dx, y: y + dy });
                }
            });
        });

        for (const move of moves) {
            move.attack = true;
        }
        
        if (!attackerMoves.find(move => {return move.x == x && move.y == y})) {
            let team = board[y][x].team;
            if (board.castling[team].short &&
                board[y][x + 1] == undefined &&
                board[y][x + 2] == undefined &&
                !attackerMoves.find(move => {
                    return move.y == y && (
                        move.x == x + 1 ||
                        move.x == x + 2
                    )
                }))
                moves.push({x: x + 2, y: y});
            
            if (board.castling[team].long &&
                board[y][x - 1] == undefined &&
                board[y][x - 2] == undefined &&
                board[y][x - 3] == undefined &&
                !attackerMoves.find(move => {
                    return move.y == y && (
                        move.x == x - 1 ||
                        move.x == x - 2
                    )
                }))
                moves.push({x: x - 2, y: y});
        }

        return moves;
    },

    queen: (board, x, y, ignoreAttacks, ignoreTurn, allowEmptyAttacks, xRay) => {
        let moves = pieceMoves.bishop(board, x, y, ignoreAttacks, ignoreTurn, allowEmptyAttacks, xRay);
        pieceMoves.rook(board, x, y, ignoreAttacks, ignoreTurn, allowEmptyAttacks, xRay).forEach(move => {
            moves.push(move);
        });

        for (const move of moves) {
            move.attack = true;
        }

        return moves;
    },

    knight: (board, x, y, ignoreAttacks, ignoreTurn, allowEmptyAttacks, xRay) => {
        let moves = [];
        let freeXDirections = [];
        let freeYDirections = [];
        if (x > 0) freeXDirections.push(-1);
        if (x > 1) freeXDirections.push(-2);
        if (x < board[y].length - 1) freeXDirections.push(1);
        if (x < board[y].length - 2) freeXDirections.push(2);
        if (y > 0) freeYDirections.push(-1);
        if (y > 1) freeYDirections.push(-2);
        if (y < board.length - 1) freeYDirections.push(1);
        if (y < board.length - 2) freeYDirections.push(2);
        freeXDirections.forEach(dx => {
            freeYDirections.forEach(dy => {
                if (Math.abs(dx) != Math.abs(dy)) {
                    if (ignoreAttacks || !board[y + dy][x + dx] || (xRay || board[y + dy][x + dx].team != board[y][x].team))
                        moves.push({ x: x + dx, y: y + dy });
                }
            });
        });

        for (const move of moves) {
            move.attack = true;
        }

        return moves;
    },

    rook: (board, x, y, ignoreAttacks, ignoreTurn, allowEmptyAttacks, xRay) => {
        let moves = [];
        for (let i = x - 1; i >= 0; i--) {
            if (board[y][i] && !(ignoreAttacks && board[y][i].team != board[y][x].team && board[y][i].type == "king")) {
                if (ignoreAttacks || board[y][i].team != board[y][x].team)
                    moves.push({ x: i, y: y });

                if (!xRay)
                    break;
            }
            moves.push({ x: i, y: y });
        }
        for (let i = x + 1; i < board[y].length; i++) {
            if (board[y][i] && !(ignoreAttacks && board[y][i].team != board[y][x].team && board[y][i].type == "king")) {
                if (ignoreAttacks || board[y][i].team != board[y][x].team)
                    moves.push({ x: i, y: y });
                
                if (!xRay)
                    break;
            }
            moves.push({ x: i, y: y });
        }
        for (let i = y - 1; i >= 0; i--) {
            if (board[i][x] && !(ignoreAttacks && board[i][x].team != board[y][x].team && board[i][x].type == "king")) {
                if (ignoreAttacks || board[i][x].team != board[y][x].team)
                    moves.push({ x: x, y: i });
                
                if (!xRay)
                    break;
            }
            moves.push({ x: x, y: i });
        }
        for (let i = y + 1; i < board.length; i++) {
            if (board[i][x] && !(ignoreAttacks && board[i][x].team != board[y][x].team && board[i][x].type == "king")) {
                if (ignoreAttacks || board[i][x].team != board[y][x].team)
                    moves.push({ x: x, y: i });
                
                if (!xRay)
                    break;
            }
            moves.push({ x: x, y: i });
        }

        for (const move of moves) {
            move.attack = true;
        }

        return moves;
    },

    bishop: (board, x, y, ignoreAttacks, ignoreTurn, allowEmptyAttacks, xRay) => {
        let moves = [];
        let minLength = Math.min(board.length, board[y].length);
        let dirs = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
        dirs.forEach(dir => {
            for (let i = 1; i < minLength; i++) {
                if (x + i * dir[0] > board[y].length - 1) break;
                if (y + i * dir[1] > board.length - 1) break;
                if (x + i * dir[0] < 0) break;
                if (y + i * dir[1] < 0) break;
                if (board[y + i * dir[1]][x + i * dir[0]] && !(ignoreAttacks && board[y + i * dir[1]][x + i * dir[0]].team != board[y][x].team && board[y + i * dir[1]][x + i * dir[0]].type == "king")) {
                    if (ignoreAttacks || board[y + i * dir[1]][x + i * dir[0]].team != board[y][x].team)
                        moves.push({ x: x + i * dir[0], y: y + i * dir[1] });
                    if (!xRay)
                        break;
                }
                moves.push({ x: x + i * dir[0], y: y + i * dir[1] });
            }
        });

        for (const move of moves) {
            move.attack = true;
        }

        return moves;
    },

    pawn: (board, x, y, ignoreAttacks, ignoreTurn, allowEmptyAttacks, xRay) => {
        let dir = board[y][x].team == "white" ? -1 : 1;
        let moves = [];
        if (!ignoreAttacks && board[y + dir] && !board[y + dir][x]) {
            moves.push({ x: x, y: y + dir });
            if (((ignoreTurn || board[y][x].team == board.turn) ? board[y][x].firstMove : (board.ball ? board.ball.firstMove : false)) && !board[y + dir * 2][x])
                moves.push({ x: x, y: y + dir * 2 });
        }
        if (x < board[y + dir].length - 1) {
            if (allowEmptyAttacks || ignoreAttacks || (board[y + dir][x + 1] && (xRay || board[y + dir][x + 1].team != board[y][x].team)) || (position.enpassant && position.enpassant.x == x + 1 && position.enpassant.y == y + dir)) {
                moves.push({ x: x + 1, y: y + dir });
            }
        }
        if (x > 0) {
            if (allowEmptyAttacks || ignoreAttacks || (board[y + dir][x - 1] && (xRay || board[y + dir][x - 1].team != board[y][x].team)) || (position.enpassant && position.enpassant.x == x - 1 && position.enpassant.y == y + dir)) {
                moves.push({ x: x - 1, y: y + dir });
            }
        }

        if (board[y][x].team == "white" ? y == 1 : y == board.length - 2) {
            moves.forEach(move => {
                let promotions = [];
                promotions.push({ x: move.x, y: move.y, promotion: "queen", xInSquare: 0, yInSquare: 0 });
                promotions.push({ x: move.x, y: move.y, promotion: "rook", xInSquare: 0.5, yInSquare: 0 });
                promotions.push({ x: move.x, y: move.y, promotion: "knight", xInSquare: 0, yInSquare: 0.5 });
                promotions.push({ x: move.x, y: move.y, promotion: "bishop", xInSquare: 0.5, yInSquare: 0.5 });
                move.promotions = promotions;
                promotions.forEach(p => {
                    p.sx = x;
                    p.sy = y;
                });
            });
        }

        for (const move of moves) {
            if (x != move.x)
                move.attack = true;
        }

        return moves;
    }
};

function getLetterOfPiece(type) {
    switch (type) {
        case "king":
            return "K";
        case "queen":
            return "Q";
        case "rook":
            return "R";
        case "bishop":
            return "B";
        case "knight":
            return "N";
    }
    return "";
}

function getSrcOfPiece(piece) {
    if (!piece) return "/images/empty.gif";
    return "/images/" + piece.type + " " + piece.team + ".gif";
}

function isTheSamePiece(a, b) {
    if (!a) {
        return !b;
    }
    if (!b) {
        return !a;
    }
    return a.team == b.team && a.type == b.type;
}