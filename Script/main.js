(function () {
  const Player = (_name, _marker) => {
    const getName = () => _name;
    const getMarker = () => _marker;
    return { getName, getMarker };
  };

  const GameBoard = (function () {
    let _board = [
      ["", "", ""],
      ["", "", ""],
      ["", "", ""],
    ];
    let _availableMovesCount = 9;

    const getBoard = () => _board;

    const resetBoard = () => {
      _board = [
        ["", "", ""],
        ["", "", ""],
        ["", "", ""],
      ];
      _availableMovesCount = 9;
    };

    const setTile = (i, j, value) => {
      if (_board[i][j] !== "") {
        return false;
      }

      _board[i][j] = value;
      _availableMovesCount--;
      return true;
    };

    const getAvailableMovesCount = () => _availableMovesCount;

    const _getAvailableMoves = () => {
      const res = _board.reduce((acum, row, i) => {
        row.forEach((cell, j) => {
          if (cell === "") {
            acum.push({ i, j });
          }
        });

        return acum;
      }, []);

      return res;
    };

    const getRandomMove = () => {
      const moves = _getAvailableMoves();
      const randomIndex = parseInt(Math.random() * moves.length);

      return moves[randomIndex];
    };

    return { getBoard, resetBoard, setTile, getAvailableMovesCount, getRandomMove };
  })();

  const GameController = (function () {
    // Elements
    const _player1Input = document.querySelector("#player1Input");
    const _player2Input = document.querySelector("#player2Input");
    const _vsAiInput = document.querySelector("#vsAI");
    //   const _aiLevelInput = document.querySelector("#AiLevel");

    // Globals
    let _player1;
    let _player2;
    let _currentPlayer;
    let _results;
    let _finished;
    let _winner;
    let _vsAI;
    //   let _aiLevel;

    const start = () => {
      GameBoard.resetBoard();

      if (_player1Input.value.trim() === "") {
        _player1 = Player("Player 1", "X");
      } else {
        _player1 = Player(_player1Input.value.trim(), "X");
      }

      if (_vsAiInput.checked) {
        _vsAI = true;
        //   _aiLevel = _aiLevelInput.value;
        _player2 = Player("AI", "O");
      } else if (_player2Input.value.trim() === "") {
        _player2 = Player("Player 2", "O");
      } else {
        _player2 = Player(_player2Input.value.trim(), "O");
      }

      _results = {};
      _results[_player1.getMarker()] = { rows: [0, 0, 0], columns: [0, 0, 0], diag: 0, antiDiag: 0 };
      _results[_player2.getMarker()] = { rows: [0, 0, 0], columns: [0, 0, 0], diag: 0, antiDiag: 0 };

      _currentPlayer = _player1;
      DisplayController.setCurrentPlayer(_currentPlayer);

      _finished = false;

      _winner = "";

      DisplayController.renderBoard(_playMove);
    };

    const _playMove = (i, j, tile) => {
      if (_finished) {
        return;
      }

      const success = GameBoard.setTile(i, j, _currentPlayer.getMarker());

      if (success) {
        tile.textContent = _currentPlayer.getMarker();
        _checkResult(i, j);

        if (!_finished) {
          _currentPlayer = _currentPlayer == _player1 ? _player2 : _player1;
          DisplayController.setCurrentPlayer(_currentPlayer);
          if (_vsAI && _currentPlayer == _player2) {
            _aiMove();
          }
        } else {
          DisplayController.announceWinner(_winner);
        }
      }
    };

    const _aiMove = () => {
      const { i, j } = GameBoard.getRandomMove();
      const tile = document.querySelector(`.tile[data-id="${i}-${j}"]`);

      _playMove(i, j, tile);
    };

    const _checkResult = (i, j) => {
      const boardSize = GameBoard.getBoard().length;
      const marker = _currentPlayer.getMarker();

      _results[marker].rows[i]++;
      _results[marker].columns[j]++;

      if (i === j) {
        _results[marker].diag++;
      }

      if (i + j === boardSize - 1) {
        _results[marker].antiDiag++;
      }

      if (_results[marker].rows[i] === boardSize || _results[marker].columns[j] === boardSize || _results[marker].diag === boardSize || _results[marker].antiDiag === boardSize) {
        _finished = true;
        _winner = _currentPlayer.getName();
      } else if (GameBoard.getAvailableMovesCount() === 0) {
        _finished = true;
        _winner = "Tie";
      }
    };

    return { start };
  })();

  const DisplayController = (function () {
    // Elements
    const _currentPlayerH2 = document.querySelector("#currentPlayer");
    const _gameBoardDiv = document.querySelector("#gameBoard");
    const _startBtn = document.querySelector("#startGame");
    const _resultPara = document.querySelector("#result");
    const _splashScreen = document.querySelector("#splashScreen");
    const _player2Input = document.querySelector("#player2Input");
    const _vsAiInput = document.querySelector("#vsAI");
    //   const _aiLevelInput = document.querySelector("#AiLevel");

    const initialize = () => {
      _vsAiInput.checked = false;
      _startBtn.addEventListener("click", () => {
        _splashScreen.classList.add("hide");
        GameController.start();
      });
      _vsAiInput.addEventListener("change", (e) => {
        if (e.target.checked) {
          _player2Input.disabled = true;
          // _aiLevelInput.disabled = false;
        } else {
          _player2Input.disabled = false;
          // _aiLevelInput.disabled = true;
        }
      });
    };

    const renderBoard = (_playMove) => {
      _gameBoardDiv.innerHTML = "";
      GameBoard.getBoard().forEach((row, i) => {
        row.forEach((cell, j) => {
          const tile = document.createElement("span");
          tile.classList.add("tile");
          tile.textContent = `${cell}`;
          tile.dataset.id = `${i}-${j}`;

          tile.addEventListener("click", (e) => {
            _playMove(i, j, e.target);
          });

          _gameBoardDiv.appendChild(tile);
        });
      });
    };

    const announceWinner = (winner) => {
      if (winner === "Tie") {
        _resultPara.textContent = "It's a Tie";
      } else {
        _resultPara.textContent = `${winner} Wins!`;
      }

      _startBtn.textContent = "Play Again";
      _splashScreen.classList.remove("hide");
    };

    const setCurrentPlayer = (player) => {
      _currentPlayerH2.textContent = `Player: ${player.getName()} (${player.getMarker()})`;
    };

    return { initialize, announceWinner, renderBoard, setCurrentPlayer };
  })();

  DisplayController.initialize();
})();
