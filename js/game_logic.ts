/**
 * class that represents the individual squares of the gameboard
 * @param _id used to map changes in the square object to the view (element in the DOM), must match ID of corresponding DOM element
 */
class Square {
	public value: string;
	public marked: boolean;
	public element: HTMLElement | null;
	constructor(_id: string) {
		this.marked = false;
		this.element = document.getElementById(_id);
		this.value = '';
	}

	/**
	 * reflects the changes in the object to the view. If called more than once before reset it will not change state/view
	 * @param val ('X' | 'O')
	 */
	public placeMark(_val: string): void {
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
	public reset(): void {
		this.value = '';
		this.marked = false;
		if (this.element) {
			this.element.innerText = this.value;
			this.element.classList.add('gameboard__square_playable')
		}
	}
}

/**
 * class used to evaluate win conditions and iterate through child {@linkcode Square} objects
 * @param _squares {@linkcode Square} array to operate on
 */
class SquareRow {
	public squares: Square[];
	public strikethroughStyleClass: string;
	constructor(_squares: Square[], _strikethroughStyleClass?: string) {
		this.squares = _squares;
		this.strikethroughStyleClass = _strikethroughStyleClass ? _strikethroughStyleClass : '';
	}

	/**
	 * Loops through child squares and concatenates values - used to evaluate win conditions
	 * @returns {string} joined values of stored squares ex: 'XOX'
	 */
	fullRow(): string {
		return this.squares.map((square) => square.value).join("")
	}

	/**
	 * Appends style class to show win condition
	 */
	highlight(): void {
		this.squares.forEach(square => square.element?.classList.add('gameboard__square_highlight'));
	}

	/**
	 * resets square state, removes any style changes that may have been applied from the last game
	 */
	reset(): void {
		this.squares.forEach(square => {
			square.reset();
			square.element?.classList.remove('gameboard__square_highlight')
		})
	}
}

enum WinMessages {
	xWins = "X Wins! click game board to reset",
	oWins = "O Wins! click game board to reset",
	draw = "Draw, click game board to reset",
}

class Game {
	// game tiles: 
	private p1 = new Square('gameboard__square_position-1');
	private p2 = new Square('gameboard__square_position-2');
	private p3 = new Square('gameboard__square_position-3');
	private p4 = new Square('gameboard__square_position-4');
	private p5 = new Square('gameboard__square_position-5');
	private p6 = new Square('gameboard__square_position-6');
	private p7 = new Square('gameboard__square_position-7');
	private p8 = new Square('gameboard__square_position-8');
	private p9 = new Square('gameboard__square_position-9');
	// turn counter:
	private turn = 0;
	// turn boolean:
	private isPlayer1sTurn = true;
	private gameOver = false
	private gameboardElement = document.getElementById('gameboard__container');
	private xWinCount = 0;
	private oWinCount = 0;
	private xWinCountElement = document.getElementById('scoreboard__player-x-score');
	private oWinCountElement = document.getElementById('scoreboard__player-o-score');
	private message = document.getElementById('scoreboard__message');
	private board = new SquareRow([this.p1, this.p2, this.p3, this.p4, this.p5, this.p6, this.p7, this.p8, this.p9]);
	private playerIndicators = document.getElementsByClassName('scoreboard__player-turn-indicator');

	/** 
	win states is an array of {@linkcode row} objects used to see if the game has been won. 

	winStates = [new row([this.p1, this.p2, this.p3]), ...]  
	this first item represents the top row of the game.  
	**(p1 | p2 | p3)*  
	* p4 | p5 | p6   
	* p7 | p8 | p9  
	*/
	private winStates = [
		new SquareRow([this.p1, this.p2, this.p3], 'gameboard__strikethrough_squares-1-2-3'),
		new SquareRow([this.p4, this.p5, this.p6], 'gameboard__strikethrough_squares-4-5-6'),
		new SquareRow([this.p7, this.p8, this.p9], 'gameboard__strikethrough_squares-7-8-9'),
		new SquareRow([this.p3, this.p5, this.p7], 'gameboard__strikethrough_squares-3-5-7'),
		new SquareRow([this.p1, this.p5, this.p9], 'gameboard__strikethrough_squares-1-5-9'),
		new SquareRow([this.p1, this.p4, this.p7], 'gameboard__strikethrough_squares-1-4-7'),
		new SquareRow([this.p2, this.p5, this.p8], 'gameboard__strikethrough_squares-2-5-8'),
		new SquareRow([this.p3, this.p6, this.p9], 'gameboard__strikethrough_squares-3-6-9'),
	]


