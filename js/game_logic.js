"use strict";
/**
 * class that represents the individual squares of the gameboard
 * @param _id used to map changes in the square object to the view (element in the DOM), must match ID of corresponding DOM element
 */
class Square {
    constructor(_id) {
        this.marked = false;
        this.element = document.getElementById(_id);
        this.value = '';
    }
    /**
     * reflects the changes in the object to the view. If called more than once before reset it will not change state/view
     * @param val ('X' | 'O')
     */
    placeMark(_val) {
        if (!this.marked) {
            this.value = _val;
            this.marked = true;
            if (this.element) {
                this.element.innerText = this.value;
                this.element.classList.remove('gameboard__square_playable');
            }
        }
    }
    /**
     * resets state for new game, retains link to the html element.
     */
    reset() {
        this.value = '';
        this.marked = false;
        if (this.element) {
            this.element.innerText = this.value;
            this.element.classList.add('gameboard__square_playable');
        }
    }
}
/**
 * class used to evaluate win conditions and iterate through child {@linkcode Square} objects
 * @param _squares {@linkcode Square} array to operate on
 * @param _strikethroughStyleClass css style class from ../css/styles.scss
 */
class SquareRow {
    constructor(_squares, _strikethroughStyleClass) {
        this.squares = _squares;
        this.strikethroughStyleClass = _strikethroughStyleClass ? _strikethroughStyleClass : '';
    }
    /**
     * Loops through child squares and concatenates values - used to evaluate win conditions
     * @returns {string} joined values of stored squares ex: 'XOX'
     */
    getFullRow() {
        return this.squares.map((square) => square.value).join("");
    }
    /**
     * Appends style class to show win condition
     */
    highlight() {
        this.squares.forEach(square => { var _a; return (_a = square.element) === null || _a === void 0 ? void 0 : _a.classList.add('gameboard__square_highlight'); });
    }
    /**
     * @returns returns subarray of {@linkcode Square} children that aren't marked.
     */
    getUnmarked() {
        return this.squares.filter(square => square.marked == false);
    }
    /**
     * resets square state, removes any style changes that may have been applied from the last game
     */
    reset() {
        this.squares.forEach(square => {
            var _a;
            square.reset();
            (_a = square.element) === null || _a === void 0 ? void 0 : _a.classList.remove('gameboard__square_highlight');
        });
    }
}
/**
 * class used to represent a second, artificial player
 * @param _WinConditionsToEvaluate reference to the games win state conditions
 */
