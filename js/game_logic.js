/**
 * class that represents the individual squares of the gameboard
 * @param _id used to map changes in the square object to the view (element in the DOM), must match ID of corresponding DOM element
 */
var Square = /** @class */ (function () {
    function Square(_id) {
        this.marked = false;
        this.element = document.getElementById(_id);
        this.value = '';
    }
    /**
     * reflects the changes in the object to the view. If called more than once before reset it will not change state/view
     * @param val ('X' | 'O')
     */
    Square.prototype.placeMark = function (_val) {
        if (!this.marked) {
            this.value = _val;
            this.marked = true;
            if (this.element) {
                this.element.innerText = this.value;
                this.element.classList.remove('gameboard__square_playable');
            }
        }
    };
    /**
     * resets state for new game, retains link to the html element.
     */
    Square.prototype.reset = function () {
        this.value = '';
        this.marked = false;
        if (this.element) {
            this.element.innerText = this.value;
            this.element.classList.add('gameboard__square_playable');
        }
    };
    return Square;
}());
/**
 * class used to evaluate win conditions and iterate through child {@linkcode Square} objects
 * @param _squares {@linkcode Square} array to operate on
 */
var SquareRow = /** @class */ (function () {
    function SquareRow(_squares, _strikethroughStyleClass) {
        this.squares = _squares;
        this.strikethroughStyleClass = _strikethroughStyleClass ? _strikethroughStyleClass : '';
    }
    /**
     * Loops through child squares and concatenates values - used to evaluate win conditions
     * @returns {string} joined values of stored squares ex: 'XOX'
     */
    SquareRow.prototype.fullRow = function () {
        return this.squares.map(function (square) { return square.value; }).join("");
    };
    /**
     * Appends style class to show win condition
     */
    SquareRow.prototype.highlight = function () {
        this.squares.forEach(function (square) { var _a; return (_a = square.element) === null || _a === void 0 ? void 0 : _a.classList.add('gameboard__square_highlight'); });
    };
    /**
     * resets square state, removes any style changes that may have been applied from the last game
     */
    SquareRow.prototype.reset = function () {
        this.squares.forEach(function (square) {
            var _a;
            square.reset();
            (_a = square.element) === null || _a === void 0 ? void 0 : _a.classList.remove('gameboard__square_highlight');
        });
    };
    return SquareRow;
}());
var WinMessages;
(function (WinMessages) {
    WinMessages["xWins"] = "X Wins! click game board to reset";
    WinMessages["oWins"] = "O Wins! click game board to reset";
    WinMessages["draw"] = "Draw, click game board to reset";
})(WinMessages || (WinMessages = {}));
var Game = /** @class */ (function () {
    function Game() {
        var _this = this;
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
        this.board.squares.forEach(function (square) {
            var _a;
            (_a = square.element) === null || _a === void 0 ? void 0 : _a.addEventListener("click", function () {
                _this.gameLoop(square);
            });
        });
        this.updateScoreboard();
    }
    /**
     * resets game state for subsequent games
     */
    Game.prototype.gameReset = function () {
        var _a;
        this.board.reset();
        this.isPlayer1sTurn = true;
        this.gameOver = false;
        this.turn = 0;
        this.updateScoreboard();
        this.setWinMessage('');
        this.gameLog();
        var strikethroughLines = document.getElementsByClassName('gameboard__strikethrough');
        while (strikethroughLines.length > 0) {
            (_a = this.gameboardElement) === null || _a === void 0 ? void 0 : _a.removeChild(strikethroughLines[0]);
        }
    };
    /**
     * Runs each time a square is clicked.
     * Manages the following Game State:
     * * Move validation
     * * Turn order
     * * Turn count
     * * Win Condition Evaluation
     * * Score display
     * @param _clicked square on the gameboard that the user clicked
     */
    Game.prototype.gameLoop = function (_clicked) {
        var _this = this;
        if (!this.gameOver) {
            if (!_clicked.marked) {
                var valueToMark = this.isPlayer1sTurn ? 'X' : 'O';
                this.isPlayer1sTurn = !this.isPlayer1sTurn;
                this.turn++;
                _clicked.placeMark(valueToMark);
                this.gameLog();
                this.updateScoreboard();
                var backgroundClasses_1 = [];
                this.winStates.forEach(function (condition) {
                    if (condition.fullRow() == "XXX" || condition.fullRow() == "OOO") {
                        condition.highlight();
                        backgroundClasses_1.push(condition.strikethroughStyleClass);
                    }
                    if (condition.fullRow() == "XXX") {
                        if (!_this.gameOver) {
                            _this.gameOver = true;
                            _this.setWinMessage(WinMessages.xWins);
                            _this.isPlayer1sTurn = !_this.isPlayer1sTurn;
                            _this.xWinCount++;
                            if (_this.xWinCountElement)
                                _this.xWinCountElement.innerText = _this.xWinCount.toString();
                            _this.updateScoreboard();
                        }
                    }
                    else if (condition.fullRow() == "OOO") {
                        if (!_this.gameOver) {
                            _this.gameOver = true;
                            _this.setWinMessage(WinMessages.oWins);
                            _this.isPlayer1sTurn = !_this.isPlayer1sTurn;
                            _this.oWinCount++;
                            if (_this.oWinCountElement)
                                _this.oWinCountElement.innerText = _this.oWinCount.toString();
                            _this.updateScoreboard();
                        }
                    }
                });
                if (this.turn == 9 && !this.gameOver) {
                    this.setWinMessage(WinMessages.draw);
                    this.gameOver = true;
                }
                backgroundClasses_1.forEach(function (classToAppend) {
                    var _a;
                    var strikethrough = document.createElement("span");
                    strikethrough.classList.add('gameboard__strikethrough', classToAppend);
                    (_a = _this.gameboardElement) === null || _a === void 0 ? void 0 : _a.appendChild(strikethrough);
                });
            }
        }
        else {
            this.gameReset();
        }
    };
    Game.prototype.setWinMessage = function (message) {
        if (this.message)
            this.message.innerText = message;
    };
    Game.prototype.updateScoreboard = function () {
        var mark = "scoreboard__player-" + (this.isPlayer1sTurn ? 'x' : 'o');
        var styleClass = this.gameOver ? 'scoreboard__player-turn-indicator_won' : 'scoreboard__player-turn-indicator_active';
        for (var i = 0; i < this.playerIndicators.length; i++) {
            var player = this.playerIndicators[i];
            player.classList.remove('scoreboard__player-turn-indicator_active');
            player.classList.remove('scoreboard__player-turn-indicator_won');
            if (player.id === mark) {
                player.classList.add(styleClass);
            }
        }
    };
    /**
     *Outputs table that represents the game state for debugging:
     *
     * p1 | p2 | p3
     * p4 | p5 | p6
     * p7 | p8 | p9
     */
    Game.prototype.gameLog = function () {
        console.table([
            [this.p1.value, this.p2.value, this.p3.value],
            [this.p4.value, this.p5.value, this.p6.value],
            [this.p7.value, this.p8.value, this.p9.value]
        ]);
    };
    return Game;
}());
var game = new Game();