"""
Core Sudoku solving and generation algorithms
"""
import numpy as np
import random
from typing import List, Tuple, Optional, Dict, Set
from dataclasses import dataclass
from enum import Enum

class Difficulty(Enum):
    EASY = 1
    MEDIUM = 2
    HARD = 3
    EXPERT = 4

@dataclass
class Cell:
    """Represents a single cell in the Sudoku grid"""
    row: int
    col: int
    value: int = 0
    candidates: Set[int] = None
    is_given: bool = False
    
    def __post_init__(self):
        if self.candidates is None:
            self.candidates = set(range(1, 10)) if self.value == 0 else set()

@dataclass
class Technique:
    """Represents a Sudoku solving technique"""
    name: str
    description: str
    cells_affected: List[Tuple[int, int]]
    values_removed: Set[int]
    explanation: str

class SudokuSolver:
    """Main Sudoku solving engine with educational features"""
    
    def __init__(self):
        self.grid = np.zeros((9, 9), dtype=int)
        self.cells = [[Cell(i, j) for j in range(9)] for i in range(9)]
        self.techniques_used = []
        
    def load_puzzle(self, puzzle: List[List[int]]):
        """Load a puzzle into the solver"""
        self.grid = np.array(puzzle)
        for i in range(9):
            for j in range(9):
                self.cells[i][j] = Cell(i, j, puzzle[i][j], is_given=(puzzle[i][j] != 0))
                if puzzle[i][j] == 0:
                    self.cells[i][j].candidates = self._get_candidates(i, j)
                else:
                    self.cells[i][j].candidates = set()
    
    def _get_candidates(self, row: int, col: int) -> Set[int]:
        """Get possible candidates for a cell"""
        if self.grid[row, col] != 0:
            return set()
        
        candidates = set(range(1, 10))
        
        # Remove values from row
        candidates -= set(self.grid[row, :])
        
        # Remove values from column
        candidates -= set(self.grid[:, col])
        
        # Remove values from 3x3 box
        box_row, box_col = (row // 3) * 3, (col // 3) * 3
        box_values = set(self.grid[box_row:box_row+3, box_col:box_col+3].flatten())
        candidates -= box_values
        
        return candidates
    
    def solve_with_techniques(self) -> List[Technique]:
        """Solve the puzzle step by step, recording techniques used"""
        self.techniques_used = []
        
        while not self.is_solved():
            technique = self._find_next_technique()
            if technique:
                self._apply_technique(technique)
                self.techniques_used.append(technique)
            else:
                # Fall back to backtracking for unsolvable puzzles
                if self._backtrack_solve():
                    break
                else:
                    raise ValueError("Puzzle is unsolvable")
        
        return self.techniques_used
    
    def _find_next_technique(self) -> Optional[Technique]:
        """Find the next technique that can be applied"""
        # Update all candidates first
        self._update_all_candidates()
        
        # Try techniques in order of difficulty
        techniques = [
            self._find_naked_single,
            self._find_hidden_single,
            self._find_naked_pair,
            self._find_hidden_pair,
            self._find_pointing_pair,
            self._find_box_line_reduction
        ]
        
        for technique_func in techniques:
            technique = technique_func()
            if technique:
                return technique
        
        return None
    
    def _find_naked_single(self) -> Optional[Technique]:
        """Find cells with only one candidate (naked single)"""
        for i in range(9):
            for j in range(9):
                if self.grid[i, j] == 0 and len(self.cells[i][j].candidates) == 1:
                    value = list(self.cells[i][j].candidates)[0]
                    return Technique(
                        name="Naked Single",
                        description=f"Cell ({i+1}, {j+1}) can only contain {value}",
                        cells_affected=[(i, j)],
                        values_removed=set(),
                        explanation=f"Cell ({i+1}, {j+1}) has only one possible value: {value}"
                    )
        return None
    
    def _find_hidden_single(self) -> Optional[Technique]:
        """Find hidden singles in rows, columns, and boxes"""
        # Check rows
        for i in range(9):
            for value in range(1, 10):
                if value not in self.grid[i, :]:
                    positions = []
                    for j in range(9):
                        if self.grid[i, j] == 0 and value in self.cells[i][j].candidates:
                            positions.append((i, j))
                    if len(positions) == 1:
                        row, col = positions[0]
                        return Technique(
                            name="Hidden Single (Row)",
                            description=f"Value {value} can only go in cell ({row+1}, {col+1}) in row {row+1}",
                            cells_affected=[(row, col)],
                            values_removed=set(),
                            explanation=f"In row {row+1}, value {value} can only be placed in cell ({row+1}, {col+1})"
                        )
        
        # Check columns
        for j in range(9):
            for value in range(1, 10):
                if value not in self.grid[:, j]:
                    positions = []
                    for i in range(9):
                        if self.grid[i, j] == 0 and value in self.cells[i][j].candidates:
                            positions.append((i, j))
                    if len(positions) == 1:
                        row, col = positions[0]
                        return Technique(
                            name="Hidden Single (Column)",
                            description=f"Value {value} can only go in cell ({row+1}, {col+1}) in column {col+1}",
                            cells_affected=[(row, col)],
                            values_removed=set(),
                            explanation=f"In column {col+1}, value {value} can only be placed in cell ({row+1}, {col+1})"
                        )
        
        # Check boxes
        for box_row in range(0, 9, 3):
            for box_col in range(0, 9, 3):
                for value in range(1, 10):
                    box_values = set(self.grid[box_row:box_row+3, box_col:box_col+3].flatten())
                    if value not in box_values:
                        positions = []
                        for i in range(box_row, box_row+3):
                            for j in range(box_col, box_col+3):
                                if self.grid[i, j] == 0 and value in self.cells[i][j].candidates:
                                    positions.append((i, j))
                        if len(positions) == 1:
                            row, col = positions[0]
                            return Technique(
                                name="Hidden Single (Box)",
                                description=f"Value {value} can only go in cell ({row+1}, {col+1}) in box",
                                cells_affected=[(row, col)],
                                values_removed=set(),
                                explanation=f"In the 3x3 box, value {value} can only be placed in cell ({row+1}, {col+1})"
                            )
        return None
    
    def _find_naked_pair(self) -> Optional[Technique]:
        """Find naked pairs (two cells with same two candidates)"""
        # This is a simplified version - full implementation would be more complex
        return None
    
    def _find_hidden_pair(self) -> Optional[Technique]:
        """Find hidden pairs"""
        return None
    
    def _find_pointing_pair(self) -> Optional[Technique]:
        """Find pointing pairs/triples"""
        return None
    
    def _find_box_line_reduction(self) -> Optional[Technique]:
        """Find box/line reduction"""
        return None
    
    def _apply_technique(self, technique: Technique):
        """Apply a solving technique to the grid"""
        for row, col in technique.cells_affected:
            if len(self.cells[row][col].candidates) == 1:
                value = list(self.cells[row][col].candidates)[0]
                self.grid[row, col] = value
                self.cells[row][col].value = value
                self.cells[row][col].candidates = set()
    
    def _update_all_candidates(self):
        """Update candidates for all empty cells"""
        for i in range(9):
            for j in range(9):
                if self.grid[i, j] == 0:
                    self.cells[i][j].candidates = self._get_candidates(i, j)
    
    def _backtrack_solve(self) -> bool:
        """Solve using backtracking algorithm"""
        def is_valid(row, col, num):
            # Check row
            if num in self.grid[row, :]:
                return False
            
            # Check column
            if num in self.grid[:, col]:
                return False
            
            # Check 3x3 box
            box_row, box_col = (row // 3) * 3, (col // 3) * 3
            if num in self.grid[box_row:box_row+3, box_col:box_col+3]:
                return False
            
            return True
        
        def solve():
            for i in range(9):
                for j in range(9):
                    if self.grid[i, j] == 0:
                        for num in range(1, 10):
                            if is_valid(i, j, num):
                                self.grid[i, j] = num
                                if solve():
                                    return True
                                self.grid[i, j] = 0
                        return False
            return True
        
        return solve()
    
    def is_solved(self) -> bool:
        """Check if the puzzle is completely solved"""
        return np.all(self.grid != 0) and self.is_valid()
    
    def is_valid(self) -> bool:
        """Check if the current grid is valid"""
        # Check rows
        for i in range(9):
            row = self.grid[i, :]
            if len(set(row[row != 0])) != len(row[row != 0]):
                return False
        
        # Check columns
        for j in range(9):
            col = self.grid[:, j]
            if len(set(col[col != 0])) != len(col[col != 0]):
                return False
        
        # Check 3x3 boxes
        for i in range(0, 9, 3):
            for j in range(0, 9, 3):
                box = self.grid[i:i+3, j:j+3].flatten()
                if len(set(box[box != 0])) != len(box[box != 0]):
                    return False
        
        return True
    
    def get_hint(self) -> Optional[Technique]:
        """Get the next hint for the user"""
        self._update_all_candidates()
        return self._find_next_technique()

class SudokuGenerator:
    """Generate Sudoku puzzles of varying difficulty"""
    
    def __init__(self):
        self.solver = SudokuSolver()
    
    def generate_puzzle(self, difficulty: Difficulty = Difficulty.MEDIUM) -> List[List[int]]:
        """Generate a Sudoku puzzle of specified difficulty"""
        # Start with a complete solved grid
        complete_grid = self._generate_complete_grid()
        
        # Remove numbers based on difficulty
        puzzle = self._remove_numbers(complete_grid, difficulty)
        
        return puzzle.tolist()
    
    def _generate_complete_grid(self) -> np.ndarray:
        """Generate a complete, valid Sudoku grid"""
        grid = np.zeros((9, 9), dtype=int)
        
        # Fill diagonal 3x3 boxes first (they don't interfere with each other)
        for i in range(0, 9, 3):
            self._fill_box(grid, i, i)
        
        # Fill remaining cells using backtracking
        self._fill_remaining(grid)
        
        return grid
    
    def _fill_box(self, grid: np.ndarray, row: int, col: int):
        """Fill a 3x3 box with numbers 1-9"""
        numbers = list(range(1, 10))
        random.shuffle(numbers)
        
        for i in range(3):
            for j in range(3):
                grid[row + i, col + j] = numbers[i * 3 + j]
    
    def _fill_remaining(self, grid: np.ndarray) -> bool:
        """Fill remaining cells using backtracking"""
        for i in range(9):
            for j in range(9):
                if grid[i, j] == 0:
                    for num in range(1, 10):
                        if self._is_safe(grid, i, j, num):
                            grid[i, j] = num
                            if self._fill_remaining(grid):
                                return True
                            grid[i, j] = 0
                    return False
        return True
    
    def _is_safe(self, grid: np.ndarray, row: int, col: int, num: int) -> bool:
        """Check if it's safe to place a number at given position"""
        # Check row
        if num in grid[row, :]:
            return False
        
        # Check column
        if num in grid[:, col]:
            return False
        
        # Check 3x3 box
        box_row, box_col = (row // 3) * 3, (col // 3) * 3
        if num in grid[box_row:box_row+3, box_col:box_col+3]:
            return False
        
        return True
    
    def _remove_numbers(self, grid: np.ndarray, difficulty: Difficulty) -> np.ndarray:
        """Remove numbers from complete grid based on difficulty"""
        puzzle = grid.copy()
        
        # Number of cells to remove based on difficulty
        cells_to_remove = {
            Difficulty.EASY: 30,
            Difficulty.MEDIUM: 40,
            Difficulty.HARD: 50,
            Difficulty.EXPERT: 60
        }
        
        # Get all cell positions
        positions = [(i, j) for i in range(9) for j in range(9)]
        random.shuffle(positions)
        
        removed = 0
        for row, col in positions:
            if removed >= cells_to_remove[difficulty]:
                break
            
            # Store original value
            original_value = puzzle[row, col]
            puzzle[row, col] = 0
            
            # Check if puzzle still has unique solution
            if self._has_unique_solution(puzzle):
                removed += 1
            else:
                # Restore original value if no unique solution
                puzzle[row, col] = original_value
        
        return puzzle
    
    def _has_unique_solution(self, puzzle: np.ndarray) -> bool:
        """Check if puzzle has exactly one solution"""
        solver = SudokuSolver()
        solver.load_puzzle(puzzle.tolist())
        
        # Count solutions
        solutions = []
        self._count_solutions(puzzle.copy(), solutions)
        
        return len(solutions) == 1
    
    def _count_solutions(self, grid: np.ndarray, solutions: List, max_solutions: int = 2):
        """Count number of solutions (limited to max_solutions for efficiency)"""
        if len(solutions) >= max_solutions:
            return
        
        for i in range(9):
            for j in range(9):
                if grid[i, j] == 0:
                    for num in range(1, 10):
                        if self._is_safe(grid, i, j, num):
                            grid[i, j] = num
                            self._count_solutions(grid, solutions, max_solutions)
                            grid[i, j] = 0
                            if len(solutions) >= max_solutions:
                                return
                    return
        
        # If we reach here, grid is complete
        solutions.append(grid.copy())

