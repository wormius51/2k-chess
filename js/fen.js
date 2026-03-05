
function positionFen (position) {
    let fenString = "";
    let spaceCount = 0;
    for (let rank = 0; rank < position.length; rank++) {
        for (let file = 0; file < position[rank].length; file++) {
            let piece = position[rank][file];
            if (!piece) {
                spaceCount++;
                continue;
            }
            if (spaceCount > 0) {
                fenString += spaceCount;
                spaceCount = 0;
            }
            fenString += pieceFenChar(piece);
        }
        if (spaceCount > 0) {
            fenString += spaceCount;
            spaceCount = 0;
        }
        if (rank < position.length -1)
            fenString += "/";
    }

    fenString += " " + (position.turn == "white" ? "w" : "b") + " ";
    if (position.castling.white.short)
        fenString += "K";
    if (position.castling.white.long)
        fenString += "Q";
    if (position.castling.black.short)
        fenString += "k";
    if (position.castling.black.long)
        fenString += "q";
    if (!position.castling.white.short && 
        !position.castling.white.long && 
        !position.castling.black.short && 
        !position.castling.black.long)
        fenString += "-";
    fenString += " ";
    if (position.enpassant)
        fenString += numberToFile(position.enpassant.x) + (position.length - position.enpassant.y);
    else
        fenString += "-";
    return fenString;
}

function pieceFenChar (piece) {
    if (!piece)
        return;
    let c = "";
    switch (piece.type) {
        case "ball":
            return piece.firstMove ? "O" : "o";
        case "pawn":
            c = "P";
            break;
        case "knight":
            c = "N";
            break;
        case "bishop":
            c = "B";
            break;
        case "rook":
            c = "R";
            break;
        case "queen":
            c = "Q";
            break;
        case "king":
            c = "K";
            break;
    }
    if (piece.team == "black")
        c = c.toLowerCase();
    return c;
}

function charToPiece (c, rank) {
    let team = c == c.toUpperCase() ? "white" : "black";
    let piece = undefined;
    switch (c.toUpperCase()) {
        case "P":
            piece = Piece(team, "pawn");
            piece.firstMove = team == "white" ? rank == 6 : rank == 1;
            return piece;
        case "O":
            piece = Piece("non", "ball");
            piece.firstMove = team == "white";
            return piece;
        case "N":
            return Piece(team, "knight");
        case "B":
            return Piece(team, "bishop");
        case "R":
            return Piece(team, "rook");
        case "Q":
            return Piece(team, "queen");
        case "K":
            return Piece(team, "king");
    }
}

function fenToPosition (fen) {
    let position = copyPosition(emptyPosition);
    position.turn = "white";
    position.castling = {white: {short: false, long: false}, black: {short: false, long: false}};
    let strings = fen.split(" ");
    if (strings.length < 1)
        return position;
    let rank = 0;
    let file = 0;
    for (let charIndex = 0; charIndex < strings[0].length; charIndex++) {
        let c = strings[0][charIndex];
        if (c == "/") {
            rank++;
            file = 0;
            continue;
        }
        if (isNaN(c)) {
            let piece = charToPiece(c, rank);
            if (piece.type == "ball") {
                if (!position.ball)
                    position[rank][file] = piece;
                position.ball = piece; 
                if (rank != 3 || file != 4)
                    piece.firstMove = false;
            } else
                position[rank][file] = piece;
            file++;
        }
        else
            file += +c;
    }
    if (strings.length < 2)
        return;
    position.turn = (strings[1] == "b") ? "black" : "white";
    if (strings.length < 3)
        return position;
    for (let charIndex = 0; charIndex < strings[2].length; charIndex++) {
        switch (strings[2][charIndex]) {
            case "K":
                position.castling.white.short = true;
                break;
            case "Q":
                position.castling.white.long = true;
                break;
            case "k":
                position.castling.black.short = true;
                break;
            case "q":
                position.castling.black.long = true;
                break;
        }
    }
    if (strings.length < 3)
        return position;
    if (strings[3] != "-") {
        let file = strings[2].charCodeAt(0) - "a".charCodeAt(0);
        let rank = +strings[2][1];
        position.enpassant = {x: file, y: rank};
    }
    cancleIllegalCastles(position);
    return position;
}

function cancleIllegalCastles (position) {
    let piece = position[0][4];
    if (!piece || (piece.type != "king" && piece.team == "black")) {
        position.castling.black.short = false;
        position.castling.black.long = false;
    }
    piece = position[7][4];
    if (!piece || (piece.type != "king" && piece.team == "white")) {
        position.castling.white.short = false;
        position.castling.white.long = false;
    }
    piece = position[0][0];
    if (!piece || (piece.type != "rook" && piece.team == "black")) {
        position.castling.black.long = false;
    }
    piece = position[0][7];
    if (!piece || (piece.type != "rook" && piece.team == "black")) {
        position.castling.black.short = false;
    }
    piece = position[7][0];
    if (!piece || (piece.type != "rook" && piece.team == "white")) {
        position.castling.black.long = false;
    }
    piece = position[7][7];
    if (!piece || (piece.type != "rook" && piece.team == "white")) {
        position.castling.black.short = false;
    }
} 