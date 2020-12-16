var minezone = document.getElementById('minezone');
var board;
var gameON = true;
var cells = [];
var clicked = []; // til að halda utan um hvort vinnur
var bombs = [];

function generateGame() {
  gameON = true;
  bombs = [];
  clicked = [];
  console.log(board.cols);
  minezone.innerHTML = '<p>Go diggity</p>';
  minezone.style.minWidth = 27 * board.cols + 'px';
  console.log('Mines:');
  console.log(board.minePositions);

  var cellnr = 0;
  for (let ii = 0; ii < board.rows; ii++) {
    for (let i = 0; i < board.cols; i++) {
      //attributes for each cell
      cells[cellnr] = {
        id: cellnr,
        x: ii,
        y: i,
        isNotClicked: true,
        isNotFlaged: true,
        itIsBomb: isBomb(ii, i),
      };
      if (cells[cellnr].itIsBomb) {
        bombs.push(cellnr);
      }
      minezone.innerHTML +=
        '<div class="cell" onclick="doStuff(' +
        cellnr +
        ')"  oncontextmenu="setFlag(' +
        cellnr +
        ')" id="cell_' +
        cellnr +
        '"></div>';
      cellnr++;
    }
    minezone.innerHTML += '<br/>';
  }
}

function isBomb(x, y) {
  let bomb = false;

  for (let i = 0; i < board.mines; i++) {
    if (x == board.minePositions[i][0] && y == board.minePositions[i][1]) {
      bomb = true;
    }
  }
  return bomb;
}

function isNextToBomb(nbr, cnt = 0) {
  let rows = board.cols;
  //each surrounding cell is a neighbour of each particular cell
  let neighb = [
    nbr - 1,
    nbr - rows - 1,
    nbr - rows,
    nbr - rows + 1,
    nbr + 1,
    nbr + 1 + rows,
    nbr + rows,
    nbr + (rows - 1),
  ];
  neighb.forEach((neighb_cell) => {
    //so we don't count cells that are not within the board, f.x. negative number cells
    if (
      cells[neighb_cell] &&
      cells[neighb_cell].y >= 0 &&
      cells[neighb_cell].y + 1 <= board.cols &&
      cells[neighb_cell].itIsBomb
    ) {
      //so we don't count cells on the far left side as neighbours of cells on the far right side
      if (
        cells[neighb_cell].y - cells[nbr].y < 2 &&
        cells[neighb_cell].y - cells[nbr].y > -2
      ) {
        //for each neighbouring cell that has a mine, we add 1 to the counter
        cnt++;
      }
    }
  });
  return cnt;
}

function doStuff(nbr) {
  if (gameON && cells[nbr].isNotFlaged) {
    let currentid = document.getElementById('cell_' + nbr);
    //if we click a cell witha mine the game ends
    if (cells[nbr].itIsBomb) {
      gameON = false;
      boom();
    }
    //if we click a cell with a neighbouring mine
    else if ((near_bombs = isNextToBomb(nbr))) {
      currentid.style.backgroundColor = 'LightGrey';
      if (near_bombs >= 3) {
        currentid.innerHTML =
          '<DIV class="cellfix hint hint3">' + near_bombs + '</DIV>';
      } else if (near_bombs == 2) {
        currentid.innerHTML =
          '<DIV class="cellfix hint hint2">' + near_bombs + '</DIV>';
      } else {
        currentid.innerHTML =
          '<DIV class="cellfix hint">' + near_bombs + '</DIV>';
      }
    }
    //for all other cells we recursively open them
    else {
      let rows = board.cols;
      currentid.style.backgroundColor = 'Grey';
      let neighb = [];

      //a few condition for setting the neighbouring cells, depending on the position of the clicked cell
      //so we don't f.x. open cells on the left end if we click on the right end
      if (cells[nbr].y - 1 < 0) {
        neighb = [nbr - rows, nbr + 1, nbr + rows];
      } else if (cells[nbr].y + 1 >= board.cols) {
        neighb = [nbr - 1, nbr - rows, nbr + rows];
      } else {
        neighb = [nbr - 1, nbr - rows, nbr + 1, nbr + rows];
      }

      neighb.forEach((neighb_cell) => {
        if (
          cells[neighb_cell] &&
          cells[neighb_cell].isNotClicked &&
          cells[neighb_cell].itIsBomb == false
        ) {
          currentid = document.getElementById('cell_' + neighb_cell);
          currentid.style.backgroundColor = 'Grey';
          cells[neighb_cell].isNotClicked = false;
          doStuff(neighb_cell);
        }
      });
    }
    //we add each cell to a array 'clicked' if its not in there already
    var check = clicked.includes(nbr);
    if (check == false) {
      cells[nbr].isNotClicked = false;
      clicked.push(nbr);
      //we count how many mined cells have been flagged
      var countFlaggedBombs = 0;
      bombs.forEach((bomb) => {
        if (cells[bomb].isNotFlaged == false) {
          countFlaggedBombs++;
        }
      });
      //if all the mined cells have been flagged and all other cells have been clicked then the game ends
      if (countFlaggedBombs == getLenght(bombs)) {
        if (getLenght(clicked) == board.rows * board.cols - board.mines) {
          clicked.forEach((clickedCell) => {
            let currentid = document.getElementById('cell_' + clickedCell);
            currentid.style.backgroundColor = 'rgb(0, 204, 0)';
          });
          minezone.innerHTML += '<p style="color:green"> YOU WIN ! <p>';
          gameON = false;
        }
      }
    }
  }
}

