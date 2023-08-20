const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 500;
canvas.height = 500;
spuareHeight = canvas.width / 8;
color1 = "#779556";
color2 = "#ebecd0";
const image = new Image();
image.src = "sprites2.png";
imageHeight = 150;
whitesTurn = true;
turn = 0;

squareArray = [];

const pieceCoordinates = {
  pawnBlack: {
    x: 11,
  },
  pawnWhite: {
    x: 5,
  },
  rookBlack: {
    x: 10,
  },
  knightBlack: {
    x: 9,
  },
  bishopBlack: {
    x: 8,
  },
  queenBlack: {
    x: 7,
  },
  kingBlack: {
    x: 6,
  },
  rookWhite: {
    x: 4,
  },
  knightWhite: {
    x: 3,
  },
  bishopWhite: {
    x: 2,
  },
  queenWhite: {
    x: 1,
  },
  kingWhite: {
    x: 0,
  },
};

undo.addEventListener("click", (e) => {
  if (gameHistory.length > 0) {
    console.log(gameHistory[turn - 1]);
    squareArray = gameHistory[turn - 1];
    turn--;
  }
});

class Square {
  //get passed in the row, column, id, piece, and the color that is created in for loop
  constructor(row, column, id, piece, color) {
    this.height = spuareHeight;
    this.width = spuareHeight;
    //determine the color of the squares
    if ((row + column) % 2 !== 0) {
      this.color = color1;
      this.originalColor = this.color;
      this.colorId = 1;
    } else {
      this.color = color2;
      this.originalColor = this.color;
      this.colorId = 2;
    }
    //create default values
    this.selected = false;
    this.row = row;
    this.column = column;
    //id refers to the square number starting from 1
    this.id = id;
    //key refers to the square number starting from 0
    this.key = id - 1;
    this.piece = piece;
    this.side = color;
    this.available = false;
    this.capturable = false;
    this.check = false;
    this.unmoveable = false;
    //determine the amount of squares to the edge of the board for each direction
    this.left = this.key % 8;
    this.right = 8 - (1 + this.left);
    this.top = Math.floor(this.key / 8);
    this.bottom = 8 - (1 + this.top);
    //create castling variables
    this.moved = false;
    this.castle = false;
    this.illegal = false;
  }
}

for (let i = 0; i < 64; i++) {
  column = Math.floor(i / 8);
  row = i;
  if (row > 7) {
    row -= column * 8;
  }
  //determine the row and column.
  id = i + 1;
  //create the default pieces
  const initialPieces = [
    ["rook", "Black"],
    ["knight", "Black"],
    ["bishop", "Black"],
    ["queen", "Black"],
    ["king", "Black"],
    ["bishop", "Black"],
    ["knight", "Black"],
    ["rook", "Black"],
    ["pawn", "Black"],
    ["pawn", "Black"],
    ["pawn", "Black"],
    ["pawn", "Black"],
    ["pawn", "Black"],
    ["pawn", "Black"],
    ["pawn", "Black"],
    ["pawn", "Black"],
    [undefined, undefined],
    [undefined, undefined],
    [undefined, undefined],
    [undefined, undefined],
    [undefined, undefined],
    [undefined, undefined],
    [undefined, undefined],
    [undefined, undefined],
    [undefined, undefined],
    [undefined, undefined],
    [undefined, undefined],
    [undefined, undefined],
    [undefined, undefined],
    [undefined, undefined],
    [undefined, undefined],
    [undefined, undefined],
    [undefined, undefined],
    [undefined, undefined],
    [undefined, undefined],
    [undefined, undefined],
    [undefined, undefined],
    [undefined, undefined],
    [undefined, undefined],
    [undefined, undefined],
    [undefined, undefined],
    [undefined, undefined],
    [undefined, undefined],
    [undefined, undefined],
    [undefined, undefined],
    [undefined, undefined],
    [undefined, undefined],
    [undefined, undefined],
    ["pawn", "White"],
    ["pawn", "White"],
    ["pawn", "White"],
    ["pawn", "White"],
    ["pawn", "White"],
    ["pawn", "White"],
    ["pawn", "White"],
    ["pawn", "White"],
    ["rook", "White"],
    ["knight", "White"],
    ["bishop", "White"],
    ["queen", "White"],
    ["king", "White"],
    ["bishop", "White"],
    ["knight", "White"],
    ["rook", "White"],
  ];
  // push all of the elements off of the forloop with the Square constructor
  squareArray.push(
    new Square(row, column, id, initialPieces[i][0], initialPieces[i][1])
  );
  gameHistory = [JSON.parse(JSON.stringify(squareArray))];
}