class Bot {
    constructor(_WinConditionsToEvaluate) {
        this.WinConditionsToEvaluate = _WinConditionsToEvaluate;
    }
    generateMove(game) {
        let returnValue = null;
        const availableSquares = game.getUnmarked();
        // set random choice to start: 
        returnValue = this.getRandomSquare(availableSquares);
        // select moves that would progress the bot to victory:
        const movesToProgress = this.WinConditionsToEvaluate.filter(condition => condition.getFullRow() == 'O');
        // select moves that would win the game 
        const movesToWin = this.WinConditionsToEvaluate.filter(condition => condition.getFullRow() == 'OO');
        // select blocking moves that would lose the game to not play
        const movesToBlockOpponent = this.WinConditionsToEvaluate.filter(condition => condition.getFullRow() == 'XX');
        if (movesToProgress.length) {
            const i = this.getRandomIndex(movesToProgress.length);
            const potentialMoves = movesToProgress[i].getUnmarked();
            returnValue = this.getRandomSquare(potentialMoves);
        }
        if (movesToBlockOpponent[0])
            returnValue = movesToBlockOpponent[0].getUnmarked()[0];
        if (movesToWin[0])
            returnValue = movesToWin[0].getUnmarked()[0];
        return returnValue;
    }
    getRandomIndex(length) {
        return length > 1 ? Math.floor(Math.random() * length) : 0;
    }
    getRandomSquare(_squares) {
        return _squares[this.getRandomIndex(_squares.length)];
    }
}
var WinMessages;
(function (WinMessages) {
    WinMessages["xWins"] = "X Wins! click game board to reset";
    WinMessages["oWins"] = "O Wins! click game board to reset";
    WinMessages["draw"] = "Draw, click game board to reset";
})(WinMessages || (WinMessages = {}));
class Game {
    constructor() {
        this.testing = false;
        // game tiles: 
        this.p1 = new Square('gameboard__square_position-1');
        this.p2 = new Square('gameboard__square_position-2');
        this.p3 = new Square('gameboard__square_position-3');
        this.p4 = new Square('gameboard__square_position-4');
        this.p5 = new Square('gameboard__square_position-5');
        this.p6 = new Square('gameboard__square_position-6');
        this.p7 = new Square('gameboard__square_position-7');
        this.p8 = new Square('gameboard__square_position-8');
        this.p9 = new Square('gameboard__square_position-9');
        // turn counter:
        this.turn = 0;
        // turn boolean:
        this.isPlayer1sTurn = true;
        this.gameOver = false;
        this.gameboardElement = document.getElementById('gameboard__container');
        this.xWinCount = 0;
        this.oWinCount = 0;
        this.xWinCountElement = document.getElementById('scoreboard__player-x-score');
        this.oWinCountElement = document.getElementById('scoreboard__player-o-score');
        this.message = document.getElementById('scoreboard__message');
        this.board = new SquareRow([this.p1, this.p2, this.p3, this.p4, this.p5, this.p6, this.p7, this.p8, this.p9]);
        this.playerIndicators = document.getElementsByClassName('scoreboard__player-turn-indicator');
        /**
        win states is an array of {@linkcode row} objects used to see if the game has been won.
    
        winStates = [new row([this.p1, this.p2, this.p3]), ...]
        this first item represents the top row of the game.
        **(p1 | p2 | p3)*
        * p4 | p5 | p6
        * p7 | p8 | p9
        */
        this.winStates = [
            new SquareRow([this.p1, this.p2, this.p3], 'gameboard__strikethrough_squares-1-2-3'),
            new SquareRow([this.p4, this.p5, this.p6], 'gameboard__strikethrough_squares-4-5-6'),
            new SquareRow([this.p7, this.p8, this.p9], 'gameboard__strikethrough_squares-7-8-9'),
            new SquareRow([this.p3, this.p5, this.p7], 'gameboard__strikethrough_squares-3-5-7'),
            new SquareRow([this.p1, this.p5, this.p9], 'gameboard__strikethrough_squares-1-5-9'),
            new SquareRow([this.p1, this.p4, this.p7], 'gameboard__strikethrough_squares-1-4-7'),
            new SquareRow([this.p2, this.p5, this.p8], 'gameboard__strikethrough_squares-2-5-8'),
            new SquareRow([this.p3, this.p6, this.p9], 'gameboard__strikethrough_squares-3-6-9'),
        ];
        this.AI = new Bot(this.winStates);
        this.board.squares.forEach(square => {
            var _a;
            (_a = square.element) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
                this.gameLoop(square, false);
            });
        });
        this.updateScoreboard();
    }
    /**
     * resets game state for subsequent games
     */
    gameReset() {
        var _a;
        this.board.reset();
        this.isPlayer1sTurn = true;
        this.gameOver = false;
        this.turn = 0;
        this.updateScoreboard();
        this.setWinMessage('');
        // this.gameLog();
        const strikethroughLines = document.getElementsByClassName('gameboard__strikethrough');
        while (strikethroughLines.length > 0) {
            (_a = this.gameboardElement) === null || _a === void 0 ? void 0 : _a.removeChild(strikethroughLines[0]);
        }
    }
    /**
     * Runs each time a square is clicked.
     * Manages the following Game State:
     * * Move validation
     * * Turn order
     * * Turn count
     * * Win Condition Evaluation
     * * Score display
     * @param _clicked target square on the gameboard that the user clicked or the bot chose
     */
    gameLoop(_clicked, _ai) {
        if (!this.gameOver) {
            if (!_clicked.marked) {
                const valueToMark = this.isPlayer1sTurn ? 'X' : 'O';
                if ((valueToMark === 'X' && _ai === false) || (valueToMark == 'O' && _ai == true)) {
                    this.isPlayer1sTurn = !this.isPlayer1sTurn;
                    this.turn++;
                    _clicked.placeMark(valueToMark);
                    // this.gameLog();
                    this.updateScoreboard();
                    let backgroundClasses = [];
                    this.winStates.forEach(condition => {
                        if (condition.getFullRow() == "XXX" || condition.getFullRow() == "OOO") {
                            condition.highlight();
                            backgroundClasses.push(condition.strikethroughStyleClass);
                        }
                        if (condition.getFullRow() == "XXX") {
                            if (!this.gameOver) {
                                this.gameOver = true;
                                this.setWinMessage(WinMessages.xWins);
                                this.isPlayer1sTurn = !this.isPlayer1sTurn;
                                this.xWinCount++;
                                if (this.xWinCountElement)
                                    this.xWinCountElement.innerText = this.xWinCount.toString();
                                this.updateScoreboard();
                            }
                        }
                        else if (condition.getFullRow() == "OOO") {
                            if (!this.gameOver) {
                                this.gameOver = true;
                                this.setWinMessage(WinMessages.oWins);
                                this.isPlayer1sTurn = !this.isPlayer1sTurn;
                                this.oWinCount++;
                                if (this.oWinCountElement)
                                    this.oWinCountElement.innerText = this.oWinCount.toString();
                                this.updateScoreboard();
                            }
                        }
                    });
                    if (this.turn == 9 && !this.gameOver) {
                        this.setWinMessage(WinMessages.draw);
                        this.gameOver = true;
                    }
                    backgroundClasses.forEach(classToAppend => {
                        var _a;
                        const strikethrough = document.createElement("span");
                        strikethrough.classList.add('gameboard__strikethrough', classToAppend);
                        strikethrough.addEventListener("click", () => {
                            this.gameReset();
                        });
                        (_a = this.gameboardElement) === null || _a === void 0 ? void 0 : _a.appendChild(strikethrough);
                    });
                    if (valueToMark === 'X' && !this.gameOver && !this.testing) {
                        const BotTurn = this.AI.generateMove(this.board);
                        if (BotTurn)
                            setTimeout(() => {
                                this.gameLoop(BotTurn, true);
                            }, 1000);
                    }
                }
            }
        }
        else {
            this.gameReset();
        }
    }
    setWinMessage(message) {
        if (this.message)
            this.message.innerText = message;
    }
    updateScoreboard() {
        const mark = `scoreboard__player-${this.isPlayer1sTurn ? 'x' : 'o'}`;
        const styleClass = this.gameOver ? 'scoreboard__player-turn-indicator_won' : 'scoreboard__player-turn-indicator_active';
        for (let i = 0; i < this.playerIndicators.length; i++) {
            const player = this.playerIndicators[i];
            player.classList.remove('scoreboard__player-turn-indicator_active');
            player.classList.remove('scoreboard__player-turn-indicator_won');
            if (player.id === mark) {
                player.classList.add(styleClass);
            }
        }
    }
    /**
     * Outputs table that represents the game state for debugging:
     * call game.gameLog() from the console!
     *
     * p1 | p2 | p3
     * p4 | p5 | p6
     * p7 | p8 | p9
     */
    gameLog() {
        console.table([
            [this.p1.value, this.p2.value, this.p3.value],
            [this.p4.value, this.p5.value, this.p6.value],
            [this.p7.value, this.p8.value, this.p9.value]
        ]);
    }
}
const game = new Game();
