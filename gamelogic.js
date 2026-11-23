class Game{
    constructor(fields, playersTurn, playerIsWhite){
        this.fields = fields;
        this.playersTurn = playersTurn;
        this.playerIsWhite = playerIsWhite;
    }
    static createDefaultPosition(){
        let fields = [];
        let defaultRow = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"];
        let blackBackRow = [];
        for (let type of defaultRow){
            blackBackRow.push(new Figure(type, false));
        }
        fields.push(blackBackRow);
        let blackFrontRow = [];
        for (let i = 0; i < 8; i++){
            blackFrontRow.push(new Figure("pawn", false))
        }
        fields.push(blackFrontRow);
        for (let i = 0; i<4; i++){
            let emptyRow = [];
            for (let j = 0; j <8; j++){
                emptyRow.push(null);
            }
            fields.push(emptyRow);
        }
        let whiteFrontRow = [];
        for (let i = 0; i < 8; i++){
            whiteFrontRow.push(new Figure("pawn", true))
        }
        fields.push(whiteFrontRow);
        let whiteBackRow = [];
        for (let type of defaultRow){
            whiteBackRow.push(new Figure(type, true));
        }
        fields.push(whiteBackRow);
        return new Game(fields, true, true);
    }
    
    unlimetedMovementFrom(position, isStraight){
        let vecs = [];
        let directions = [];
        if (isStraight){
            directions = [new Vec2d(0, 1), new Vec2d(0, -1), new Vec2d(1, 0), new Vec2d(-1,0)];
        }else{
            directions = [new Vec2d(1, 1), new Vec2d(-1, -1), new Vec2d(1, -1), new Vec2d(-1,1)];
        }
        for (let direction of directions){
            for (let i = 1; i <8; i++){
                let vec = new Vec2d(i * direction.x,i * direction.y);
                vecs.push(vec);
                if (this.getFigureAt(position.add(vec)) != null){
                    break;
                }
            }
        }
        return vecs;
    }

    // all possible moves for one figure including some illegal ones, which get sorted out in getLegalPossibleMovements
    getPossibleMovements(position){
        let vecs = [];
        let figure = this.fields[position.y][position.x]
        if (figure == null) return [];
        switch (figure.type){
            case "pawn":
                let straightMovement = []
                
                if (figure.isWhite){
                    straightMovement.push(new Vec2d(0, -1));
                }else{
                    straightMovement.push(new Vec2d(0, 1));
                }
                if (figure.isWhite){
                    if (position.y == 6){
                        straightMovement.push(new Vec2d(0, -2))
                    }
                }else{
                    if (position.y == 1){
                        straightMovement.push(new Vec2d(0, 2))
                    }
                }
                for (let move of straightMovement){
                    if (this.getFigureAt(position.add(move)) ==null){
                        vecs.push(move);
                    }
                }
                let attackVecs = [];
                if (!figure.isWhite){
                    attackVecs = [new Vec2d(1, 1), new Vec2d(-1, 1)];
                }else{attackVecs = [new Vec2d(1, -1), new Vec2d(-1, -1)];}

                for (let vec of attackVecs){
                    let targetFigure = this.getFigureAt(position.add(vec));
                    if (targetFigure != null){
                        if (targetFigure.isWhite != figure.isWhite){
                            vecs.push(vec);
                        }
                    }
                }
                break
            case "king":
                vecs = [new Vec2d(0, 1), new Vec2d(1, 1), new Vec2d(1, 0), new Vec2d(1, -1), 
                    new Vec2d(0, -1), new Vec2d(-1, -1), new Vec2d(-1, 0), new Vec2d(-1, 1)];
                // castling movement rules
                if (!figure.hasMoved){
                    let left = true;
                    for (let i = 1; i <4; i++){
                        if (this.fields[position.y][position.x-i] != null){
                            left = false;
                        }
                    }
                    let rook = this.fields[position.y][position.x-4];
                    if (rook != null){
                        if (rook.hasMoved){
                            left = false;
                        }
                    }else{left = false}
                    let right = true;
                    for (let i = 1; i <3; i++){
                        if (this.fields[position.y][position.x+i] != null){
                            right = false;
                        }
                    }
                    rook = this.fields[position.y][position.x+3];
                    if (rook != null){
                        if (rook.hasMoved){
                            right = false;
                        }
                    }else{right = false}
                    if (left){vecs.push(new Vec2d(-2, 0))}
                    if (right){vecs.push(new Vec2d(2, 0))}
                }
                break
            case "knight":
                vecs = [new Vec2d(-1, 2), new Vec2d(1, 2), new Vec2d(2, 1), new Vec2d(2, -1), 
                        new Vec2d(1, -2), new Vec2d(-1, -2), new Vec2d(-2, -1), new Vec2d(-2, 1)];
                break
            case "rook":
                vecs = this.unlimetedMovementFrom(position, true);
                break
            case "bishop":
                vecs = this.unlimetedMovementFrom(position, false);
                break
            case "queen":
                vecs = this.unlimetedMovementFrom(position, true);
                vecs = vecs.concat(
                    this.unlimetedMovementFrom(position, false)
                );
                break;
        
        }
        
        let newVecs = vecs.filter((vec) => {
            
            if (!position.add(vec).isOnBoard()){
                return false;
            }
            
            let figure2 = this.getFigureAt(position.add(vec));
            if (figure2 != null){
                if (figure2.isWhite == figure.isWhite){
                    return false;
                }
            }
            
            return true;
        });
        for (let i =0; i<newVecs.length; i++){
            newVecs[i] = position.add(newVecs[i])
        }
        return newVecs;
    }

    // add the cloning to look for checks
    getLegalPossibleMovements(position){
        let figure = this.getFigureAt(position);
        if (figure == null) return [];

        let movements = this.getPossibleMovements(position);

        return movements.filter((vec) => {
            let gameClone = this.clone();
            gameClone.moveFigure(position, vec);
            gameClone.playersTurn = !gameClone.playersTurn;
            return !gameClone.isCheck();
        });
    }

    // all moves from the side who has the turn (without legal verify)
    getGamePossibleMovements(){
        let vecs = [];
        let whitesTurn = (this.playerIsWhite == this.playersTurn);
        for (let y = 0; y < 8; y++){
            for (let x = 0; x <8; x++){
                let figure = this.fields[y][x];
                if (figure == null){continue;}
                if (figure.isWhite == whitesTurn){
                    let moves = this.getPossibleMovements(new Vec2d(x, y));
                    for (let move of moves){
                        vecs.push(move);
                    }
                }
            }
        }
        return vecs;
    }
    getFigureAt(position){
        if (!position || !position.isOnBoard()) return null;
        return this.fields[position.y][position.x];
    }
    // moves figure from pos a to pos b (returns true if it was a castle)
    moveFigure(fromPos, toPos){
        if (!fromPos.isOnBoard() || !toPos.isOnBoard() || !fromPos){
            return
        }

        let figure = this.getFigureAt(fromPos);
        if (figure != null){
            figure.hasMoved = true
            if (figure.type == "king" && Math.abs(toPos.x-fromPos.x) == 2){
                this.playersTurn = !this.playersTurn;
                this.fields[toPos.y][toPos.x] = figure;
                this.fields[fromPos.y][fromPos.x] = null;
                if (toPos.x == 2){
                    this.fields[fromPos.y][3] = this.fields[fromPos.y][0];
                    this.fields[fromPos.y][0] = null;
                    return {from: new Vec2d(0, fromPos.y), to: new Vec2d(3, fromPos.y)}
                }else{
                    this.fields[fromPos.y][5] = this.fields[fromPos.y][7];
                    this.fields[fromPos.y][7] = null;
                    return {from: new Vec2d(7, fromPos.y), to: new Vec2d(5, fromPos.y)}
                }
                
            }
            this.fields[toPos.y][toPos.x] = figure;
            this.fields[fromPos.y][fromPos.x] = null;
            this.playersTurn = !this.playersTurn;
        }
    }
    makeRandomEngineMove(){
        let allMoves = this.getGameLegalPossibleMovements();
        if (allMoves.length == 0) return null;
        let randomMove = allMoves[
            Math.floor(Math.random() * allMoves.length)
        ];
        console.log(allMoves.length)
        this.moveFigure(randomMove.from, randomMove.to);
        return randomMove
    }
    getGameLegalPossibleMovements(){
        let allMoves = [];
        for (let y = 0; y < 8; y++){
            for (let x = 0; x < 8; x++){
                let position = new Vec2d(x, y);
                let figure = this.getFigureAt(position);
                if (figure == null) continue;
                let isMoveAllowed = figure.isWhite == (this.playerIsWhite == this.playersTurn);
                if (!isMoveAllowed) continue;
                let moves = this.getLegalPossibleMovements(position);
                for (let move of moves){
                    allMoves.push({
                        from: position,
                        to: move
                    });
                }
            }
        }
        return allMoves;
    }
    makeEngineMove(steps = 3) {
        let simulatedGame = this.clone();
        let possibleMoves = simulatedGame.getGameLegalPossibleMovements();
        if (possibleMoves.length === 0) return null;

        let bestEvaluation = -Infinity;
        let bestMove = possibleMoves[0];
        let alpha = -Infinity;
        let beta = Infinity;

        for (let possibleMove of possibleMoves) {
            let clone = simulatedGame.clone();
            clone.moveFigure(possibleMove.from, possibleMove.to);

            let evaluation = this.minimax(clone, steps - 1, alpha, beta, false);

            if (evaluation > bestEvaluation) {
                bestEvaluation = evaluation;
                bestMove = possibleMove;
            }
            alpha = Math.max(alpha, bestEvaluation);
        }

        console.log("best evaluation:", bestEvaluation);
        this.moveFigure(bestMove.from, bestMove.to);
        return bestMove;
    }
    // minimax algo
    minimax(game, steps, alpha, beta, isMaximizing) {
        let possibleMoves = game.getGameLegalPossibleMovements();

        if (possibleMoves.length === 0) {
            if (game.isCheck()) {
                return isMaximizing ? -9999999 : 9999999;
            }
            return 0;
        }
        if (steps <= 0) {return game.getEngineScore();}
        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let move of possibleMoves) {
                let clone = game.clone();
                clone.moveFigure(move.from, move.to);
                let score = this.minimax(clone, steps - 1, alpha, beta, false);
                bestScore = Math.max(bestScore, score);
                alpha = Math.max(alpha, bestScore);
                if (beta <= alpha) {
                    break;
                }
            }
            return bestScore;
        } else {
            let worstScore = Infinity;
            for (let move of possibleMoves) {
                let clone = game.clone();
                clone.moveFigure(move.from, move.to);
                let score = this.minimax(clone, steps - 1, alpha, beta, true);
                worstScore = Math.min(worstScore, score);
                beta = Math.min(beta, worstScore);
                if (beta <= alpha) {
                    break;
                }
            }
            return worstScore;
        }
    }
    getEngineScore(){
        const values = new Map();
        values.set("pawn", 1)
        values.set("knight", 3)
        values.set("bishop", 3)
        values.set("rook", 5)
        values.set("queen", 9)
        values.set("king", 0)
        let blackValues = 0;
        let whiteValues = 0;
        for (let y = 0; y <8; y++){
            for (let x = 0; x<8; x++){
                let position = new Vec2d(x, y);
                let figure = this.getFigureAt(position);
                if (figure == null) continue;
                if (figure.isWhite){
                    whiteValues += values.get(figure.type)
                }else{
                    blackValues += values.get(figure.type)
                }
            }
        }
        if (this.playerIsWhite){
            return blackValues - whiteValues;
        }else{
            return whiteValues - blackValues;
        }
        
    }
    clone(){
        const clonedData = structuredClone(this);
        return Object.assign(Object.create(Object.getPrototypeOf(this)), clonedData);
    }
    // returns true if the side which has the turn is in check
    isCheck(){
        let whitesTurn = (this.playerIsWhite == this.playersTurn);

        let gameClone = this.clone();
        gameClone.playersTurn = !gameClone.playersTurn;
        let possibleMoves = gameClone.getGamePossibleMovements();

        for (let vec of possibleMoves){
            let figure = this.getFigureAt(vec);

            if (figure == null) continue;

            if (figure.type == "king" && figure.isWhite == whitesTurn){
                return true;
            }
        }

        return false;
    }
}
class Vec2d{
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
    add(vec){
        return new Vec2d(this.x + vec.x, this.y + vec.y);
    }
    multiply(vec){
        return new Vec2d(this.x * vec.x, this.y * vec.y);
    }
    isOnBoard(){
        return this.x >= 0 && this.x <= 7 && this.y >= 0 && this.y <= 7;
    }
}

class Figure{
    constructor(type, isWhite){
        this.type = type;
        this.isWhite = isWhite;
        this.hasMoved = false;
    }
}