function animate() {
  squareArray.forEach((square) => {
    if (square.colorId == 1) {
      square.originalColor = color1;
    } else {
      square.originalColor = color2;
    }
    ctx.fillStyle = square.color;
    //draw the board
    ctx.fillRect(
      square.row * spuareHeight,
      square.column * spuareHeight,
      spuareHeight,
      spuareHeight
    );
    //draw the pieces
    if (square.piece !== undefined) {
      ctx.drawImage(
        image,
        imageHeight * pieceCoordinates[square.piece + square.side].x,
        0,
        imageHeight,
        imageHeight,
        square.row * spuareHeight,
        square.column * spuareHeight,
        spuareHeight,
        spuareHeight
      );
    }
    //determine the extra colors based off of square status
    switch (true) {
      case square.selected == true:
        square.color = "#e3d42b";
        break;
      case square.available == true:
        square.color = "rgba(215, 201, 40, 0.05)";
        break;
      case square.check == true:
        square.color = "#cc1717";
        break;
      default:
        square.color = square.originalColor;
    }
  });
  requestAnimationFrame(animate);
}
animate();

function findLegalMoves(alert) {
  console.time("Finding Legal Moves");
  legalMoves = {};
  side = whitesTurn == true ? "White" : "Black";
  oppSide = whitesTurn == true ? "Black" : "White";
  kingCheckSearch(squareArray, alert);
  currentPieces = squareArray.filter((square) => square.side == side);
  currentPieces.forEach((piece) => {
    if (piece.piece == "rook") {
      legalMoves[piece.key] = [];
      findQueenMoves(piece.top, piece.top, piece, -8, 10);
      findQueenMoves(piece.left, piece.left, piece, -1, 10);
      findQueenMoves(piece.right, piece.right, piece, 1, 10);
      findQueenMoves(piece.bottom, piece.bottom, piece, 8, 10);
    }
    if (piece.piece == "bishop") {
      legalMoves[piece.key] = [];
      findQueenMoves(piece.top, piece.right, piece, -7, 10);
      findQueenMoves(piece.top, piece.left, piece, -9, 10);
      findQueenMoves(piece.bottom, piece.right, piece, 9, 10);
      findQueenMoves(piece.bottom, piece.left, piece, 7, 10);
    }
    if (piece.piece == "queen") {
      legalMoves[piece.key] = [];
      findQueenMoves(piece.top, piece.right, piece, -7, 10);
      findQueenMoves(piece.top, piece.left, piece, -9, 10);
      findQueenMoves(piece.bottom, piece.right, piece, 9, 10);
      findQueenMoves(piece.bottom, piece.left, piece, 7, 10);
      findQueenMoves(piece.top, piece.top, piece, -8, 10);
      findQueenMoves(piece.left, piece.left, piece, -1, 10);
      findQueenMoves(piece.right, piece.right, piece, 1, 10);
      findQueenMoves(piece.bottom, piece.bottom, piece, 8, 10);
    }
    if (piece.piece == "king") {
      legalMoves[piece.key] = [];
      findQueenMoves(piece.top, piece.right, piece, -7, 1);
      findQueenMoves(piece.top, piece.left, piece, -9, 1);
      findQueenMoves(piece.bottom, piece.right, piece, 9, 1);
      findQueenMoves(piece.bottom, piece.left, piece, 7, 1);
      findQueenMoves(piece.top, piece.top, piece, -8, 1);
      findQueenMoves(piece.left, piece.left, piece, -1, 1);
      findQueenMoves(piece.right, piece.right, piece, 1, 1);
      findQueenMoves(piece.bottom, piece.bottom, piece, 8, 1);
      findCastles(piece, 3, 1);
      findCastles(piece, 4, -1);
    }
    if (piece.piece == "knight") {
      legalMoves[piece.key] = [];
      findKnightMoves(piece.top, piece.right, piece.key - 15, piece);
      findKnightMoves(piece.top, piece.left, piece.key - 17, piece);
      findKnightMoves(piece.bottom, piece.right, piece.key + 17, piece);
      findKnightMoves(piece.bottom, piece.left, piece.key + 15, piece);
      findKnightMoves(piece.left, piece.top, piece.key - 10, piece);
      findKnightMoves(piece.right, piece.top, piece.key - 6, piece);
      findKnightMoves(piece.left, piece.bottom, piece.key + 6, piece);
      findKnightMoves(piece.right, piece.bottom, piece.key + 10, piece);
    }
    if (piece.piece == "pawn") {
      legalMoves[piece.key] = [];
      findPawnMoves(piece);
    }
  });
  console.timeEnd("Finding Legal Moves");
}

