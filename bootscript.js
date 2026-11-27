// init board visually

function init_board_mosaics(){
    let isWhite = true;
    for (let i = 0; i < 8*8; i++){
        if (i%8 != 0 ){isWhite = !isWhite;}
        let field = document.createElement("div");
        field.classList.add("field");
        field.style.gridArea = (Math.floor(i / 8) + 1).toString() + "/" + ((i % 8) + 1).toString();
        // cancel figure selection
        field.addEventListener("click", function(){
            removeAllPossibleMoves()
        })
        if (isWhite){
            field.style.backgroundColor = "rgb(255, 255, 255)";
        }else{
            field.style.backgroundColor = "rgb(98, 170, 108)";
        }
        
        
        document.getElementById("board").appendChild(field);
    }
}
init_board_mosaics()
function start_default_game(){
    let game = Game.createDefaultPosition();
    for (let row in game.fields){
        for (let column in game.fields[row]){
            let figure = game.fields[row][column];
            if (figure != null){
                let figureImage = document.createElement("img");
                let color = figure.isWhite?"white":"black";
                figureImage.src = "./assets/" + color + "-" + figure.type + ".png";
                figureImage.classList.add("figure");
                figureImage.style.gridArea = (Number(row) + 1).toString() + "/" + (Number(column) +1).toString();
                figureImage.addEventListener("click", function(){
                    let x = Number(figureImage.style.gridArea.split("/")[1])-1;
                    let y = Number(figureImage.style.gridArea.split("/")[0])-1;
                    if (figure.isWhite == ((game.playerIsWhite == game.playersTurn))){
                        showPossibleMovements(game.getLegalPossibleMovements(new Vec2d(x, y)), game, figureImage)
                    }
                    
                })
                document.getElementById("board").appendChild(figureImage);
            }
        }
    }
}
start_default_game()
function showPossibleMovements(possibleMoves, game, figureImage){
    removeAllPossibleMoves()
    for (let possibleMove of possibleMoves){
        let possibleMoveDiv = document.createElement("div")
        possibleMoveDiv.classList.add("possibleMove")
        possibleMoveDiv.style.gridArea = (possibleMove.y + 1) + "/" + (possibleMove.x + 1);
        possibleMoveDiv.addEventListener("click", function(){
            // move figure
            let x = Number(figureImage.style.gridArea.split("/")[1])-1;
            let y = Number(figureImage.style.gridArea.split("/")[0])-1;
            let movements = game.moveFigure(new Vec2d(x, y), possibleMove)
            moveFigures(movements)
            removeAllPossibleMoves()
            executeAsync(function (){
                // engine response TODO: castling show
                let engineMoves = game.makeEngineMove()
                if (engineMoves == null ){
                    if (game.isCheck()){
                        alert("You won (checkmate)")
                    }else{
                        alert("draw nga")
                    }
                }
                moveFigures(engineMoves)
            })
            
        })
        document.getElementById("board").appendChild(possibleMoveDiv)
    }
}
// move elements from pos A to B using a map to store multiple movements <Vec2d, Vec2d>
function moveFigures(map){
    map.forEach(function (value, key){
        document.querySelectorAll("#board .figure").forEach(el => {
            if (Number(el.style.gridArea.split("/")[1]-1) == value.x &&
                Number(el.style.gridArea.split("/")[0]-1) == value.y){
                el.remove()
            }
        });
        document.querySelectorAll("#board .figure").forEach(el => {
            if (Number(el.style.gridArea.split("/")[1]-1) == key.x &&
                Number(el.style.gridArea.split("/")[0]-1) == key.y){
                el.style.gridArea = (value.y +1).toString() + "/" + (value.x +1).toString()
            }
        });
    })
}
function executeAsync(func) {
    setTimeout(func, 0);
}
function removeAllPossibleMoves(){
    document.querySelectorAll("#board .possibleMove").forEach(el => el.remove());
}

