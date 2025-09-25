# Sudoku Solver & Creator

A comprehensive Python application for learning, solving, and creating Sudoku puzzles with educational features.

## Features

### 🎯 Puzzle Generation
- Generate Sudoku puzzles of varying difficulty levels (Easy, Medium, Hard, Expert)
- Unique solution guarantee for all generated puzzles
- Customizable difficulty based on number of given clues

### 🧠 Educational Solving
- **Step-by-step solving** with detailed explanations
- **Technique detection** including:
  - Naked Singles
  - Hidden Singles (Row, Column, Box)
  - Naked Pairs
  - Hidden Pairs
  - Pointing Pairs/Triples
  - Box/Line Reduction
- **Interactive hints** that guide users to the next logical move
- **Technique explanations** with visual highlighting

### 🎨 User Interface
- Clean, intuitive GUI built with tkinter
- Visual highlighting of related cells (row, column, box)
- Real-time puzzle validation
- Progress tracking through solving steps
- Techniques guide and help system

### 🔧 Core Functionality
- Complete Sudoku solver with multiple algorithms
- Puzzle validation and error checking
- Save/load puzzle functionality (extensible)
- Backtracking solver for complex puzzles

## Installation

1. **Clone or download** the project files
2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
3. **Run the application**:
   ```bash
   python main.py
   ```

## Usage

### Getting Started
1. Launch the application using `python main.py`
2. Generate a new puzzle using the difficulty buttons (Easy, Medium, Hard, Expert)
3. Start solving by filling in obvious numbers

### Learning Mode
1. Use **"Get Hint"** to receive guidance on the next logical move
2. Use **"Solve Step"** to see the next technique applied with explanation
3. Read the **technique explanations** in the right panel
4. Navigate through solving steps using Previous/Next buttons

### Advanced Features
- **Check Puzzle**: Validate your current progress
- **Clear**: Reset the puzzle
- **Techniques Guide**: Access comprehensive technique explanations
- **Step Navigation**: Review previous solving steps

## File Structure

```
Sudoku/
├── main.py              # Application entry point
├── sudoku_core.py       # Core solving and generation algorithms
├── sudoku_gui.py        # GUI interface and user interactions
├── requirements.txt     # Python dependencies
└── README.md           # This file
```

## Technical Details

### Core Algorithms
- **Constraint Propagation**: Updates candidate lists based on Sudoku rules
- **Backtracking**: Solves puzzles that require trial and error
- **Technique Detection**: Identifies and applies logical solving methods
- **Puzzle Generation**: Creates valid puzzles with unique solutions

### Difficulty Levels
- **Easy**: 30+ given numbers, mostly naked singles
- **Medium**: 40+ given numbers, requires basic techniques
- **Hard**: 50+ given numbers, requires advanced techniques
- **Expert**: 60+ given numbers, requires expert-level techniques

## Educational Value

This application is designed to help users learn Sudoku solving techniques through:

1. **Visual Learning**: See techniques applied with highlighted cells
2. **Step-by-Step Guidance**: Understand the logical progression
3. **Technique Explanations**: Learn why each move is correct
4. **Practice Mode**: Apply learned techniques on generated puzzles
5. **Reference Guide**: Comprehensive techniques documentation

## Future Enhancements

- [ ] Advanced techniques (X-Wing, Swordfish, etc.)
- [ ] Puzzle import/export functionality
- [ ] Statistics and progress tracking
- [ ] Custom puzzle creation tools
- [ ] Multiplayer solving challenges
- [ ] Mobile-friendly interface

## Contributing

Feel free to contribute by:
- Adding new solving techniques
- Improving the user interface
- Adding new puzzle generation algorithms
- Enhancing educational features

## License

This project is open source and available under the MIT License.

---

**Happy Sudoku Solving!** 🧩