findLegalMoves();

function imagineBoard(piece1, piece2key) {
  const imaginaryBoard = JSON.parse(JSON.stringify(squareArray));
  imaginaryBoard[piece1.key].piece = undefined;
  imaginaryBoard[piece1.key].side = undefined;
  imaginaryBoard[piece2key].piece = piece1.piece;
  imaginaryBoard[piece2key].side = piece1.side;
  const req = kingCheckSearch(imaginaryBoard, false);
  return req;
}

function findQueenMoves(direction, direction2, piece, multiplier, loop) {
  for (let i = 1; i <= direction && i <= direction2 && i <= loop; i++) {
    if (squareArray[piece.key + i * multiplier].piece == undefined) {
      if (imagineBoard(piece, piece.key + i * multiplier) == true) {
        console.log("illegal move");
      } else {
        legalMoves[piece.key].push({
          key: squareArray[piece.key + i * multiplier].key,
        });
      }
    } else if (squareArray[piece.key + i * multiplier].side == piece.side) {
      break;
    } else {
      if (imagineBoard(piece, piece.key + i * multiplier) == true) {
        console.log("illegal move");
      } else {
        legalMoves[piece.key].push({
          key: squareArray[piece.key + i * multiplier].key,
        });
      }
      break;
    }
  }
}

function findKnightMoves(squareDir1, squareDir2, equation, piece) {
  if (
    squareDir1 > 1 &&
    squareDir2 > 0 &&
    squareArray[equation].side != piece.side
  ) {
    if (imagineBoard(piece, squareArray[equation].key) == true) {
      console.log("illegal move");
    } else {
      legalMoves[piece.key].push({ key: squareArray[equation].key });
    }
  }
}

function findCastles(piece, limit, multiplier) {
  if (piece.moved == false) {
    req = true;
    for (let i = 1; i < limit; i++) {
      if (
        squareArray[piece.key + multiplier * i].piece != undefined ||
        imagineBoard(piece, squareArray[piece.key + multiplier * i].key)
      ) {
        req = false;
      }
    }
    if (squareArray[piece.key + limit * multiplier].moved == true) {
      req = false;
    }
    if (squareArray[piece.key + limit * multiplier].piece == undefined) {
      req = false;
    }
    if (req == true) {
      rookGone = limit == 3 ? 1 : -2;
      rookNew = limit == 3 ? -1 : 1;
      legalMoves[piece.key].push({
        key: piece.key + multiplier * 2,
        type: "castle",
        rookGone,
        rookNew,
      });
    }
  }
}

function clearBoard() {
  for (let i = 0; i < squareArray.length; i++) {
    squareArray[i].available = false;
    squareArray[i].unmoveable = false;
    squareArray[i].selected = false;
    if (squareArray[i].enPassantTurn + 1 < turn) {
      squareArray[i].enPassantSide = undefined;
      squareArray[i].enPassant = false;
    }
  }
}

function findPawnMoves(piece) {
  direction = piece.side == "White" ? -1 : 1;
  dir7 = piece.side == "White" ? piece.right : piece.left;
  dir9 = piece.side == "White" ? piece.left : piece.right;
  for (let i = 1; i <= !piece.moved + 1; i++) {
    if (squareArray[piece.key + i * direction * 8].piece == undefined) {
      if (i == 2 && piece.moved == false) {
        if (
          imagineBoard(piece, squareArray[piece.key + i * direction * 8].key) ==
          true
        ) {
          console.log("illegal move");
        } else {
          legalMoves[piece.key].push({
            key: squareArray[piece.key + i * direction * 8].key,
            type: "pawnDouble",
            direction,
          });
        }
      } else {
        if (
          imagineBoard(piece, squareArray[piece.key + i * direction * 8].key) ==
          true
        ) {
          console.log("illegal move");
        } else {
          legalMoves[piece.key].push({
            key: squareArray[piece.key + i * direction * 8].key,
          });
        }
      }
    } else {
      break;
    }
  }
  function findDiagnol(num) {
    if (
      squareArray[piece.key + num * direction].side != piece.side &&
      squareArray[piece.key + num * direction].piece != undefined &&
      window["dir" + num] > 0
    ) {
      if (
        imagineBoard(piece, squareArray[piece.key + num * direction].key) ==
        true
      ) {
        console.log("illegal move");
      } else {
        legalMoves[piece.key].push({
          key: squareArray[piece.key + num * direction].key,
        });
      }
    } else if (
      squareArray[piece.key + num * direction].enPassant == true &&
      squareArray[piece.key + num * direction].enPassantSide != piece.side
    ) {
      if (
        imagineBoard(piece, squareArray[piece.key + num * direction].key) ==
        true
      ) {
        console.log("illegal move");
      } else {
        legalMoves[piece.key].push({
          key: squareArray[piece.key + num * direction].key,
          type: "enPassant",
        });
      }
    }
  }
  findDiagnol(7);
  findDiagnol(9);
}

