const resultText = document.getElementById("resaltText");

function updateInfo () {
    switch (positionResult(position)) {
        case "playing":
            resultText.innerHTML = "";
            break;
        case "goal white":
            resultText.innerHTML = "White wins by goal";
            break;
        case "goal black":
            resultText.innerHTML = "Black wins by goal";
            break;
        case "mate white":
            resultText.innerHTML = "White wins by checkmate";
            break;
        case "mate black":
            resultText.innerHTML = "Black wins by checkmate";
            break;
        case "stalemate":
            resultText.innerHTML = "Draw by stalemate";
            break;
    }
}