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
        for (let collumn in game.fields[row]){
            let figure = game.fields[row][collumn];
            if (figure != null){
                let figureImage = document.createElement("img");
                let color = figure.isWhite?"white":"black";
                figureImage.src = "/assets/" + color + "-" + figure.type + ".png";
                figureImage.classList.add("figure");
                figureImage.style.gridArea = (Number(row) + 1).toString() + "/" + (Number(collumn) +1).toString();
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
            let castleVec = game.moveFigure(new Vec2d(x, y), possibleMove)
            
            if (castleVec){
                document.querySelectorAll("#board .figure").forEach(el => {
                    if (Number(el.style.gridArea.split("/")[1]-1) == castleVec.from.x && 
                        Number(el.style.gridArea.split("/")[0]-1) == castleVec.from.y){
                        el.style.gridArea = (castleVec.to.y +1).toString() + "/" + (castleVec.to.x +1).toString() 
                    }
                });
            }
            document.querySelectorAll("#board .figure").forEach(el => {
                if (Number(el.style.gridArea.split("/")[1]-1) == possibleMove.x && 
                Number(el.style.gridArea.split("/")[0]-1) == possibleMove.y){
                    el.remove()
                }
            });
            figureImage.style.gridArea = (possibleMove.y + 1).toString() + "/" + (possibleMove.x +1).toString();
            removeAllPossibleMoves()
            // engine response TODO: castling show
            let move = game.makeEngineMove()
            if (move == null ){
                if (game.isCheck()){
                    alert("You won (checkmate)")
                }else{
                    alert("draw nga")
                }
            }
            // visuals for engine move
            document.querySelectorAll("#board .figure").forEach(el => {
                if (Number(el.style.gridArea.split("/")[1]-1) == move.to.x && 
                Number(el.style.gridArea.split("/")[0]-1) == move.to.y){
                    el.remove()
                }
            });

            document.querySelectorAll("#board .figure").forEach(el => {
                if (Number(el.style.gridArea.split("/")[1]-1) == move.from.x && 
                Number(el.style.gridArea.split("/")[0]-1) == move.from.y){
                    el.style.gridArea = (Number(move.to.y)+1).toString() + "/"+(Number(move.to.x)+1).toString()
                }
            })
            
        })
        document.getElementById("board").appendChild(possibleMoveDiv)
    }
}
function removeAllPossibleMoves(){
    document.querySelectorAll("#board .possibleMove").forEach(el => el.remove());
}