selecting = true;
selectedPiece = {};

canvas.addEventListener("click", (element) => {
  if (selecting == true) {
    findLegalMoves(false);
    let rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    x -= x % spuareHeight;
    y -= y % spuareHeight;
    console.log(x, y);
    square = squareArray.find(
      (square) =>
        square.row * spuareHeight == x && square.column * spuareHeight == y
    );
    clearBoard();
    square.selected = true;
    if (square.piece != undefined && square.side == side) {
      legalMoves[square.key].forEach((move) => {
        squareArray[move.key].available = true;
        if (move.type == "pawnDouble") {
          console.log("Pawn selected can move twice");
          squareArray[move.key].preview = {
            type: "pawnDouble",
            direction: move.direction,
          };
        }
        if (move.type == "castle") {
          console.log("Dude's definitely castling");
          squareArray[move.key].preview = {
            type: "castle",
            rookGone: move.rookGone,
            rookNew: move.rookNew,
          };
        }
        if (legalMoves[square.key].length > 0) {
          selecting = false;
          selectedPiece = square;
        }
      });
    }
  } else {
    let rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    x -= x % spuareHeight;
    y -= y % spuareHeight;
    square = squareArray.find(
      (square) =>
        square.row * spuareHeight == x && square.column * spuareHeight == y
    );
    if (square.available == true) {
      if (square.preview) {
        if (square.preview.type == "pawnDouble") {
          squareArray[
            square.key + -1 * square.preview.direction * 8
          ].enPassant = true;
          squareArray[
            square.key + -1 * square.preview.direction * 8
          ].enPassantSide = side;
          squareArray[
            square.key + -1 * square.preview.direction * 8
          ].enPassantTurn = turn;
          squareArray[
            square.key + -1 * square.preview.direction * 8
          ].direction = direction;
        }
        if (square.preview.type == "castle") {
          console.log("performing the castle", square.preview);
          console.log(square.preview.rook);
          squareArray[square.key + square.preview.rookGone].piece = undefined;
          squareArray[square.key + square.preview.rookGone].side = undefined;
          squareArray[square.key + square.preview.rookNew].piece = "rook";
          squareArray[square.key + square.preview.rookNew].side = side;
          console.log(square, "should be the king");
        }
        square.preview = undefined;
      }
      if (square.enPassant == true && square.enPassantSide != side) {
        squareArray[square.key - 8 * direction].piece = undefined;
        squareArray[square.key - 8 * direction].side = undefined;
      }
      square.piece = selectedPiece.piece;
      square.side = selectedPiece.side;
      square.moved = true;
      selectedPiece.piece = undefined;
      selectedPiece.side = undefined;
      selectedPiece.moved = false;
      if (square.piece == "pawn") {
        if (square.key > 53 || square.key < 8) {
          let req = true;
          while (req == true) {
            const piece = prompt(
              "What piece would you like?"
            ).toLocaleLowerCase();
            if (
              piece == "bishop" ||
              piece == "knight" ||
              piece == "rook" ||
              piece == "queen"
            ) {
              square.piece = piece;
              req = false;
            } else if (piece == "king") {
              alert("You only get one king!");
            } else if (piece == "pawn") {
              alert("I won't let you be that dumb. It's also illegal btw");
            } else {
              alert("That's not a piece in THIS GAME!!!");
            }
          }
        }
      }
      selecting = true;
      clearBoard();
      whitesTurn = !whitesTurn;
      turn++;
      findLegalMoves(true);
      const legalMovesPieces = Object.keys(legalMoves);
      checkMate = true;
      legalMovesPieces.forEach((piece) => {
        if (legalMoves[piece].length != 0) {
          checkMate = false;
        }
      });
      console.log(checkMate, side);
      if (checkMate == true) {
        if (kingCheckSearch(squareArray, false) == true) {
          alert("Check Mate!");
        } else {
          alert("Stalemate!");
        }
      }
      gameHistory.push(JSON.parse(JSON.stringify(squareArray)));
    } else {
      clearBoard();
      selecting = true;
    }
  }
});

