/// <reference path='game_logic.ts'>
beforeEach(function() {
    let oldTemplates = document.getElementsByClassName('template');
    for(let i = 0; i<oldTemplates.length; i++){
        document.body.removeChild(oldTemplates[i])
    }
    // @ts-ignore-next-line: Cannot find name '__html__'. Old package that I can't find types for
    const template = __html__['index.html'];
    const container = document.createElement('div');
    container.classList.add('template')
    container.innerHTML = template;
    document.body.appendChild(container);
});

describe('Game Logic', (): void => {
    it('should handle X winning.', (): void => {
        let game: Game = new Game();
        game.testing = true;
        game.gameLoop(game.p1, false);
        game.gameLoop(game.p4, true);
        game.gameLoop(game.p2, false);
        game.gameLoop(game.p5, true);
        game.gameLoop(game.p3, false);
        
        expect(game.gameOver).toEqual(true);
        expect(game.message?.innerText).toEqual("X Wins! click game board to reset");
    });

    it('should handle two win conditions being met, while only counting for one win.', (): void => {
        let game: Game = new Game();
        game.testing = true;
        game.gameLoop(game.p1, false);
        game.gameLoop(game.p2, true);
        game.gameLoop(game.p3, false);
        game.gameLoop(game.p6, true);
        game.gameLoop(game.p9, false);
        game.gameLoop(game.p8, true);
        game.gameLoop(game.p7, false);
        game.gameLoop(game.p4, true);
        game.gameLoop(game.p5, false);

        expect(game.gameOver).toEqual(true);
        expect(game.message?.innerText).toEqual("X Wins! click game board to reset");
        expect(game.xWinCount).toEqual(1)
    });

    it('Should hanlde O Winning.', (): void => {
        let game: Game = new Game();
        game.testing = true;
        game.gameLoop(game.p1, false);
        game.gameLoop(game.p4, true);
        game.gameLoop(game.p2, false);
        game.gameLoop(game.p5, true);
        game.gameLoop(game.p7, false);
        game.gameLoop(game.p6, true);

        expect(game.gameOver).toEqual(true);
        expect(game.message?.innerText).toEqual("O Wins! click game board to reset");
    });

    it('Should handle a tie.', (): void => {
        let game: Game = new Game();
        game.testing = true;
        game.gameLoop(game.p1, false);
        game.gameLoop(game.p4, true);
        game.gameLoop(game.p2, false);
        game.gameLoop(game.p5, true);
        game.gameLoop(game.p6, false);
        game.gameLoop(game.p3, true);
        game.gameLoop(game.p9, false);
        game.gameLoop(game.p8, true);
        game.gameLoop(game.p7, false);

        expect(game.gameOver).toEqual(true);
        expect(game.message?.innerText).toEqual("Draw, click game board to reset");
        expect(game.xWinCount).toEqual(0);
        expect(game.oWinCount).toEqual(0);
    });

    it('Should start a new game after a game is won.', (): void => {
        let game: Game = new Game();
        game.testing = true;
        game.gameLoop(game.p1, false);
        game.gameLoop(game.p2, true);
        game.gameLoop(game.p3, false);
        game.gameLoop(game.p6, true);
        game.gameLoop(game.p9, false);
        game.gameLoop(game.p8, true);
        game.gameLoop(game.p7, false);
        game.gameLoop(game.p4, true);
        game.gameLoop(game.p5, false);

        expect(game.gameOver).toEqual(true);
        expect(game.message?.innerText).toEqual("X Wins! click game board to reset");

        game.gameLoop(game.p1, false);

        expect(game.message?.innerText).toEqual("");
        expect(game.gameOver).toEqual(false);
        expect(game.board.getUnmarked().length).toBe(9);
        expect(game.xWinCount).toBe(1);
    });
    
    it('Should handle a large number of games.', (): void => {
        let game: Game = new Game();
        game.testing = true;
        for (let i = 0; i<50000; i++){
            if(game.gameOver) game.gameReset();
            const square = game.AI.generateMove(game.board)
            if (square) game.gameLoop(square, !game.isPlayer1sTurn); 
        }
        expect(game.xWinCount).toBeGreaterThan(0);
        expect(game.oWinCount).toBeGreaterThan(0);
    });

    it('Should handle player spamming input before bot can play turn.', (): void => {
        let game: Game = new Game();
        game.testing = true;
        for (let i = 0; i<100; i++){
            const square = game.AI.generateMove(game.board)
            if (square) game.gameLoop(square, false); 
        }
        const square = game.AI.generateMove(game.board)
        if (square) game.gameLoop(square, true); 

        expect(game.turn).toEqual(2);
    });
});