	constructor() {
		this.board.squares.forEach(square => {
			square.element?.addEventListener("click", () => {
				this.gameLoop(square)
			})
		})
		this.updateScoreboard();
	}

	/**
	 * resets game state for subsequent games
	 */
	private gameReset(): void {
		this.board.reset();
		this.isPlayer1sTurn = true;
		this.gameOver = false;
		this.turn = 0;
		this.updateScoreboard();
		this.setWinMessage('');
		// this.gameLog();
		const strikethroughLines = document.getElementsByClassName('gameboard__strikethrough')
		while (strikethroughLines.length > 0) {
			this.gameboardElement?.removeChild(strikethroughLines[0])
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
	 * @param _clicked square on the gameboard that the user clicked 
	 */
	public gameLoop(_clicked: Square): void {
		if (!this.gameOver) {
			if (!_clicked.marked) {
				const valueToMark = this.isPlayer1sTurn ? 'X' : 'O';
				this.isPlayer1sTurn = !this.isPlayer1sTurn;
				this.turn++;
				_clicked.placeMark(valueToMark);
				// this.gameLog();
				this.updateScoreboard();

				let backgroundClasses: string[] = [];
				this.winStates.forEach(condition => {
					if (condition.fullRow() == "XXX" || condition.fullRow() == "OOO") {
						condition.highlight();
						backgroundClasses.push(condition.strikethroughStyleClass);
					}
					if (condition.fullRow() == "XXX") {
						if (!this.gameOver) {
							this.gameOver = true;
							this.setWinMessage(WinMessages.xWins);
							this.isPlayer1sTurn = !this.isPlayer1sTurn;
							this.xWinCount++;
							if (this.xWinCountElement) this.xWinCountElement.innerText = this.xWinCount.toString();
							this.updateScoreboard();
						}
					}
					else if (condition.fullRow() == "OOO") {
						if (!this.gameOver) {
							this.gameOver = true;
							this.setWinMessage(WinMessages.oWins);
							this.isPlayer1sTurn = !this.isPlayer1sTurn;
							this.oWinCount++;
							if (this.oWinCountElement) this.oWinCountElement.innerText = this.oWinCount.toString();
							this.updateScoreboard();
						}
					}
				})
				if (this.turn == 9 && !this.gameOver) {
					this.setWinMessage(WinMessages.draw);
					this.gameOver = true;
				}

				backgroundClasses.forEach(classToAppend => {
					const strikethrough = document.createElement("span");
					strikethrough.classList.add('gameboard__strikethrough', classToAppend);
					this.gameboardElement?.appendChild(strikethrough)
				})
			}
		}
		else {
			this.gameReset()
		}
	}

	private setWinMessage(message: string) {
		if (this.message) this.message.innerText = message
	}

	private updateScoreboard(): void {
		const mark = `scoreboard__player-${this.isPlayer1sTurn ? 'x' : 'o'}`;
		const styleClass = this.gameOver ? 'scoreboard__player-turn-indicator_won' : 'scoreboard__player-turn-indicator_active';
		for (let i = 0; i < this.playerIndicators.length; i++) {
			const player = this.playerIndicators[i]
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
	private gameLog() {
		console.table([
			[this.p1.value, this.p2.value, this.p3.value],
			[this.p4.value, this.p5.value, this.p6.value],
			[this.p7.value, this.p8.value, this.p9.value]
		])
	}
}

const game = new Game();





