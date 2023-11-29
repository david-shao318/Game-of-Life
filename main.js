/*
Conway's Game of Life Project Javascript
*/

let board = [], cells = [], colLive, colDead, gens, timeInterval;

// utility functions
let clear = function() {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j] == 1) {
                change(i, j);
            }
        }
    }
};
let randB = function() {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (Math.round(Math.random()) == 1) {
                change(i, j);
            }
        }
    }
};


// calculate number of live neighbours for a particular cell
function liveNeighbours(row, col, grid) {
    let live = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (!(i == 0 && j == 0)) { //don't count self
                if (row + i < 0 || row + i > grid.length - 1 || col + j < 0 || col + j > grid[row].length - 1)
                    continue; //disregard cells that don't exist (i.e., outside of board)
                else
                    live += grid[row + i][col + j];
            }
        }
    }
    return live;
}

// change state (live/dead) of a particular cell
function change(x, y) {
    if (board[x][y] == 0) {
        board[x][y] = 1;
        cells[x][y].style.backgroundColor = colLive;
    } else {
        board[x][y] = 0;
        cells[x][y].style.backgroundColor = colDead;
    }
}

// evolve board (once)
function evolve() {
    let copy = []; //make a copy of current board
    for (let r = 0; r < board.length; r++)
        copy.push([...board[r]]);

    //evolve board by applying rules to each cell & display
    let live;
    for (let x = 0; x < copy.length; x++) {
        for (let y = 0; y < copy[x].length; y++) {
            live = liveNeighbours(x, y, copy);
            if (copy[x][y] == 1) {
                if (live < 2 || live > 3)
                    change(x, y);
            } else {
                if (live == 3)
                    change(x, y);
            }
        }
    }
}

// function to display cells at the start
function drawStart(rows, cols) {
    //change background colour if there's a conflict between background and foreground colours
    if (colLive == '#ffffff' || colDead == '#ffffff') {
        if (colLive != '#dfdfdf' && colDead != '#dfdfdf')
            document.body.style.backgroundColor = '#dfdfdf';
        else
            document.body.style.backgroundColor = '#000000';
    }

    // create table for display
    let disp = document.body.appendChild(document.createElement('table')), r;
    for (let i = 0; i < rows; i++) {
        cells.push([]);
        r = disp.appendChild(document.createElement('tr'));
        for (let j = 0; j < cols; j++) {
            // display cells
            cells[i][j] = r.appendChild(document.createElement('td'));
            cells[i][j].style.backgroundColor = colDead;
            cells[i][j].addEventListener('click', () => change(i, j));  // allow user to change colour of cells

            // style size of cells based on window size
            if (((window.innerHeight - rows - 3) / rows) * cols > (window.innerWidth - cols - 3)) {
                cells[i][j].style.width = ((window.innerWidth - cols - 3) / cols) + 'px';
                cells[i][j].style.height = cells[i][j].style.width;
            } else {
                cells[i][j].style.height = ((window.innerHeight - rows - 3) / rows) + 'px';
                cells[i][j].style.width = cells[i][j].style.height;
            }
        }
    }
}

// run the simulation (start evolving) at user's request
function simulate() {
    let interval;
    if (gens === undefined) { // if gens is not defined (start/stop mode)
        let isRunning = false;
        // 'spacebar' starts/stops simulation
        window.addEventListener('keydown', (event) => {
            if (event.key == ' ') {
                event.preventDefault();
                if (isRunning == false) {
                    interval = setInterval(function() {
                        evolve();
                    }, timeInterval);
                    isRunning = true;

                    //
                    let liveCells = "";
                    for (let x = 0; x < board.length; x++) {
                        for (let y = 0; y < board[x].length; y++)
                        {
                            if (board[x][y] == 1)
                                liveCells = liveCells + `${x + 1} ${y + 1} `;
                        }
                    }
                    console.log(liveCells);
                    //

                } else {
                    clearInterval(interval);
                    isRunning = false;
                }
            } else if (event.key == 'b') {
                randB();
            } else if (event.key == 'c') {
                clear();
            }
        });
    } else { // if gens is defined (gens mode)
        let genCount = 0;
        let evolution = function(event) {
            // 'spacebar' starts simulation
            if (event.key == ' ') {
                event.preventDefault();
                window.removeEventListener('keydown', evolution);
                interval = setInterval(function() {
                    evolve();
                    genCount++;
                    // stop evolving once the number of generations has been reached
                    if (genCount >= gens) {
                        clearInterval(interval);
                        swal('Done!', `The simulaton has reached ${genCount} generation(s).`, 'info');
                    }
                }, timeInterval);
            }
        };
        window.addEventListener('keydown', evolution);
        window.addEventListener('keydown', (event) => {
            if (event.key == 'b') {
                randB();
            } else if (event.key == 'c') {
                clear();
            }
        });
    }
}

// set up simulation
function generate(rows, cols) {
    // data sanitation
    if (rows <= 0 || cols <= 0 || !Number.isInteger(rows) || !Number.isInteger(cols))
        swal('Input Error', 'Rows and Columns must be positive integers.', 'error');
    else if (gens !== '' && (gens < 1 || !Number.isInteger(Number(gens))))
        swal('Input Error', 'Generations must be a positive integer.', 'error');
    else if (timeInterval !== '' && timeInterval < 10)
        swal('Input Error', 'Time Interval between generations must be at least 10 milliseconds.', 'error');
    else if (timeInterval !== '' && !Number.isInteger(Number(timeInterval)))
        swal('Input Error', 'Time Interval must be an integer.', 'error');
    else if (colLive == colDead)
        swal('Input Error', 'The colour of Living Cells must be different from the colour of Dead Cells.', 'error');
    else {
        // clear page
        for (let element of Array.from(document.body.children))
            element.remove();
        // set default data values for optional inputs
        if (gens === '')
            gens = undefined;
        else
            gens = Number(gens);
        if (timeInterval === '')
            timeInterval = 500;
        else
            timeInterval = Number(timeInterval);

        // set up 'board' var to store state of each cell
        let sampleRow = [];
        for (let i = 0; i < cols; i++)
            sampleRow.push(0);
        for (let i = 0; i < rows; i++)
            board[i] = [...sampleRow];
        
        // create board
        drawStart(rows, cols);

        // instructions for user, depending on if gens was specified
        if (gens === undefined)
            swal('Instructions', 'Click on each cell to switch its state from dead to alive or vice versa. When you are ready, press the space bar to start running the simulation. Press again to pause or continue.', 'info', {button: 'OK, got it!'});
        else
            swal('Instructions', 'Click on each cell to switch its state from dead to alive or vice versa. When you are ready, press the space bar to start running the simulation. The simulation will automatically stop upon reaching the number of generations that you have specified.', 'info', {button: 'OK, got it!'});

        // start simulation
        simulate();
    }
}

// when window loads, set up input
window.onload = () => {
    let contButton = document.getElementById('continue'), row = document.getElementById('rows'), col = document.getElementById('cols'), gen = document.getElementById('gens'), time = document.getElementById('timeInterval'), cLive = document.getElementById('colorAlive'), cDead = document.getElementById('colorDead');
    contButton.addEventListener('click', () => {
        gens = gen.value, timeInterval = time.value, colLive = cLive.value, colDead = cDead.value; //global vars
        generate(Number(row.value), Number(col.value)); 
    });
};