let gameActive = false;

const GameBoard = function() {
    const rows = 3;
    const columns = 3;

    let board = [];
    let cells = [];

    // Set three rows and three columns
    for(let i = 0; i < rows; i++) {
        board[i] = [];
        for(let j = 0; j < columns; j++) {
            board[i].push(new Cell());
            cells.push(board[i][j]);
        }
    }

    const getBoard = () => board;

    const getCells = () => cells;

    const reset = () => {
        board = [];
        cells = [];
    }

    return { getBoard, getCells, reset };
};

const GameController = function(player1, player2, gameBoard, displayController) {
    let players = [
        new Player(player1, 1),
        new Player(player2, 2),
    ];

    const getPlayers = () => players;

    let activePlayer = players[0];

    let inactivePlayer = players[1];

    const switchTurns = () => {
        if(activePlayer == players[0]) {
            activePlayer = players[1];
            inactivePlayer = players[0];
        } else {
            activePlayer = players[0];
            inactivePlayer = players[1];
        }
    };

    const getActivePlayer = () => activePlayer;

    const getInactivePlayer = () => inactivePlayer;

    const winGame = player => {
        displayController.getGameInfo().gameInfoRight.innerHTML = `<h2>${player.name} wins!</h2>`;

        setTimeout(() => {
            stop();
        }, 1000);
    }

    const checkWin = cell => {
        const winConditions = [
            [0, 1, 2],
            [0, 3, 6],
            [0, 4, 8],
            [1, 4, 7],
            [2, 5, 8],
            [2, 4, 6],
            [3, 4, 5],
            [6, 7, 8]
        ];

        for(let i = 0; i < winConditions.length; i++) {
            if(gameBoard.getCells()[winConditions[i][0]].symbol == cell.symbol && gameBoard.getCells()[winConditions[i][1]].symbol == cell.symbol && gameBoard.getCells()[winConditions[i][2]].symbol == cell.symbol) {
                if(players[0].symbol == cell.symbol) {
                    return players[0];
                } else {
                    return players[1];
                }
            }
        }
    }

    const tieGame = () => {
        displayController.getGameInfo().gameInfoRight.innerHTML = `<h2>Tie!</h2>`;

        setTimeout(() => {
            stop();
        }, 2000);
    }

    const checkTie = () => {
        for(let i = 0; i < gameBoard.getCells().length; i++) {
            if(gameBoard.getCells()[i].symbol == ""){
                return false;
            }
        }
        return true;
    }

    const checkGameEnd = cell => {
        if(checkWin(cell)) {
            winGame(checkWin(cell));
        } else if(checkTie()) {
            tieGame();
        }
    }

    const start = function() {
        displayController.initGameBoard(gameBoard);
        displayController.updateDisplay(gameBoard, this);
        displayController.getGameInfo().gameInfoRight.innerHTML = '';

        gameActive = true;
    }

    const stop = () => {
        players = [];
        displayController.getGameInfo().gameInfoLeft.innerHTML = "";
        displayController.getGameInfo().gameInfoRight.innerHTML = `<h2>Game Over</h2>`

        gameBoard.reset();

        gameActive = false;
    }

    return { getPlayers, getActivePlayer, getInactivePlayer, switchTurns, checkGameEnd, start};
};

const DisplayController = function(board) {
    const gameInfoLeft = document.querySelector('.game-info-left');
    const gameInfoRight = document.querySelector('.game-info-right');

    const getGameInfo = () => { return { gameInfoLeft, gameInfoRight}};

    const gameBoardArea = document.querySelector('.game-board-area');
    const displayActivePlayer = (activePlayer, inactivePlayer) => {
        gameInfoLeft.innerHTML = `
            <h3>Current Player: ${activePlayer.name} (${activePlayer.symbol})</h3>
            <h4>Next Player: ${inactivePlayer.name} (${inactivePlayer.symbol})</h4>
        `;
    };

    // Create the game board. God I hope this code is readable.
    const initGameBoard = (gameBoard) => {
        board = gameBoard.getBoard();
        gameBoardArea.innerHTML = "";
        for(let i = 0; i < board.length; i++) {
            gameBoardArea.innerHTML += `<div class="row"></div>`
        }

        const rows = document.querySelectorAll('.row');

        // Give each tile a unique identifier. This is so that the tile's correlating cell can be identified in the case of an event triggered from the DOM.
        let tileID = 0;

        for(let i = 0; i < board.length; i++) {
            for(let j = 0; j < rows.length; j++) {
                rows[i].innerHTML += `
                    <button class="tile" id="${tileID}">
                        ${board[i][j].symbol}
                    </button>
                `
                tileID++;
            }
        }
    }

    const updateGameBoard = (gameBoard) => {
        gameBoard.getCells().forEach(cell => {
            const id = gameBoard.getCells().indexOf(cell);
            const tile = document.getElementById(id);
            tile.innerHTML = cell.symbol;
        })
    }

    const updateDisplay = (gameBoard, game) => {
        displayActivePlayer(game.getActivePlayer(), game.getInactivePlayer());

        updateGameBoard(gameBoard);
    }

    return { initGameBoard, updateDisplay, getGameInfo };
};

// Define Cell factory. Cells represent tiles in the game. Their symbols represent which player that they were claimed by.

function Cell() {
    let symbol = "";

    return { symbol }
}

// Define Player factory.

function Player(name, order) {
    const symbol = order == 1 ? "X" : "O";
    
    const takeCell = function(cell, game) {
        if(gameActive && cell.symbol == "") {
            cell.symbol = this.symbol;
            game.checkGameEnd(cell);
            game.switchTurns();
        }
    }


    return { name, symbol, takeCell };
}

let gameBoard;
let board;

let display;

let game;

let tiles;

const startGameBtn = document.querySelector('.start-game-btn');
const playerOneField = document.querySelector('.player-one-field');
const playerTwoField = document.querySelector('.player-two-field');

startGameBtn.addEventListener('click', init)

function init(e) {
    e.preventDefault();

    gameBoard = new GameBoard();
    
    board = gameBoard.getBoard();

    display = new DisplayController(board);
    
    game = new GameController(playerOneField.value, playerTwoField.value, gameBoard, display);
    
    game.start();
    
    tiles = document.querySelectorAll('.tile')
}

document.addEventListener('click', tileClickListener)

function tileClickListener(e) {
    if(e.target.matches('.tile')){
        let tile = e.target
        console.log('click');
        id = tile.getAttribute("id");
        game.getActivePlayer().takeCell(gameBoard.getCells()[id], game);
        display.updateDisplay(gameBoard, game);
    }
}