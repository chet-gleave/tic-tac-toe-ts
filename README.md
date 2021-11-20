# tic-tac-toe-ts

tic-tac-toe-ts is a demonstration of my ability to write TypeScript by creating a game of Tic-tac-toe.
![screenshot of game](./images/screenshot.png)

## Motivation
This project serves as a showcase of my ability to use TypeScript to maintain complex app state outside of a web framework.

## Technology Used
- TypeScript
- Sass
- HTML5
- Node.js

## Code style 
BEM — Block Element Modifier

## Installation

Using [Node.js](https://nodejs.org/en/) install [TypeScript](https://www.typescriptlang.org/download) and [Sass](https://sass-lang.com/install)

```bash
npm install -g typescript
npm install -g sass
```
**To make changes to the TypeScript:**  
Using your command line, navigate to the tic-tac-toe-ts\js directory, and run

```bash
tsc --watch game_logic
# Any changes made in game_logic.ts will now be compiled to game_logic.js
```
  
- - -

**To make changes to the Sass:**  
Using your command line, navigate to the tic-tac-toe-ts\css directory, and run
```bash
sass --watch styles.scss styles.css
# Any changes made in styles.scss will now be compiled to styles.css
```

## Credits
The SVG used to create the strikethrough effect is the minus icon from Font Awesome. No modifications were made.
* [Minus Icon | Font Awesome](https://fontawesome.com/v5.15/icons/minus?style=solid)
* [License](https://fontawesome.com/license)

## License
[MIT](https://choosealicense.com/licenses/mit/)