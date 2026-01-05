# Payroll Management System

A full-stack Payroll Management System for managing employee payroll, built with a Python FastAPI backend and a React + Tailwind CSS frontend.

## Features

- User authentication (login, admin dashboard)
- Employee management
- Payroll processing and history
- Modern, responsive UI
- RESTful API backend

## Tech Stack

- **Backend:** Python, FastAPI, SQLAlchemy
- **Frontend:** React, Tailwind CSS
- **Database:** (Configured in backend/database.py)

## Project Structure

```
backend/
  main.py            # FastAPI entry point
  models.py          # SQLAlchemy models
  schemas.py         # Pydantic schemas
  auth.py            # Authentication logic
  database.py        # DB connection
  dependencies.py    # Dependency injection
  requirements.txt   # Python dependencies

frontend/
  payroll-frontend/
	 src/
		pages/         # React pages (Admin, Dashboard, Login)
		services/      # API services
		api.js         # API config
		App.js         # Main React app
	 public/          # Static files
	 package.json     # Frontend dependencies
	 tailwind.config.js
```

## Getting Started

### Backend

1. Install dependencies:
	```bash
	cd backend
	pip install -r requirements.txt
	```
2. Run the FastAPI server:
	```bash
	uvicorn main:app --reload
	```

### Frontend

1. Install dependencies:
	```bash
	cd frontend/payroll-frontend
	npm install
	```
2. Start the React app:
	```bash
	npm start
	```

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](LICENSE)
