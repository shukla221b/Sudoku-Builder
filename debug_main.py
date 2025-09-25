"""
Debug version of main.py to identify GUI issues
"""
import sys
import traceback

def test_imports():
    """Test all required imports"""
    print("Testing imports...")
    
    try:
        import tkinter as tk
        print("✓ tkinter imported successfully")
    except ImportError as e:
        print(f"❌ tkinter import failed: {e}")
        return False
    
    try:
        import numpy as np
        print("✓ numpy imported successfully")
    except ImportError as e:
        print(f"❌ numpy import failed: {e}")
        return False
    
    try:
        from sudoku_core import SudokuSolver, SudokuGenerator, Difficulty, Technique
        print("✓ sudoku_core imported successfully")
    except ImportError as e:
        print(f"❌ sudoku_core import failed: {e}")
        return False
    
    try:
        from sudoku_gui import SudokuGUI
        print("✓ sudoku_gui imported successfully")
    except ImportError as e:
        print(f"❌ sudoku_gui import failed: {e}")
        return False
    
    return True

def test_basic_tkinter():
    """Test basic tkinter functionality"""
    print("\nTesting basic tkinter...")
    try:
        import tkinter as tk
        
        # Create a simple test window
        root = tk.Tk()
        root.title("Tkinter Test")
        root.geometry("300x200")
        
        label = tk.Label(root, text="If you see this window, tkinter works!")
        label.pack(pady=50)
        
        # Show window briefly
        root.update()
        print("✓ Basic tkinter window created successfully")
        
        # Don't run mainloop, just test creation
        root.destroy()
        return True
        
    except Exception as e:
        print(f"❌ Basic tkinter test failed: {e}")
        traceback.print_exc()
        return False

def test_gui_creation():
    """Test GUI creation without running mainloop"""
    print("\nTesting GUI creation...")
    try:
        from sudoku_gui import SudokuGUI
        
        print("Creating SudokuGUI instance...")
        app = SudokuGUI()
        print("✓ SudokuGUI created successfully")
        
        # Test if window is visible
        app.root.update()
        print("✓ GUI window updated successfully")
        
        # Don't run mainloop, just test creation
        app.root.destroy()
        return True
        
    except Exception as e:
        print(f"❌ GUI creation failed: {e}")
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("=== SUDOKU GUI DEBUGGING ===")
    print(f"Python version: {sys.version}")
    print(f"Platform: {sys.platform}")
    
    # Test imports
    if not test_imports():
        print("\n❌ Import tests failed. Please install missing dependencies.")
        sys.exit(1)
    
    # Test basic tkinter
    if not test_basic_tkinter():
        print("\n❌ Basic tkinter test failed. There may be a display issue.")
        sys.exit(1)
    
    # Test GUI creation
    if not test_gui_creation():
        print("\n❌ GUI creation test failed. There's an issue with the GUI code.")
        sys.exit(1)
    
    print("\n✅ All tests passed! The GUI should work.")
    print("Now trying to run the actual application...")
    
    try:
        from sudoku_gui import SudokuGUI
        app = SudokuGUI()
        print("✓ Application started successfully!")
        print("Look for the 'Sudoku Solver & Creator' window.")
        app.run()
    except Exception as e:
        print(f"❌ Application failed to run: {e}")
        traceback.print_exc()
