// init board visually

function init_board_visuals(){
    let isWhite = true;
    for (let i = 0; i < 8*8; i++){
        if (i%8 != 0 ){isWhite = !isWhite;}
        let field = document.createElement("div");
        field.classList.add("field");
        if (isWhite){
            field.style.backgroundColor = "rgb(255, 255, 255)";
        }else{
            field.style.backgroundColor = "rgb(136, 241, 151)";
        }
        
        
        document.getElementById("board").appendChild(field);
    }
}
init_board_visuals()
