"""
Main entry point for the Sudoku Solver & Creator application
"""
import sys
import traceback

def main():
    """Main function with error handling"""
    try:
        print("Starting Sudoku Solver & Creator...")
        print("Features:")
        print("- Generate puzzles of varying difficulty")
        print("- Step-by-step solving with explanations")
        print("- Interactive hints and technique detection")
        print("- Educational guidance for learning Sudoku")
        print("\nLaunching GUI...")
        
        # Import and create GUI
        from sudoku_gui import SudokuGUI
        app = SudokuGUI()
        
        # Ensure window is visible and on top
        app.root.lift()
        app.root.attributes('-topmost', True)
        app.root.after_idle(lambda: app.root.attributes('-topmost', False))
        
        print("✓ GUI created successfully!")
        print("✓ Window should be visible now.")
        print("If you don't see the window, check your dock or press Cmd+Tab to cycle through applications.")
        
        # Start the GUI
        app.run()
        
    except ImportError as e:
        print(f"❌ Import Error: {e}")
        print("Please make sure all dependencies are installed:")
        print("pip3 install -r requirements.txt")
        sys.exit(1)
        
    except Exception as e:
        print(f"❌ Error starting application: {e}")
        print("\nFull error details:")
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()

