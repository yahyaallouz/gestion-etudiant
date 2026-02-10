# How to Run "Gestion Etudiant"

Follow these steps to get your Student Management System up and running.

## Prerequisites
1.  **XAMPP** (or any PHP/MySQL environment like WAMP, Laragon).
2.  **Node.js** (for running the frontend).

## Step 1: Database Setup
1.  Open **XAMPP Control Panel** and start **Apache** and **MySQL**.
2.  Open your browser and go to `http://localhost/phpmyadmin`.
3.  Click **New** to create a database.
4.  Name the database: `gestion_etudiant_db`.
5.  Click the **SQL** tab.
6.  Copy the content of the file `backend/db_schema.sql` (found in your project folder) and paste it into the SQL query box.
7.  Click **Go** to create the tables.

## Step 2: Backend Setup
1.  Move or copy the entire `GestionETD` project folder into your web server's root directory.
    - For **XAMPP**, this is usually `C:\xampp\htdocs`.
    - So you should have `C:\xampp\htdocs\GestionETD\backend`.
2.  Verify the backend is accessible:
    - Open `http://localhost/GestionETD/backend/api/auth.php` in your browser.
    - If you see a JSON response (even an error message), it works!

## Step 3: Frontend Setup
1.  Open a terminal (Command Prompt or PowerShell).
2.  Navigate to the `frontend` folder inside your project:
    ```powershell
    cd path\to\GestionETD\frontend
    ```
3.  Install dependencies (only needed once):
    ```powershell
    npm install
    ```
4.  Start the development server:
    ```powershell
    npm run dev
    ```
5.  You will see a URL like `http://localhost:5173`. Open this in your browser.

## Step 4: Login
- **Email**: `admin@example.com`
- **Password**: `admin123`

## Troubleshooting
- **Database Error?** Check `backend/config/database.php` and make sure the password matches your MySQL root password (usually empty or `root`).
- **CORS Error?** Ensure the backend URL in `frontend/src/config.js` is correct (`http://localhost/GestionETD/backend/api`).
