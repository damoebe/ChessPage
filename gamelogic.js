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
                let vec = new Vec2d(i, i).multiply(direction);
                vecs.push(vec);
                if (this.getFigureAt(position.add(vec)) != null){
                    break;
                }
            }
        }
        return vecs;
    }

    getPossibleMovements(position){
        let vecs = [];
        let figure = this.fields[position.y][position.x]
        if (figure == null) return null;
        switch (figure.type){
            case "pawn":
                let vec = new Vec2d(0, 1);
                if (!figure.isWhite){
                    vec = new Vec2d(0, -1);
                }
                if (this.getFigureAt(position.add(vec)) ==null){
                    vecs.push(vec);
                }

                let attackVecs = [];
                if (figure.isWhite){
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
            let gameClone = this.clone();
            gameClone.moveFigure(position, position.add(vec));
            if (gameClone.isCheck()){
                return false;
            }
            return true;
        });
        return newVecs;
    }
    getGamePossibleMovements(){
        let vecs = [];
        let whitesTurn = (this.playerIsWhite == this.playersTurn);
        for (let y = 0; y < 8; y++){
            for (let x = 0; x <8; x++){
                if (this.fields[y][x] != null){continue;}
                if (figure.isWhite == whitesTurn){
                    let moves = this.getPossibleMovements(new Vec2d(x, y));
                    for (let move of moves){
                        vecs.push(new Vec2d(x + move.x, y + move.y));
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
    moveFigure(fromPos, toPos){
        let figure = this.fields[fromPos.y][fromPos.x];
        if (figure != null){
            this.fields[toPos.y][toPos.x] = figure;
            this.fields[fromPos.y][fromPos.x] = null;
            // toggle turn
            this.playersTurn = !this.playersTurn;
        }
    }
    clone(){
        return new Game(
            this.fields.map(row => [...row]),
            this.playersTurn,
            this.playerIsWhite
        );
    }
    isCheck(){
        let whitesTurn = (this.playerIsWhite == this.playersTurn);
        let gameClone = this.clone();
        gameClone.playersTurn = !gameClone.playersTurn;
        let possibleMoves = gameClone.getGamePossibleMovements();
        for (let vec of possibleMoves){
            let figure = this.getFigureAt(vec);
            if ((figure.type == "king") && (figure.isWhite == whitesTurn)){
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
    }
}
