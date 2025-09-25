"""
Interactive GUI for Sudoku solver and creator with educational features
"""
import tkinter as tk
from tkinter import ttk, messagebox, font
import numpy as np
from sudoku_core import SudokuSolver, SudokuGenerator, Difficulty, Technique

class SudokuGUI:
    """Main GUI application for Sudoku solver and creator"""
    
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("Sudoku Solver & Creator - Learn Sudoku Techniques")
        self.root.geometry("1000x700")
        self.root.configure(bg='#f0f0f0')
        
        # Center the window on screen
        self.center_window()
        
        # Make sure window is visible
        self.root.deiconify()  # Ensure window is not minimized
        
        # Initialize core components
        self.solver = SudokuSolver()
        self.generator = SudokuGenerator()
        self.current_puzzle = None
        self.techniques_used = []
        self.current_step = 0
        
        # Create GUI elements
        self.create_widgets()
        self.create_menu()
    
    def center_window(self):
        """Center the window on the screen"""
        self.root.update_idletasks()
        width = self.root.winfo_width()
        height = self.root.winfo_height()
        x = (self.root.winfo_screenwidth() // 2) - (width // 2)
        y = (self.root.winfo_screenheight() // 2) - (height // 2)
        self.root.geometry(f'{width}x{height}+{x}+{y}')
        
    def create_menu(self):
        """Create menu bar"""
        menubar = tk.Menu(self.root)
        self.root.config(menu=menubar)
        
        # File menu
        file_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="File", menu=file_menu)
        file_menu.add_command(label="New Puzzle", command=self.new_puzzle)
        file_menu.add_command(label="Load Puzzle", command=self.load_puzzle)
        file_menu.add_command(label="Save Puzzle", command=self.save_puzzle)
        file_menu.add_separator()
        file_menu.add_command(label="Exit", command=self.root.quit)
        
        # Generate menu
        generate_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="Generate", menu=generate_menu)
        generate_menu.add_command(label="Easy", command=lambda: self.generate_puzzle(Difficulty.EASY))
        generate_menu.add_command(label="Medium", command=lambda: self.generate_puzzle(Difficulty.MEDIUM))
        generate_menu.add_command(label="Hard", command=lambda: self.generate_puzzle(Difficulty.HARD))
        generate_menu.add_command(label="Expert", command=lambda: self.generate_puzzle(Difficulty.EXPERT))
        
        # Help menu
        help_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="Help", menu=help_menu)
        help_menu.add_command(label="Techniques Guide", command=self.show_techniques_guide)
        help_menu.add_command(label="About", command=self.show_about)
    
    def create_widgets(self):
        """Create main GUI widgets"""
        # Main frame
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Configure grid weights
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)
        main_frame.columnconfigure(1, weight=1)
        main_frame.rowconfigure(0, weight=1)
        
        # Left panel - Sudoku grid
        self.create_sudoku_grid(main_frame)
        
        # Right panel - Controls and information
        self.create_control_panel(main_frame)
        
    def create_sudoku_grid(self, parent):
        """Create the 9x9 Sudoku grid"""
        grid_frame = ttk.LabelFrame(parent, text="Sudoku Puzzle", padding="10")
        grid_frame.grid(row=0, column=0, padx=(0, 10), sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Create 9x9 grid of entry widgets
        self.cells = []
        for i in range(9):
            row = []
            for j in range(9):
                cell = tk.Entry(
                    grid_frame,
                    width=3,
                    font=('Arial', 16, 'bold'),
                    justify='center',
                    relief='solid',
                    bd=1
                )
                cell.grid(row=i, column=j, padx=1, pady=1, ipady=5)
                
                # Add validation
                cell.bind('<KeyPress>', lambda e, r=i, c=j: self.validate_input(e, r, c))
                cell.bind('<FocusIn>', lambda e, r=i, c=j: self.on_cell_focus(r, c))
                cell.bind('<FocusOut>', lambda e, r=i, c=j: self.on_cell_unfocus(r, c))
                
                row.append(cell)
            self.cells.append(row)
        
        # Add thick borders for 3x3 boxes
        self.add_thick_borders()
    
    def add_thick_borders(self):
        """Add thick borders to separate 3x3 boxes"""
        for i in range(9):
            for j in range(9):
                if i % 3 == 2:  # Bottom border of 3x3 box
                    self.cells[i][j].configure(relief='solid', bd=2)
                if j % 3 == 2:  # Right border of 3x3 box
                    self.cells[i][j].configure(relief='solid', bd=2)
                if i % 3 == 2 and j % 3 == 2:  # Corner
                    self.cells[i][j].configure(relief='solid', bd=3)
    
    def create_control_panel(self, parent):
        """Create control panel with buttons and information"""
        control_frame = ttk.LabelFrame(parent, text="Controls & Information", padding="10")
        control_frame.grid(row=0, column=1, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Difficulty selection
        ttk.Label(control_frame, text="Generate Puzzle:").pack(anchor=tk.W, pady=(0, 5))
        difficulty_frame = ttk.Frame(control_frame)
        difficulty_frame.pack(fill=tk.X, pady=(0, 10))
        
        ttk.Button(difficulty_frame, text="Easy", 
                  command=lambda: self.generate_puzzle(Difficulty.EASY)).pack(side=tk.LEFT, padx=(0, 5))
        ttk.Button(difficulty_frame, text="Medium", 
                  command=lambda: self.generate_puzzle(Difficulty.MEDIUM)).pack(side=tk.LEFT, padx=(0, 5))
        ttk.Button(difficulty_frame, text="Hard", 
                  command=lambda: self.generate_puzzle(Difficulty.HARD)).pack(side=tk.LEFT, padx=(0, 5))
        ttk.Button(difficulty_frame, text="Expert", 
                  command=lambda: self.generate_puzzle(Difficulty.EXPERT)).pack(side=tk.LEFT)
        
        # Solve buttons
        ttk.Label(control_frame, text="Solving:").pack(anchor=tk.W, pady=(10, 5))
        solve_frame = ttk.Frame(control_frame)
        solve_frame.pack(fill=tk.X, pady=(0, 10))
        
        ttk.Button(solve_frame, text="Get Hint", 
                  command=self.get_hint).pack(side=tk.LEFT, padx=(0, 5))
        ttk.Button(solve_frame, text="Solve Step", 
                  command=self.solve_step).pack(side=tk.LEFT, padx=(0, 5))
        ttk.Button(solve_frame, text="Solve All", 
                  command=self.solve_all).pack(side=tk.LEFT)
        
        # Validation
        ttk.Label(control_frame, text="Validation:").pack(anchor=tk.W, pady=(10, 5))
        validation_frame = ttk.Frame(control_frame)
        validation_frame.pack(fill=tk.X, pady=(0, 10))
        
        ttk.Button(validation_frame, text="Check Puzzle", 
                  command=self.check_puzzle).pack(side=tk.LEFT, padx=(0, 5))
        ttk.Button(validation_frame, text="Clear", 
                  command=self.clear_puzzle).pack(side=tk.LEFT)
        
        # Technique information
        ttk.Label(control_frame, text="Current Technique:").pack(anchor=tk.W, pady=(10, 5))
        self.technique_label = ttk.Label(control_frame, text="None", 
                                        wraplength=300, justify=tk.LEFT)
        self.technique_label.pack(anchor=tk.W, pady=(0, 5))
        
        # Explanation
        ttk.Label(control_frame, text="Explanation:").pack(anchor=tk.W, pady=(10, 5))
        self.explanation_text = tk.Text(control_frame, height=8, width=40, 
                                       wrap=tk.WORD, font=('Arial', 10))
        self.explanation_text.pack(fill=tk.BOTH, expand=True, pady=(0, 10))
        
        # Progress
        ttk.Label(control_frame, text="Progress:").pack(anchor=tk.W, pady=(10, 5))
        self.progress_var = tk.StringVar(value="Ready to start")
        ttk.Label(control_frame, textvariable=self.progress_var).pack(anchor=tk.W)
        
        # Step navigation
        step_frame = ttk.Frame(control_frame)
        step_frame.pack(fill=tk.X, pady=(10, 0))
        
        ttk.Button(step_frame, text="Previous Step", 
                  command=self.previous_step).pack(side=tk.LEFT, padx=(0, 5))
        ttk.Button(step_frame, text="Next Step", 
                  command=self.next_step).pack(side=tk.LEFT)
        
        # Test button to verify GUI is working
        test_frame = ttk.Frame(control_frame)
        test_frame.pack(fill=tk.X, pady=(10, 0))
        
        ttk.Button(test_frame, text="Test GUI", 
                  command=self.test_gui).pack(side=tk.LEFT)
    
    def validate_input(self, event, row, col):
        """Validate input in Sudoku cells"""
        char = event.char
        if char and not (char.isdigit() and 1 <= int(char) <= 9):
            return "break"  # Ignore invalid input
        return None
    
    def on_cell_focus(self, row, col):
        """Handle cell focus events"""
        # Highlight related cells (same row, column, box)
        self.highlight_related_cells(row, col)
    
    def on_cell_unfocus(self, row, col):
        """Handle cell unfocus events"""
        self.clear_highlights()
    
    def highlight_related_cells(self, row, col):
        """Highlight cells in same row, column, and 3x3 box"""
        self.clear_highlights()
        
        # Highlight row
        for j in range(9):
            self.cells[row][j].configure(bg='#e6f3ff')
        
        # Highlight column
        for i in range(9):
            self.cells[i][col].configure(bg='#e6f3ff')
        
        # Highlight 3x3 box
        box_row, box_col = (row // 3) * 3, (col // 3) * 3
        for i in range(box_row, box_row + 3):
            for j in range(box_col, box_col + 3):
                self.cells[i][j].configure(bg='#e6f3ff')
        
        # Highlight current cell
        self.cells[row][col].configure(bg='#b3d9ff')
    
    def clear_highlights(self):
        """Clear all cell highlights"""
        for i in range(9):
            for j in range(9):
                self.cells[i][j].configure(bg='white')
    
    def generate_puzzle(self, difficulty: Difficulty):
        """Generate a new puzzle of specified difficulty"""
        try:
            puzzle = self.generator.generate_puzzle(difficulty)
            self.load_puzzle_to_grid(puzzle)
            self.current_puzzle = puzzle
            self.techniques_used = []
            self.current_step = 0
            self.update_progress(f"Generated {difficulty.name.lower()} puzzle")
            self.clear_technique_info()
        except Exception as e:
            messagebox.showerror("Error", f"Failed to generate puzzle: {str(e)}")
    
    def load_puzzle_to_grid(self, puzzle):
        """Load puzzle data into the GUI grid"""
        for i in range(9):
            for j in range(9):
                if puzzle[i][j] != 0:
                    self.cells[i][j].delete(0, tk.END)
                    self.cells[i][j].insert(0, str(puzzle[i][j]))
                    self.cells[i][j].configure(fg='black', state='normal')
                else:
                    self.cells[i][j].delete(0, tk.END)
                    self.cells[i][j].configure(fg='blue', state='normal')
    
    def get_puzzle_from_grid(self):
        """Get current puzzle state from GUI grid"""
        puzzle = []
        for i in range(9):
            row = []
            for j in range(9):
                value = self.cells[i][j].get()
                row.append(int(value) if value.isdigit() else 0)
            puzzle.append(row)
        return puzzle
    
    def get_hint(self):
        """Get next hint for the user"""
        try:
            puzzle = self.get_puzzle_from_grid()
            self.solver.load_puzzle(puzzle)
            hint = self.solver.get_hint()
            
            if hint:
                self.show_technique_info(hint)
                self.highlight_technique_cells(hint)
                self.update_progress(f"Hint: {hint.name}")
            else:
                messagebox.showinfo("Hint", "No more hints available. Puzzle might be complete or invalid.")
        except Exception as e:
            messagebox.showerror("Error", f"Failed to get hint: {str(e)}")
    
    def solve_step(self):
        """Solve one step of the puzzle"""
        try:
            puzzle = self.get_puzzle_from_grid()
            self.solver.load_puzzle(puzzle)
            
            if not self.techniques_used:
                self.techniques_used = self.solver.solve_with_techniques()
                self.current_step = 0
            
            if self.current_step < len(self.techniques_used):
                technique = self.techniques_used[self.current_step]
                self.show_technique_info(technique)
                self.highlight_technique_cells(technique)
                self.apply_technique_to_grid(technique)
                self.current_step += 1
                self.update_progress(f"Step {self.current_step}/{len(self.techniques_used)}")
            else:
                messagebox.showinfo("Complete", "Puzzle is solved!")
        except Exception as e:
            messagebox.showerror("Error", f"Failed to solve step: {str(e)}")
    
    def solve_all(self):
        """Solve the entire puzzle"""
        try:
            puzzle = self.get_puzzle_from_grid()
            self.solver.load_puzzle(puzzle)
            self.techniques_used = self.solver.solve_with_techniques()
            
            # Apply all techniques
            for technique in self.techniques_used:
                self.apply_technique_to_grid(technique)
            
            self.update_progress(f"Solved using {len(self.techniques_used)} techniques")
            messagebox.showinfo("Complete", f"Puzzle solved using {len(self.techniques_used)} techniques!")
        except Exception as e:
            messagebox.showerror("Error", f"Failed to solve puzzle: {str(e)}")
    
    def apply_technique_to_grid(self, technique: Technique):
        """Apply a technique to the GUI grid"""
        for row, col in technique.cells_affected:
            if self.cells[row][col].get() == "":
                # Find the value to place
                puzzle = self.get_puzzle_from_grid()
                self.solver.load_puzzle(puzzle)
                candidates = self.solver._get_candidates(row, col)
                if len(candidates) == 1:
                    value = list(candidates)[0]
                    self.cells[row][col].delete(0, tk.END)
                    self.cells[row][col].insert(0, str(value))
    
    def highlight_technique_cells(self, technique: Technique):
        """Highlight cells affected by a technique"""
        self.clear_highlights()
        for row, col in technique.cells_affected:
            self.cells[row][col].configure(bg='#ffeb3b')  # Yellow highlight
    
    def show_technique_info(self, technique: Technique):
        """Show technique information in the control panel"""
        self.technique_label.configure(text=technique.name)
        self.explanation_text.delete(1.0, tk.END)
        self.explanation_text.insert(tk.END, f"{technique.description}\n\n{technique.explanation}")
    
    def clear_technique_info(self):
        """Clear technique information"""
        self.technique_label.configure(text="None")
        self.explanation_text.delete(1.0, tk.END)
    
    def check_puzzle(self):
        """Check if current puzzle is valid"""
        try:
            puzzle = self.get_puzzle_from_grid()
            self.solver.load_puzzle(puzzle)
            
            if self.solver.is_valid():
                if self.solver.is_solved():
                    messagebox.showinfo("Valid", "Puzzle is complete and valid!")
                else:
                    messagebox.showinfo("Valid", "Puzzle is valid but not complete.")
            else:
                messagebox.showerror("Invalid", "Puzzle contains errors!")
        except Exception as e:
            messagebox.showerror("Error", f"Failed to check puzzle: {str(e)}")
    
    def clear_puzzle(self):
        """Clear the puzzle"""
        for i in range(9):
            for j in range(9):
                self.cells[i][j].delete(0, tk.END)
        self.clear_technique_info()
        self.update_progress("Puzzle cleared")
    
    def previous_step(self):
        """Go to previous solving step"""
        if self.current_step > 0:
            self.current_step -= 1
            technique = self.techniques_used[self.current_step]
            self.show_technique_info(technique)
            self.highlight_technique_cells(technique)
            self.update_progress(f"Step {self.current_step + 1}/{len(self.techniques_used)}")
    
    def next_step(self):
        """Go to next solving step"""
        if self.current_step < len(self.techniques_used):
            technique = self.techniques_used[self.current_step]
            self.show_technique_info(technique)
            self.highlight_technique_cells(technique)
            self.current_step += 1
            self.update_progress(f"Step {self.current_step}/{len(self.techniques_used)}")
    
    def update_progress(self, message: str):
        """Update progress message"""
        self.progress_var.set(message)
    
    def new_puzzle(self):
        """Create new empty puzzle"""
        self.clear_puzzle()
        self.current_puzzle = None
        self.techniques_used = []
        self.current_step = 0
    
    def load_puzzle(self):
        """Load puzzle from file (placeholder)"""
        messagebox.showinfo("Info", "Load puzzle functionality not implemented yet")
    
    def save_puzzle(self):
        """Save puzzle to file (placeholder)"""
        messagebox.showinfo("Info", "Save puzzle functionality not implemented yet")
    
    def show_techniques_guide(self):
        """Show techniques guide window"""
        guide_window = tk.Toplevel(self.root)
        guide_window.title("Sudoku Techniques Guide")
        guide_window.geometry("600x500")
        
        text_widget = tk.Text(guide_window, wrap=tk.WORD, padx=10, pady=10)
        text_widget.pack(fill=tk.BOTH, expand=True)
        
        guide_text = """
SUDOKU SOLVING TECHNIQUES GUIDE

1. NAKED SINGLE
   - A cell that has only one possible value
   - Look for cells with only one candidate remaining
   - Example: If a cell can only contain 5, place 5 there

2. HIDDEN SINGLE
   - A value that can only go in one cell within a row, column, or box
   - Look for numbers that appear in only one cell in a unit
   - Example: In a row, if only one cell can contain 7, place 7 there

3. NAKED PAIR
   - Two cells in the same unit that contain the same two candidates
   - These candidates can be eliminated from other cells in the unit
   - Example: Two cells both have candidates {3,7}, so 3 and 7 can be removed from other cells

4. HIDDEN PAIR
   - Two candidates that appear in only two cells within a unit
   - Other candidates in those cells can be eliminated
   - Example: If 2 and 8 only appear in two cells, remove other candidates from those cells

5. POINTING PAIR/TRIPLE
   - When candidates in a box are limited to one row or column
   - Those candidates can be eliminated from the rest of the row/column
   - Example: In a box, if 4 only appears in one row, remove 4 from other cells in that row

6. BOX/LINE REDUCTION
   - When candidates in a row/column are limited to one box
   - Those candidates can be eliminated from the rest of the box
   - Example: In a row, if 6 only appears in one box, remove 6 from other cells in that box

TIPS FOR BEGINNERS:
- Always start with naked singles and hidden singles
- Look for the most constrained cells first
- Use pencil marks to track candidates
- Don't guess - use logic and techniques
- Practice regularly to improve pattern recognition
        """
        
        text_widget.insert(tk.END, guide_text)
        text_widget.configure(state='disabled')
    
    def test_gui(self):
        """Test GUI functionality"""
        messagebox.showinfo("GUI Test", "GUI is working correctly! ✓")
        self.update_progress("GUI test successful")
    
    def show_about(self):
        """Show about dialog"""
        messagebox.showinfo("About", 
                           "Sudoku Solver & Creator\n\n"
                           "A comprehensive tool for learning Sudoku techniques.\n"
                           "Features:\n"
                           "• Generate puzzles of varying difficulty\n"
                           "• Step-by-step solving with explanations\n"
                           "• Interactive hints and technique detection\n"
                           "• Educational guidance for learning\n\n"
                           "Version 1.0")
    
    def run(self):
        """Start the GUI application"""
        self.root.mainloop()

if __name__ == "__main__":
    app = SudokuGUI()
    app.run()

