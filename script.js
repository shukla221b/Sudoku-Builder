// Sudoku Web Application JavaScript
class SudokuApp {
    constructor() {
        this.grid = Array(9).fill().map(() => Array(9).fill(0));
        this.originalGrid = Array(9).fill().map(() => Array(9).fill(0));
        this.selectedCell = null;
        this.currentTechnique = null;
        this.solvingSteps = [];
        this.currentStep = 0;
        
        // Game tracking
        this.gameStats = this.loadGameStats();
        this.currentGame = {
            startTime: null,
            difficulty: null,
            hintsUsed: 0,
            moves: 0,
            isActive: false
        };
        this.gameTimer = null;
        
        this.initializeGrid();
        this.setupEventListeners();
        this.updateProgress("Ready to start! Generate a puzzle to begin.");
        this.updateDashboard();
    }

    initializeGrid() {
        const gridContainer = document.getElementById('sudokuGrid');
        gridContainer.innerHTML = '';
        
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                cell.addEventListener('click', () => this.selectCell(i, j));
                cell.addEventListener('keydown', (e) => this.handleKeyPress(e, i, j));
                cell.tabIndex = 0;
                gridContainer.appendChild(cell);
            }
        }
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (this.selectedCell) {
                this.handleKeyPress(e, this.selectedCell.row, this.selectedCell.col);
            }
        });
    }

    selectCell(row, col) {
        // Clear previous selection
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('selected', 'highlighted');
        });

        // Select new cell
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        cell.classList.add('selected');
        cell.focus();
        
        this.selectedCell = { row, col };
        this.highlightRelatedCells(row, col);
    }

    highlightRelatedCells(row, col) {
        // Highlight row
        for (let j = 0; j < 9; j++) {
            const cell = document.querySelector(`[data-row="${row}"][data-col="${j}"]`);
            if (j !== col) cell.classList.add('highlighted');
        }

        // Highlight column
        for (let i = 0; i < 9; i++) {
            const cell = document.querySelector(`[data-row="${i}"][data-col="${col}"]`);
            if (i !== row) cell.classList.add('highlighted');
        }

        // Highlight 3x3 box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let i = boxRow; i < boxRow + 3; i++) {
            for (let j = boxCol; j < boxCol + 3; j++) {
                const cell = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
                if (i !== row || j !== col) cell.classList.add('highlighted');
            }
        }
    }

    handleKeyPress(event, row, col) {
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        
        if (event.key >= '1' && event.key <= '9') {
            if (!cell.classList.contains('given')) {
                this.setCellValue(row, col, parseInt(event.key));
            }
        } else if (event.key === 'Delete' || event.key === 'Backspace') {
            if (!cell.classList.contains('given')) {
                this.setCellValue(row, col, 0);
            }
        } else if (event.key === 'ArrowUp' && row > 0) {
            this.selectCell(row - 1, col);
        } else if (event.key === 'ArrowDown' && row < 8) {
            this.selectCell(row + 1, col);
        } else if (event.key === 'ArrowLeft' && col > 0) {
            this.selectCell(row, col - 1);
        } else if (event.key === 'ArrowRight' && col < 8) {
            this.selectCell(row, col + 1);
        }
    }

    setCellValue(row, col, value) {
        const oldValue = this.grid[row][col];
        this.grid[row][col] = value;
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        
        if (value === 0) {
            cell.textContent = '';
            cell.classList.remove('error');
        } else {
            cell.textContent = value;
            cell.classList.add('updated');
            setTimeout(() => cell.classList.remove('updated'), 300);
        }
        
        // Track move if value changed and it's user input
        if (oldValue !== value && !cell.classList.contains('given')) {
            this.recordMove();
        }
        
        this.validateCell(row, col);
    }

    validateCell(row, col) {
        const value = this.grid[row][col];
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        
        // Clear error when cell is empty
        if (value === 0) {
            cell.classList.remove('error');
            return true;
        }

        // Don't validate given numbers - they should never be highlighted as errors
        if (cell.classList.contains('given')) {
            return true;
        }

        cell.classList.remove('error');

        // Check if value is in valid range
        if (value < 1 || value > 9) {
            cell.classList.add('error');
            return false;
        }

        // Check for duplicates and highlight only user-entered cells
        let hasError = false;

        // Check row for duplicates
        for (let j = 0; j < 9; j++) {
            if (j !== col && this.grid[row][j] === value) {
                const duplicateCell = document.querySelector(`[data-row="${row}"][data-col="${j}"]`);
                // Only highlight if the duplicate is also user-entered (not given)
                if (!duplicateCell.classList.contains('given')) {
                    cell.classList.add('error');
                    duplicateCell.classList.add('error');
                    hasError = true;
                }
            }
        }

        // Check column for duplicates
        for (let i = 0; i < 9; i++) {
            if (i !== row && this.grid[i][col] === value) {
                const duplicateCell = document.querySelector(`[data-row="${i}"][data-col="${col}"]`);
                // Only highlight if the duplicate is also user-entered (not given)
                if (!duplicateCell.classList.contains('given')) {
                    cell.classList.add('error');
                    duplicateCell.classList.add('error');
                    hasError = true;
                }
            }
        }

        // Check 3x3 box for duplicates
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let i = boxRow; i < boxRow + 3; i++) {
            for (let j = boxCol; j < boxCol + 3; j++) {
                if ((i !== row || j !== col) && this.grid[i][j] === value) {
                    const duplicateCell = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
                    // Only highlight if the duplicate is also user-entered (not given)
                    if (!duplicateCell.classList.contains('given')) {
                        cell.classList.add('error');
                        duplicateCell.classList.add('error');
                        hasError = true;
                    }
                }
            }
        }

        return !hasError;
    }

    generatePuzzle(difficulty) {
        this.clearPuzzle();
        this.updateProgress(`Generating ${difficulty} puzzle...`);
        
        // Start new game tracking
        this.startNewGame(difficulty);
        
        // Generate a solved puzzle first
        this.generateSolvedPuzzle();
        
        // Remove numbers based on difficulty
        const cellsToRemove = this.getCellsToRemove(difficulty);
        this.removeCells(cellsToRemove);
        
        // Mark given cells
        this.markGivenCells();
        
        this.updateProgress(`${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} puzzle generated!`);
        this.clearTechniqueInfo();
        this.updateDashboard();
    }

    generateSolvedPuzzle() {
        // Start with empty grid
        this.grid = Array(9).fill().map(() => Array(9).fill(0));
        
        // Fill diagonal 3x3 boxes first (they don't interfere with each other)
        this.fillDiagonalBoxes();
        
        // Fill remaining cells using backtracking
        this.solveGrid();
    }

    fillDiagonalBoxes() {
        for (let box = 0; box < 9; box += 3) {
            this.fillBox(box, box);
        }
    }

    fillBox(row, col) {
        const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        this.shuffleArray(numbers);
        
        let index = 0;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                this.grid[row + i][col + j] = numbers[index++];
            }
        }
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    solveGrid() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.grid[row][col] === 0) {
                    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
                    this.shuffleArray(numbers);
                    
                    for (let num of numbers) {
                        if (this.isValidMove(row, col, num)) {
                            this.grid[row][col] = num;
                            
                            if (this.solveGrid()) {
                                return true;
                            }
                            
                            this.grid[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    getCellsToRemove(difficulty) {
        const difficultyMap = {
            'easy': 40,
            'medium': 50,
            'hard': 60,
            'expert': 70
        };
        return difficultyMap[difficulty] || 40;
    }

    removeCells(count) {
        const cells = [];
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                cells.push([i, j]);
            }
        }
        
        // Shuffle and remove cells one by one, checking for uniqueness
        for (let i = cells.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cells[i], cells[j]] = [cells[j], cells[i]];
        }
        
        let removed = 0;
        let attempts = 0;
        const maxAttempts = 200; // Prevent infinite loops
        
        for (let i = 0; i < cells.length && removed < count && attempts < maxAttempts; i++) {
            const [row, col] = cells[i];
            const originalValue = this.grid[row][col];
            
            // Temporarily remove the cell
            this.grid[row][col] = 0;
            
            // Check if puzzle still has unique solution
            if (this.hasUniqueSolution()) {
                removed++;
            } else {
                // Restore the value if removing it breaks uniqueness
                this.grid[row][col] = originalValue;
            }
            attempts++;
        }
        
        // If we couldn't remove enough cells, try a different approach
        if (removed < count && removed > 0) {
            this.updateProgress(`Generated puzzle with ${removed} empty cells (target was ${count})`);
        }
    }

    hasUniqueSolution() {
        // Create a copy of the grid
        const gridCopy = this.grid.map(row => [...row]);
        
        // Count solutions
        this.solutionCount = 0;
        this.countSolutions(gridCopy, 0, 0);
        
        return this.solutionCount === 1;
    }

    countSolutions(grid, row, col) {
        // If we've found more than one solution, stop counting
        if (this.solutionCount > 1) return;
        
        // If we've filled the entire grid, we found a solution
        if (row === 9) {
            this.solutionCount++;
            return;
        }
        
        // Move to next cell
        let nextRow = row;
        let nextCol = col + 1;
        if (nextCol === 9) {
            nextRow++;
            nextCol = 0;
        }
        
        // If current cell is already filled, move to next
        if (grid[row][col] !== 0) {
            this.countSolutions(grid, nextRow, nextCol);
            return;
        }
        
        // Try each possible value
        for (let num = 1; num <= 9; num++) {
            if (this.isValidMoveInGrid(grid, row, col, num)) {
                grid[row][col] = num;
                this.countSolutions(grid, nextRow, nextCol);
                grid[row][col] = 0;
                
                // If we found more than one solution, stop
                if (this.solutionCount > 1) return;
            }
        }
    }

    isValidMoveInGrid(grid, row, col, num) {
        // Check row
        for (let j = 0; j < 9; j++) {
            if (j !== col && grid[row][j] === num) return false;
        }

        // Check column
        for (let i = 0; i < 9; i++) {
            if (i !== row && grid[i][col] === num) return false;
        }

        // Check 3x3 box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let i = boxRow; i < boxRow + 3; i++) {
            for (let j = boxCol; j < boxCol + 3; j++) {
                if ((i !== row || j !== col) && grid[i][j] === num) return false;
            }
        }

        return true;
    }

    markGivenCells() {
        this.originalGrid = this.grid.map(row => [...row]);
        
        document.querySelectorAll('.cell').forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            
            if (this.originalGrid[row][col] !== 0) {
                cell.classList.add('given');
                cell.textContent = this.originalGrid[row][col];
            } else {
                cell.classList.remove('given');
                cell.textContent = '';
            }
        });
    }

    getHint() {
        // Look for naked singles (cells with only one possible value)
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (this.grid[i][j] === 0) {
                    const candidates = this.getCandidates(i, j);
                    if (candidates.length === 1) {
                        this.showTechnique('Naked Single', 
                            `Cell (${i+1}, ${j+1}) can only contain ${candidates[0]}. Look at the highlighted cell - it has only one possible value!`, 
                            [[i, j]]);
                        this.highlightHintCell(i, j);
                        this.updateProgress(`Hint: Cell (${i+1}, ${j+1}) can only be ${candidates[0]}`);
                        return;
                    }
                }
            }
        }

        // Look for hidden singles
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (this.grid[i][j] === 0) {
                    const candidates = this.getCandidates(i, j);
                    for (const candidate of candidates) {
                        if (this.isHiddenSingle(i, j, candidate)) {
                            this.showTechnique('Hidden Single', 
                                `In this row/column/box, ${candidate} can only go in cell (${i+1}, ${j+1}). Look at the highlighted area - ${candidate} appears nowhere else!`, 
                                [[i, j]]);
                            this.highlightHintArea(i, j, candidate);
                            this.updateProgress(`Hint: ${candidate} can only go in cell (${i+1}, ${j+1})`);
                            return;
                        }
                    }
                }
            }
        }

        // Look for naked pairs
        const nakedPair = this.findNakedPair();
        if (nakedPair) {
            this.showTechnique('Naked Pair', 
                `Cells (${nakedPair.cells[0][0]+1}, ${nakedPair.cells[0][1]+1}) and (${nakedPair.cells[1][0]+1}, ${nakedPair.cells[1][1]+1}) form a naked pair with values ${nakedPair.values.join(' and ')}. These values can be eliminated from other cells in the same unit.`, 
                nakedPair.cells);
            this.highlightHintCells(nakedPair.cells);
            this.updateProgress(`Hint: Found naked pair with values ${nakedPair.values.join(' and ')}`);
            return;
        }

        this.updateProgress("No obvious hints found. Try looking for cells with few candidates or use 'Solve Step' for more advanced techniques!");
    }

    highlightHintCell(row, col) {
        // Clear previous highlights
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('hint-highlight');
        });
        
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        cell.classList.add('hint-highlight');
    }

    highlightHintArea(row, col, value) {
        // Clear previous highlights
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('hint-highlight');
        });
        
        // Highlight the target cell
        const targetCell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        targetCell.classList.add('hint-highlight');
        
        // Highlight related cells that could contain the value
        const relatedCells = [];
        
        // Check row
        for (let j = 0; j < 9; j++) {
            if (j !== col && this.grid[row][j] === 0 && this.isValidMove(row, j, value)) {
                relatedCells.push([row, j]);
            }
        }
        
        // Check column
        for (let i = 0; i < 9; i++) {
            if (i !== row && this.grid[i][col] === 0 && this.isValidMove(i, col, value)) {
                relatedCells.push([i, col]);
            }
        }
        
        // Check 3x3 box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let i = boxRow; i < boxRow + 3; i++) {
            for (let j = boxCol; j < boxCol + 3; j++) {
                if ((i !== row || j !== col) && this.grid[i][j] === 0 && this.isValidMove(i, j, value)) {
                    relatedCells.push([i, j]);
                }
            }
        }
        
        // Highlight related cells with a different style
        relatedCells.forEach(([r, c]) => {
            const cell = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
            cell.classList.add('hint-related');
        });
    }

    highlightHintCells(cells) {
        // Clear previous highlights
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('hint-highlight', 'hint-related');
        });
        
        cells.forEach(([row, col]) => {
            const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            cell.classList.add('hint-highlight');
        });
    }

    findNakedPair() {
        // Check rows for naked pairs
        for (let row = 0; row < 9; row++) {
            const emptyCells = [];
            for (let col = 0; col < 9; col++) {
                if (this.grid[row][col] === 0) {
                    const candidates = this.getCandidates(row, col);
                    if (candidates.length === 2) {
                        emptyCells.push({row, col, candidates});
                    }
                }
            }
            
            // Look for pairs with same candidates
            for (let i = 0; i < emptyCells.length; i++) {
                for (let j = i + 1; j < emptyCells.length; j++) {
                    const cell1 = emptyCells[i];
                    const cell2 = emptyCells[j];
                    if (cell1.candidates.length === 2 && cell2.candidates.length === 2 &&
                        cell1.candidates.every(val => cell2.candidates.includes(val))) {
                        return {
                            cells: [[cell1.row, cell1.col], [cell2.row, cell2.col]],
                            values: cell1.candidates
                        };
                    }
                }
            }
        }
        return null;
    }

    getCandidates(row, col) {
        const candidates = [];
        for (let num = 1; num <= 9; num++) {
            if (this.isValidMove(row, col, num)) {
                candidates.push(num);
            }
        }
        return candidates;
    }

    isValidMove(row, col, num) {
        // Check row
        for (let j = 0; j < 9; j++) {
            if (j !== col && this.grid[row][j] === num) return false;
        }

        // Check column
        for (let i = 0; i < 9; i++) {
            if (i !== row && this.grid[i][col] === num) return false;
        }

        // Check 3x3 box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let i = boxRow; i < boxRow + 3; i++) {
            for (let j = boxCol; j < boxCol + 3; j++) {
                if ((i !== row || j !== col) && this.grid[i][j] === num) return false;
            }
        }

        return true;
    }

    isHiddenSingle(row, col, num) {
        // Check if num appears only in this cell in the row
        let countInRow = 0;
        for (let j = 0; j < 9; j++) {
            if (this.grid[row][j] === 0 && this.isValidMove(row, j, num)) {
                countInRow++;
            }
        }
        if (countInRow === 1) return true;

        // Check column
        let countInCol = 0;
        for (let i = 0; i < 9; i++) {
            if (this.grid[i][col] === 0 && this.isValidMove(i, col, num)) {
                countInCol++;
            }
        }
        if (countInCol === 1) return true;

        // Check 3x3 box
        let countInBox = 0;
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let i = boxRow; i < boxRow + 3; i++) {
            for (let j = boxCol; j < boxCol + 3; j++) {
                if (this.grid[i][j] === 0 && this.isValidMove(i, j, num)) {
                    countInBox++;
                }
            }
        }
        return countInBox === 1;
    }

    solveStep() {
        // Find the next logical step and actually solve it
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (this.grid[i][j] === 0) {
                    const candidates = this.getCandidates(i, j);
                    if (candidates.length === 1) {
                        this.showTechnique('Naked Single', 
                            `Cell (${i+1}, ${j+1}) can only contain ${candidates[0]}. Placing ${candidates[0]} now!`, 
                            [[i, j]]);
                        this.highlightHintCell(i, j);
                        this.setCellValue(i, j, candidates[0]);
                        this.updateProgress(`Solved step: Naked single at (${i+1}, ${j+1}) - placed ${candidates[0]}`);
                        return true;
                    }
                }
            }
        }

        // Look for hidden singles
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (this.grid[i][j] === 0) {
                    const candidates = this.getCandidates(i, j);
                    for (const candidate of candidates) {
                        if (this.isHiddenSingle(i, j, candidate)) {
                            this.showTechnique('Hidden Single', 
                                `In this row/column/box, ${candidate} can only go in cell (${i+1}, ${j+1}). Placing ${candidate} now!`, 
                                [[i, j]]);
                            this.highlightHintArea(i, j, candidate);
                            this.setCellValue(i, j, candidate);
                            this.updateProgress(`Solved step: Hidden single ${candidate} at (${i+1}, ${j+1})`);
                            return true;
                        }
                    }
                }
            }
        }

        this.updateProgress("No more logical steps found. Puzzle may be complete or need advanced techniques.");
        return false;
    }

    solveAll() {
        this.updateProgress("Solving puzzle...");
        let solved = false;
        let iterations = 0;
        const maxIterations = 100;
        let totalMoves = 0;

        while (!solved && iterations < maxIterations) {
            solved = true;
            let foundMove = false;

            // Try naked singles first
            for (let i = 0; i < 9; i++) {
                for (let j = 0; j < 9; j++) {
                    if (this.grid[i][j] === 0) {
                        const candidates = this.getCandidates(i, j);
                        if (candidates.length === 1) {
                            this.setCellValue(i, j, candidates[0]);
                            foundMove = true;
                            totalMoves++;
                        } else if (candidates.length === 0) {
                            this.updateProgress("Puzzle has no solution!");
                            return;
                        } else {
                            solved = false;
                        }
                    }
                }
            }

            // If no naked singles found, try hidden singles
            if (!foundMove) {
                for (let i = 0; i < 9; i++) {
                    for (let j = 0; j < 9; j++) {
                        if (this.grid[i][j] === 0) {
                            const candidates = this.getCandidates(i, j);
                            for (const candidate of candidates) {
                                if (this.isHiddenSingle(i, j, candidate)) {
                                    this.setCellValue(i, j, candidate);
                                    foundMove = true;
                                    totalMoves++;
                                    break;
                                }
                            }
                            if (foundMove) break;
                        }
                    }
                    if (foundMove) break;
                }
            }

            if (!foundMove && !solved) {
                // Try to solve remaining cells using backtracking
                if (this.solveRemainingCells()) {
                    this.updateProgress(`Puzzle solved completely using ${totalMoves} logical moves plus backtracking!`);
                    return;
                } else {
                    this.updateProgress("Puzzle requires advanced techniques to solve completely.");
                    return;
                }
            }
            iterations++;
        }

        if (solved) {
            this.updateProgress(`Puzzle solved completely using ${totalMoves} logical moves!`);
        } else {
            this.updateProgress(`Puzzle partially solved with ${totalMoves} moves. Advanced techniques needed for remaining cells.`);
        }
    }

    solveRemainingCells() {
        // Use backtracking to solve remaining cells
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (this.grid[i][j] === 0) {
                    for (let num = 1; num <= 9; num++) {
                        if (this.isValidMove(i, j, num)) {
                            this.setCellValue(i, j, num);
                            
                            if (this.solveRemainingCells()) {
                                return true;
                            }
                            
                            this.setCellValue(i, j, 0);
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    checkPuzzle() {
        let isValid = true;
        let isComplete = true;
        const errors = [];

        // Clear all error highlights
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('error');
        });

        // Check if puzzle is complete
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (this.grid[i][j] === 0) {
                    isComplete = false;
                }
            }
        }

        // Check for rule violations and highlight wrong cells
        const ruleViolations = this.checkRuleViolations();
        if (ruleViolations.length > 0) {
            this.updateProgress(`Puzzle contains rule violations! ${ruleViolations.join(', ')}`);
            return;
        }

        // If puzzle is complete, check if it's the correct solution
        if (isComplete) {
            this.updateProgress("Congratulations! Puzzle is complete and correct!");
            this.endGame(true); // End game as won
            return;
        }

        // If puzzle is incomplete, check if it has a unique solution
        this.updateProgress("Checking if puzzle has a unique solution...");
        
        // Check if current state can lead to a valid solution
        if (!this.canBeSolved()) {
            this.updateProgress("Puzzle cannot be solved - it contains logical contradictions!");
            return;
        }

        // Check if puzzle has exactly one solution
        const solutionCount = this.countSolutionsInCurrentState();
        if (solutionCount === 0) {
            this.updateProgress("Puzzle has no solution - it contains logical contradictions!");
        } else if (solutionCount === 1) {
            this.updateProgress("Puzzle is valid and has exactly one solution. Keep solving!");
        } else {
            this.updateProgress(`Warning: Puzzle has ${solutionCount} possible solutions. This is not a proper Sudoku puzzle!`);
        }
    }

    checkRuleViolations() {
        const violations = [];
        const errorCells = new Set();

        // Check rows for duplicates
        for (let row = 0; row < 9; row++) {
            const rowNumbers = [];
            const rowPositions = [];
            const rowIsGiven = [];
            for (let col = 0; col < 9; col++) {
                if (this.grid[row][col] !== 0) {
                    rowNumbers.push(this.grid[row][col]);
                    rowPositions.push([row, col]);
                    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                    rowIsGiven.push(cell.classList.contains('given'));
                }
            }
            
            // Find duplicates in this row
            const duplicates = this.findDuplicates(rowNumbers);
            if (duplicates.length > 0) {
                violations.push(`Row ${row + 1} has duplicate numbers`);
                // Highlight only user-entered cells with duplicate numbers
                for (let i = 0; i < rowNumbers.length; i++) {
                    if (duplicates.includes(rowNumbers[i]) && !rowIsGiven[i]) {
                        const [r, c] = rowPositions[i];
                        errorCells.add(`${r},${c}`);
                    }
                }
            }
        }

        // Check columns for duplicates
        for (let col = 0; col < 9; col++) {
            const colNumbers = [];
            const colPositions = [];
            const colIsGiven = [];
            for (let row = 0; row < 9; row++) {
                if (this.grid[row][col] !== 0) {
                    colNumbers.push(this.grid[row][col]);
                    colPositions.push([row, col]);
                    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                    colIsGiven.push(cell.classList.contains('given'));
                }
            }
            
            // Find duplicates in this column
            const duplicates = this.findDuplicates(colNumbers);
            if (duplicates.length > 0) {
                violations.push(`Column ${col + 1} has duplicate numbers`);
                // Highlight only user-entered cells with duplicate numbers
                for (let i = 0; i < colNumbers.length; i++) {
                    if (duplicates.includes(colNumbers[i]) && !colIsGiven[i]) {
                        const [r, c] = colPositions[i];
                        errorCells.add(`${r},${c}`);
                    }
                }
            }
        }

        // Check 3x3 boxes for duplicates
        for (let boxRow = 0; boxRow < 3; boxRow++) {
            for (let boxCol = 0; boxCol < 3; boxCol++) {
                const boxNumbers = [];
                const boxPositions = [];
                const boxIsGiven = [];
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 3; j++) {
                        const row = boxRow * 3 + i;
                        const col = boxCol * 3 + j;
                        if (this.grid[row][col] !== 0) {
                            boxNumbers.push(this.grid[row][col]);
                            boxPositions.push([row, col]);
                            const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                            boxIsGiven.push(cell.classList.contains('given'));
                        }
                    }
                }
                
                // Find duplicates in this box
                const duplicates = this.findDuplicates(boxNumbers);
                if (duplicates.length > 0) {
                    violations.push(`Box (${boxRow + 1}, ${boxCol + 1}) has duplicate numbers`);
                    // Highlight only user-entered cells with duplicate numbers
                    for (let i = 0; i < boxNumbers.length; i++) {
                        if (duplicates.includes(boxNumbers[i]) && !boxIsGiven[i]) {
                            const [r, c] = boxPositions[i];
                            errorCells.add(`${r},${c}`);
                        }
                    }
                }
            }
        }

        // Highlight all error cells (only user-entered ones)
        errorCells.forEach(cellKey => {
            const [row, col] = cellKey.split(',').map(Number);
            const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            if (cell && !cell.classList.contains('given')) {
                cell.classList.add('error');
            }
        });

        return violations;
    }

    findDuplicates(numbers) {
        const seen = new Set();
        const duplicates = new Set();
        
        for (const num of numbers) {
            if (seen.has(num)) {
                duplicates.add(num);
            } else {
                seen.add(num);
            }
        }
        
        return Array.from(duplicates);
    }

    isValidSudoku() {
        // Validate rows
        for (let row = 0; row < 9; row++) {
            const rowNumbers = [];
            for (let col = 0; col < 9; col++) {
                if (this.grid[row][col] !== 0) {
                    rowNumbers.push(this.grid[row][col]);
                }
            }
            if (this.hasDuplicates(rowNumbers)) {
                return false;
            }
        }

        // Validate columns
        for (let col = 0; col < 9; col++) {
            const colNumbers = [];
            for (let row = 0; row < 9; row++) {
                if (this.grid[row][col] !== 0) {
                    colNumbers.push(this.grid[row][col]);
                }
            }
            if (this.hasDuplicates(colNumbers)) {
                return false;
            }
        }

        // Validate 3x3 boxes
        for (let boxRow = 0; boxRow < 3; boxRow++) {
            for (let boxCol = 0; boxCol < 3; boxCol++) {
                const boxNumbers = [];
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 3; j++) {
                        const row = boxRow * 3 + i;
                        const col = boxCol * 3 + j;
                        if (this.grid[row][col] !== 0) {
                            boxNumbers.push(this.grid[row][col]);
                        }
                    }
                }
                if (this.hasDuplicates(boxNumbers)) {
                    return false;
                }
            }
        }

        return true;
    }

    canBeSolved() {
        // Check if there are any cells with no possible values
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (this.grid[i][j] === 0) {
                    const candidates = this.getCandidates(i, j);
                    if (candidates.length === 0) {
                        return false; // Cell has no possible values
                    }
                }
            }
        }
        return true;
    }

    countSolutionsInCurrentState() {
        // Create a copy of the current grid
        const gridCopy = this.grid.map(row => [...row]);
        
        // Count solutions using backtracking
        this.solutionCount = 0;
        this.countSolutionsWithLimit(gridCopy, 0, 0, 2); // Limit to 2 solutions for efficiency
        
        return this.solutionCount;
    }

    countSolutionsWithLimit(grid, row, col, limit) {
        // If we've found the limit, stop counting
        if (this.solutionCount >= limit) return;
        
        // If we've filled the entire grid, we found a solution
        if (row === 9) {
            this.solutionCount++;
            return;
        }
        
        // Move to next cell
        let nextRow = row;
        let nextCol = col + 1;
        if (nextCol === 9) {
            nextRow++;
            nextCol = 0;
        }
        
        // If current cell is already filled, move to next
        if (grid[row][col] !== 0) {
            this.countSolutionsWithLimit(grid, nextRow, nextCol, limit);
            return;
        }
        
        // Try each possible value
        for (let num = 1; num <= 9; num++) {
            if (this.isValidMoveInGrid(grid, row, col, num)) {
                grid[row][col] = num;
                this.countSolutionsWithLimit(grid, nextRow, nextCol, limit);
                grid[row][col] = 0;
                
                // If we found the limit, stop
                if (this.solutionCount >= limit) return;
            }
        }
    }

    hasDuplicates(numbers) {
        const seen = new Set();
        for (const num of numbers) {
            if (seen.has(num)) {
                return true;
            }
            seen.add(num);
        }
        return false;
    }

    clearPuzzle() {
        this.grid = Array(9).fill().map(() => Array(9).fill(0));
        this.originalGrid = Array(9).fill().map(() => Array(9).fill(0));
        
        document.querySelectorAll('.cell').forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('given', 'error', 'selected', 'highlighted', 'technique-highlight', 'hint-highlight', 'hint-related');
        });
        
        this.selectedCell = null;
        this.clearTechniqueInfo();
        this.updateProgress("Puzzle cleared");
    }

    clearUserErrors() {
        // Clear errors only from user-entered cells (not given cells)
        document.querySelectorAll('.cell').forEach(cell => {
            if (!cell.classList.contains('given')) {
                cell.classList.remove('error');
            }
        });
    }

    showTechnique(name, description, cells) {
        document.getElementById('techniqueName').textContent = name;
        document.getElementById('techniqueDescription').textContent = description;
        
        // Highlight technique cells
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('technique-highlight');
        });
        
        cells.forEach(([row, col]) => {
            const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            cell.classList.add('technique-highlight');
        });
    }

    clearTechniqueInfo() {
        document.getElementById('techniqueName').textContent = 'None';
        document.getElementById('techniqueDescription').textContent = 'Click "Get Hint" or "Solve Step" to see techniques in action!';
        
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('technique-highlight');
        });
    }

    updateProgress(message) {
        document.getElementById('progress').textContent = message;
    }

    // Game Tracking Methods
    loadGameStats() {
        const defaultStats = {
            totalGames: 0,
            gamesWon: 0,
            totalTime: 0,
            difficultyStats: {
                easy: { played: 0, won: 0, totalTime: 0 },
                medium: { played: 0, won: 0, totalTime: 0 },
                hard: { played: 0, won: 0, totalTime: 0 },
                expert: { played: 0, won: 0, totalTime: 0 }
            },
            recentGames: []
        };
        
        const saved = localStorage.getItem('sudokuGameStats');
        return saved ? { ...defaultStats, ...JSON.parse(saved) } : defaultStats;
    }

    saveGameStats() {
        localStorage.setItem('sudokuGameStats', JSON.stringify(this.gameStats));
    }

    startNewGame(difficulty) {
        this.currentGame = {
            startTime: Date.now(),
            difficulty: difficulty,
            hintsUsed: 0,
            moves: 0,
            isActive: true
        };
        
        // Start timer
        this.startTimer();
        
        // Update current game display
        this.updateCurrentGameDisplay();
    }

    startTimer() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
        }
        
        this.gameTimer = setInterval(() => {
            if (this.currentGame.isActive) {
                this.updateCurrentGameDisplay();
            }
        }, 1000);
    }

    stopTimer() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
    }

    updateCurrentGameDisplay() {
        if (!this.currentGame.isActive) return;
        
        const elapsed = Math.floor((Date.now() - this.currentGame.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        document.getElementById('currentTime').textContent = timeString;
        document.getElementById('hintsUsed').textContent = this.currentGame.hintsUsed;
        document.getElementById('moveCount').textContent = this.currentGame.moves;
        document.getElementById('currentDifficulty').textContent = 
            this.currentGame.difficulty ? this.currentGame.difficulty.charAt(0).toUpperCase() + this.currentGame.difficulty.slice(1) : '-';
    }

    recordMove() {
        if (this.currentGame.isActive) {
            this.currentGame.moves++;
            this.updateCurrentGameDisplay();
        }
    }

    recordHint() {
        if (this.currentGame.isActive) {
            this.currentGame.hintsUsed++;
            this.updateCurrentGameDisplay();
        }
    }

    endGame(won = false) {
        if (!this.currentGame.isActive) return;
        
        this.stopTimer();
        
        const gameTime = Math.floor((Date.now() - this.currentGame.startTime) / 1000);
        
        // Update stats
        this.gameStats.totalGames++;
        if (won) {
            this.gameStats.gamesWon++;
        }
        this.gameStats.totalTime += gameTime;
        
        // Update difficulty stats
        const diff = this.currentGame.difficulty;
        if (this.gameStats.difficultyStats[diff]) {
            this.gameStats.difficultyStats[diff].played++;
            if (won) {
                this.gameStats.difficultyStats[diff].won++;
            }
            this.gameStats.difficultyStats[diff].totalTime += gameTime;
        }
        
        // Add to recent games
        const gameRecord = {
            difficulty: diff,
            time: gameTime,
            won: won,
            hintsUsed: this.currentGame.hintsUsed,
            moves: this.currentGame.moves,
            date: new Date().toISOString()
        };
        
        this.gameStats.recentGames.unshift(gameRecord);
        if (this.gameStats.recentGames.length > 10) {
            this.gameStats.recentGames = this.gameStats.recentGames.slice(0, 10);
        }
        
        // Save stats
        this.saveGameStats();
        
        // Reset current game
        this.currentGame.isActive = false;
        
        // Update dashboard
        this.updateDashboard();
    }

    updateDashboard() {
        // Update main stats
        document.getElementById('totalGames').textContent = this.gameStats.totalGames;
        document.getElementById('gamesWon').textContent = this.gameStats.gamesWon;
        
        const winRate = this.gameStats.totalGames > 0 ? 
            Math.round((this.gameStats.gamesWon / this.gameStats.totalGames) * 100) : 0;
        document.getElementById('winRate').textContent = `${winRate}%`;
        
        const avgTime = this.gameStats.gamesWon > 0 ? 
            Math.floor(this.gameStats.totalTime / this.gameStats.gamesWon) : 0;
        const avgMinutes = Math.floor(avgTime / 60);
        const avgSeconds = avgTime % 60;
        document.getElementById('avgTime').textContent = `${avgMinutes}:${avgSeconds.toString().padStart(2, '0')}`;
        
        // Update difficulty stats
        document.getElementById('easyCount').textContent = this.gameStats.difficultyStats.easy.played;
        document.getElementById('mediumCount').textContent = this.gameStats.difficultyStats.medium.played;
        document.getElementById('hardCount').textContent = this.gameStats.difficultyStats.hard.played;
        document.getElementById('expertCount').textContent = this.gameStats.difficultyStats.expert.played;
        
        // Update recent games
        this.updateRecentGames();
    }

    updateRecentGames() {
        const container = document.getElementById('recentGames');
        
        if (this.gameStats.recentGames.length === 0) {
            container.innerHTML = '<div class="no-games">No games played yet</div>';
            return;
        }
        
        container.innerHTML = this.gameStats.recentGames.map(game => {
            const minutes = Math.floor(game.time / 60);
            const seconds = game.time % 60;
            const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            const date = new Date(game.date).toLocaleDateString();
            
            return `
                <div class="recent-game-item">
                    <div class="game-info">
                        <div class="game-difficulty">${game.difficulty.charAt(0).toUpperCase() + game.difficulty.slice(1)}</div>
                        <div class="game-time">${date} - ${timeString}</div>
                    </div>
                    <div class="game-result">${game.won ? '✅ Won' : '❌ Lost'}</div>
                </div>
            `;
        }).join('');
    }

    exportData() {
        const dataStr = JSON.stringify(this.gameStats, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'sudoku-game-stats.json';
        link.click();
        URL.revokeObjectURL(url);
    }

    clearAllData() {
        if (confirm('Are you sure you want to clear all game data? This cannot be undone.')) {
            localStorage.removeItem('sudokuGameStats');
            this.gameStats = this.loadGameStats();
            this.updateDashboard();
            this.updateProgress('All game data cleared');
        }
    }
}

// Global functions for HTML buttons
let sudokuApp;

function generatePuzzle(difficulty) {
    sudokuApp.generatePuzzle(difficulty);
}

function getHint() {
    sudokuApp.getHint();
    sudokuApp.recordHint();
}

function solveStep() {
    sudokuApp.solveStep();
}

function solveAll() {
    sudokuApp.solveAll();
}

function checkPuzzle() {
    sudokuApp.checkPuzzle();
}

function clearPuzzle() {
    sudokuApp.clearPuzzle();
}

function showGame() {
    document.getElementById('gamePanel').style.display = 'block';
    document.getElementById('dashboardPanel').style.display = 'none';
}

function showDashboard() {
    document.getElementById('gamePanel').style.display = 'none';
    document.getElementById('dashboardPanel').style.display = 'block';
    sudokuApp.updateDashboard();
}

function exportData() {
    sudokuApp.exportData();
}

function clearAllData() {
    sudokuApp.clearAllData();
}

function closeModal() {
    document.getElementById('techniqueModal').style.display = 'none';
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    sudokuApp = new SudokuApp();
    
    // Populate technique guide
    const guideContent = `
        <h3>1. Naked Single</h3>
        <p>A cell that has only one possible value. Look for cells with only one candidate remaining.</p>
        
        <h3>2. Hidden Single</h3>
        <p>A value that can only go in one cell within a row, column, or box. Look for numbers that appear in only one cell in a unit.</p>
        
        <h3>3. Naked Pair</h3>
        <p>Two cells in the same unit that contain the same two candidates. These candidates can be eliminated from other cells in the unit.</p>
        
        <h3>4. Hidden Pair</h3>
        <p>Two candidates that appear in only two cells within a unit. Other candidates in those cells can be eliminated.</p>
        
        <h3>5. Pointing Pair/Triple</h3>
        <p>When candidates in a box are limited to one row or column. Those candidates can be eliminated from the rest of the row/column.</p>
        
        <h3>6. Box/Line Reduction</h3>
        <p>When candidates in a row/column are limited to one box. Those candidates can be eliminated from the rest of the box.</p>
        
        <h3>Tips for Beginners:</h3>
        <ul>
            <li>Always start with naked singles and hidden singles</li>
            <li>Look for the most constrained cells first</li>
            <li>Don't guess - use logic and techniques</li>
            <li>Practice regularly to improve pattern recognition</li>
        </ul>
    `;
    
    document.getElementById('techniqueGuide').innerHTML = guideContent;
});