function kingCheckSearch(board, alert) {
  const king = board.find(
    (square) => square.piece == "king" && square.side == side
  );
  check = false;
  findChecksFromQueen(king.top, king.right, king, -7, 10, "bishop", board);
  findChecksFromQueen(king.top, king.left, king, -9, 10, "bishop", board);
  findChecksFromQueen(king.bottom, king.right, king, 9, 10, "bishop", board);
  findChecksFromQueen(king.bottom, king.left, king, 7, 10, "bishop", board);
  findChecksFromQueen(king.top, king.top, king, -8, 10, "rook", board);
  findChecksFromQueen(king.left, king.left, king, -1, 10, "rook", board);
  findChecksFromQueen(king.right, king.right, king, 1, 10, "rook", board);
  findChecksFromQueen(king.bottom, king.bottom, king, 8, 10, "rook", board);
  findChecksFromQueen(king.top, king.right, king, -7, 10, "queen", board);
  findChecksFromQueen(king.top, king.left, king, -9, 10, "queen", board);
  findChecksFromQueen(king.bottom, king.right, king, 9, 10, "queen", board);
  findChecksFromQueen(king.bottom, king.left, king, 7, 10, "queen", board);
  findChecksFromQueen(king.top, king.top, king, -8, 10, "queen", board);
  findChecksFromQueen(king.left, king.left, king, -1, 10, "queen", board);
  findChecksFromQueen(king.right, king.right, king, 1, 10, "queen", board);
  findChecksFromQueen(king.bottom, king.bottom, king, 8, 10, "queen", board);
  findChecksFromKnights(king.top, king.right, king.key - 15, king, board);
  findChecksFromKnights(king.top, king.left, king.key - 17, king, board);
  findChecksFromKnights(king.bottom, king.right, king.key + 17, king, board);
  findChecksFromKnights(king.bottom, king.left, king.key + 15, king, board);
  findChecksFromKnights(king.left, king.top, king.key - 10, king, board);
  findChecksFromKnights(king.right, king.top, king.key - 6, king, board);
  findChecksFromKnights(king.left, king.bottom, king.key + 6, king, board);
  findChecksFromKnights(king.right, king.bottom, king.key + 10, king, board);
  if (side == "White") {
    findChecksFromPawns(king, king.top, king.right, -7, squareArray);
    findChecksFromPawns(king, king.top, king.left, -9, squareArray);
  } else {
    findChecksFromPawns(king, king.bottom, king.right, 9, squareArray);
    findChecksFromPawns(king, king.bottom, king.left, 7, squareArray);
  }
  if (check == true) {
    if (alert == true) {
      window.alert("Check!");
    }
    return true;
  }
}

function findChecksFromQueen(
  direction,
  direction2,
  piece,
  multiplier,
  loop,
  pieceType,
  board
) {
  for (let i = 1; i <= direction && i <= direction2 && i <= loop; i++) {
    if (
      board[piece.key + i * multiplier].piece == pieceType &&
      board[piece.key + i * multiplier].side != side
    ) {
      //the piece that would cause check is reached
      check = true;
      return;
    } else if (board[piece.key + i * multiplier].piece == undefined) {
      //the loop continues because there's an empty space
      continue;
    } else {
      //the loop stops because it reached a piece that's not the checking one
      break;
    }
  }
}

function findChecksFromKnights(squareDir1, squareDir2, equation, piece, board) {
  if (
    squareDir1 > 1 &&
    squareDir2 > 0 &&
    board[equation].side != piece.side &&
    board[equation].piece == "knight"
  ) {
    check = true;
    return;
  }
}

function findChecksFromPawns(piece, dir1, dir2, adder, board) {
  if (
    dir1 > 0 &&
    dir2 > 0 &&
    board[piece.key + adder].piece == "pawn" &&
    board[piece.key + adder].side != side
  ) {
    check = true;
    return;
  }
}