function boom() {
  //if we click a mined cell the game ends and all the mined cells are revealed
  for (let i = 0; i < bombs.length; i++) {
    let bombid = document.getElementById('cell_' + bombs[i]);
    bombid.style.backgroundColor = 'Red';
    bombid.innerHTML =
      '<DIV class="cellfix"><img src="bomb.png" alt="B" class="img_bomb"></DIV>';
  }
  minezone.innerHTML += '<p style="color:red"> YOU LOOS ! </p>';
}

function setFlag(nbr) {
  let flagid = document.getElementById('cell_' + nbr);
  //if the clicked cell is unflagged, we add the flag ontop of it and change its attribute
  if (cells[nbr].isNotClicked && gameON == true) {
    var countFlaggedBombs = 0;
    if (cells[nbr].isNotFlaged) {
      flagid.style.backgroundColor = 'lightgrey';
      flagid.innerHTML =
        '<DIV class="cellfix"><img src="flag.png" alt="F" class="img_flag"></DIV>';
      cells[nbr].isNotFlaged = false;
      bombs.forEach((bomb) => {
        if (cells[bomb].isNotFlaged == false) {
          countFlaggedBombs++;
        }
      });
      //again checking for a win condition this time if all the unmined cells have been opened
      //and we flag a mined cell
      if (countFlaggedBombs == getLenght(bombs)) {
        if (getLenght(clicked) == board.rows * board.cols - board.mines) {
          clicked.forEach((clickedCell) => {
            let currentid = document.getElementById('cell_' + clickedCell);
            currentid.style.backgroundColor = 'rgb(0, 204, 0)';
          });
          minezone.innerHTML += '<p style="color:green"> YOU WIN ! <p>';
          gameON = false;
        }
      }
    }
    //if we click a cell that has already been flagged, then we remove the flag and change its attribute
    else {
      flagid.style.backgroundColor = 'darkolivegreen';
      flagid.innerHTML = '';
      cells[nbr].isNotFlaged = true;
    }
  }
}

//helperfunction to get the lenght of an object
function getLenght(list) {
  var counter = 0;
  list.forEach((obj) => {
    counter++;
  });
  return counter;
}

function startGame() {
  //Prepare the parameter value for 'myParam'
  var r = document.getElementById('rows').value;
  var c = document.getElementById('columns').value;
  var m = document.getElementById('mines').value;

  //we check if the user tries to input an invalid number for each of the forms
  function faultyInput(item, number) {
    alert('Please enter a number of ' + item + ' between 1 and ' + number);
  }

  if (r < 1 || r > 40) {
    faultyInput('rows', 40);
    return;
  } else if (c < 1 || c > 40) {
    faultyInput('columns', 40);
    return;
  } else if (m < 1 || m > r * c) {
    faultyInput('mines', r * c);
    return;
  }
  //The URL to which we will send the request
  var url = 'https://veff213-minesweeper.herokuapp.com/api/v1/minesweeper';

  var minePositions = [];
  var uniqueMinePos = 0;
  while (uniqueMinePos < c) {
    var minePos = [
      Math.floor(Math.random() * 10),
      Math.floor(Math.random() * 10),
    ];
    console.log(minePos);
    if (minePositions.indexOf(minePos) === -1) {
      minePositions.push(minePos);
      uniqueMinePos++;
    }
  }
  console.log(minePositions);

  board = {
    rows: r,
    cols: c,
    mines: m,
    minePositions: minePositions,
  };
  generateGame();
}
