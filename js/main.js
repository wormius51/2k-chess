window.addEventListener('load', () => {
    playLevel(levels[0]);
    //setStartingPosition();
    //drawBoard();
});

canvas.addEventListener('click', selectCanvas);
canvas.addEventListener('mousedown', event => {
    selectCanvas(event, true);
});
canvas.addEventListener('mousemove', setMouseXY);

const flipButton = document.getElementById("flipBoardButton");
flipButton.addEventListener('click', flipBoard);

var possibleMoves = [];

var myColor = "both";

function getOnscreenSquareEdgeLength () {
    let length = squareEdgeLength * canvas.clientWidth / canvas.width;
    return length;
}

function setMouseXY (event) {
    let x = event.clientX - canvas.offsetLeft;
    let y = event.clientY - canvas.offsetTop;
    let onscreenSquareEdgeLength = getOnscreenSquareEdgeLength();
    mouseX = x / onscreenSquareEdgeLength -0.5;
    mouseY = y / onscreenSquareEdgeLength -0.5;
    drawBoard();
}

function selectCanvas (event, isDrag) {
    if (myColor != "both" && myColor != position.turn)
        return;
    let x = event.clientX - canvas.offsetLeft;
    let y = event.clientY - canvas.offsetTop;
    let onscreenSquareEdgeLength = getOnscreenSquareEdgeLength();
    let file = Math.floor(x / onscreenSquareEdgeLength);
    let rank = Math.floor(y / onscreenSquareEdgeLength);
    let xInSquare = x / onscreenSquareEdgeLength - file;
    let yInSquare = y / onscreenSquareEdgeLength - rank;
    selectSquare(file, rank, xInSquare, yInSquare, isDrag);
}

function selectSquare (file, rank, xInSquare, yInSquare, isDrag) {
    if (flippedBoard) {
        file = boardWidth - 1 - file;
        rank = boardHeight - 1 - rank;
    }

    //if (position[rank] && draggedPiece == position.ball && position[rank][file] == position.ball)
        //return;
    if (isDrag && position[rank])
        draggedPiece = position[rank][file];
    else
        draggedPiece = undefined;

    let move = possibleMoves.find(m => {
        return ((m.bx == undefined && m.x == file && m.y == rank) || 
        (m.bx == file && m.by == rank)) &&
        (m.xInSquare == undefined || (
        m.xInSquare <= xInSquare &&
        m.xInSquare > xInSquare - 0.5 &&
        m.yInSquare <= yInSquare &&
        m.yInSquare > yInSquare - 0.5))
    });

    if (move) {
        if (!move.ballMoves && !move.promotions) {
            positionPlayMove(position, move);
            kickingPiece = undefined;
        }
    }
    else {
        let ballMove = null;
        let kickMove = possibleMoves.find(m => {
            if (!m.ballMoves)
                return false;
            ballMove = m.ballMoves.find(bm => {
                return bm.bx == file && bm.by == rank;
            });
            return ballMove;
        });
        if (kickMove && !(ballMove.bx == ballMove.sx && ballMove.by == ballMove.sy)) {
            positionPlayMove(position, ballMove);
            kickingPiece = undefined;
        }
    }
    if (move) {
        if (move.bx != undefined)
            position.ball.firstMove = false;
        if (move.ballMoves) {
            possibleMoves = move.ballMoves;
            draggedPiece = position.ball;
            kickingPiece = position[move.sy][move.sx];
        }
        else if (move.promotions) {
            possibleMoves = move.promotions;
        }
        else
            possibleMoves = [];
    } else {
        kickingPiece = undefined;
        possibleMoves = getMovesOfPiece(position, file, rank);
    }
    
    calculateAttacksCounts();
    drawBoard();
    updateInfo();
    if (currentLevel)
        checkLevelPass();
}