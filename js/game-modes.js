
const solvedHeader = document.getElementById('solvedHeader');
const nextButton = document.getElementById('nextButton');
const restartButton = document.getElementById('restartButton');

var attacksCounts = [];
var currentLevel;

var drawingAttackCounts = true;
var skipEmenyTurn = false;

window.addEventListener('load', populateLevelButtons);
nextButton.addEventListener('click', playNextLevel);
restartButton.addEventListener('click', restartLevel);

/**
 * 
 * @param {string} name 
 * @param {string} desctiption 
 * @param {string} fen The position encoded in a string
 * @param {{
 * x : number,
 * y : number,
 * count : number
 * }[]} goals Squares and counts you need to reach to solve
 * @param {number} minimumMoves The number of moves it took me to solve
 * @returns {{
 *  name : string,
 *  desctiption : string,
 *  fen : string,
 *  goals : {
 *      x : number,
 *      y : number,
 *      count : number
 *  }
 * }}
 */
function Level (name, desctiption, fen, goals, minimumMoves) {
    let level = {
        name: name,
        desctiption: desctiption,
        fen: fen,
        goals: goals,
        minimumMoves: minimumMoves
    };
    return level;
}

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
                    if (xRayedPieceMove) {
                        // You can't make a battery with a king because you can't trade the king.
                        if (xRayedPieceMove.piece.type == "king" && piece.team == xRayedPieceMove.piece.team) {
                            blocked = true;
                            break;
                        }

                    } else {
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

function playLevel (level) {
    possibleMoves = [];
    currentLevel = level;
    skipEmenyTurn = true;
    position = fenToPosition(level.fen);
    calculateAttacksCounts();
    drawBoard()
    displayLevelInfo(level);

    solvedHeader.style.display = "none";
    nextButton.style.display = "none";
    restartButton.style.display = "inline";
}

function playNextLevel () {
    const currentLevelIndex = levels.findIndex(level => level == currentLevel);
    playLevel(levels[currentLevelIndex + 1]);
}

function restartLevel () {
    playLevel(currentLevel);
}

function populateLevelButtons () {
    const levelButtonsDiv = document.getElementById("levelButtonsDiv");
    for (const level of levels) {
        let button = document.createElement('button');
        button.innerText = level.name;
        button.addEventListener('click', () => {
            playLevel(level);
        });
        levelButtonsDiv.appendChild(button);
    }
}

function displayLevelInfo (level = currentLevel) {
    document.getElementById("levelHeader").innerText = level.name;
    document.getElementById("levelDescriptionP").innerText = level.desctiption;
    document.getElementById("levelMovesCounter").innerText = `Moves: ${position.turnNumber}/${level.minimumMoves}`;
}

function didPassLevel (level = currentLevel) {
    if (position.turnNumber > level.minimumMoves)
        return false;

    for (const goal of level.goals) {
        let attackCount = getSquareAttackCount(goal.x, goal.y);
        if (attackCount < goal.count)
            return false;
    }

    return true;
}

function checkLevelPass (level = currentLevel) {
    if (didPassLevel(level)) {
        solvedHeader.style.display = "block";
        if (levels.findIndex(l => l == level) < levels.length - 1)
            nextButton.style.display = "block";
    }
}