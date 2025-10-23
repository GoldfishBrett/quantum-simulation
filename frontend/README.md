# Quantum Box Simulator (Frontend)

This is the React + TypeScript frontend for the Quantum Box Simulator. It provides a visual interface for users to apply quantum gates and see the resulting state of a qubit, based on a Water/Ice metaphor.

## Project Status

This frontend is **complete and ready for backend integration**.

All UI components are built (`QubitsDisplay`, `ControlPanel`), and the application state is managed in `App.tsx`. The project currently uses a *simulated* backend for demonstration.

## How to Run This Frontend

1.  **Navigate to this folder:**
    ```bash
    cd frontend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The app will be running at `http://localhost:5173`.

## Architecture & Backend Handoff

This project is built to consume a separate backend API.

**The handoff point is in `src/App.tsx`.**

Only need to modify the `getNextStateFromBackend` function in `quantum-simulation/frontend` directory to replace the simulation logic with a real API (e.g., `fetch`) call.

The frontend will send an `action` string (e.g., `'H'`, `'MEASURE'`) and expects the backend to return a new state array (e.g., `['+']`).