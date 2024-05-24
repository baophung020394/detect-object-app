# Detect Object App

This is a web application that allows you to detect objects using the YOLOv8 model. It consists of a backend and a frontend component.

## Backend Setup

1. Ensure you have Python 3 installed. You can check the version by running the following command:
  ```
  python3 --version
  ```

2. Navigate to the backend folder:
  ```
  cd backend
  ```

3. Create a virtual environment:
  ```
  python3 -m venv path/to/venv
  ```

4. Activate the virtual environment:
  ```
  source path/to/venv/bin/activate
  ```

5. Install the required dependencies:
  ```
  pip install -r requirements.txt
  ```

6. Start the backend server:
  ```
  uvicorn main:app --reload
  ```

## Frontend Setup

1. Ensure you have Node.js installed. You can check the version by running the following command:
  ```
  node --version (>= v18.17.0)
  ```

2. Navigate to the frontend folder:
  ```
  cd frontend
  ```

3. Install the required dependencies:
  ```
  npm install
  ```

4. Start the frontend development server:
  ```
  npm run dev
  ```

## Accessing the Application

Once both the backend and frontend servers are running, you can access the application at [http://localhost:3000/Home](http://localhost:3000/Home).

Please note that the backend server runs on port 8000 and the frontend server runs on port 3000.
