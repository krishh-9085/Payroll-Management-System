from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
import os

from database import Base, engine, SessionLocal
from models import User, SalarySlip, Expense
from schemas import UserCreate, Login, SalarySlipCreate, ExpenseCreate
from auth import hash_password, verify_password, create_token
from dependencies import admin_only, get_current_user

# =========================
# APP & DB SETUP
# =========================

Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS (IMPORTANT FOR FRONTEND)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for deployment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# DB DEPENDENCY
# =========================

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# =========================
# AUTH ROUTES
# =========================

@app.post("/auth/signup")
def signup(user: UserCreate, db: Session = Depends(get_db)):
    try:
        new_user = User(
            email=user.email,
            password=hash_password(user.password),
            role=user.role
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return {"msg": "User created successfully"}

    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="User already exists")

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/auth/login")
def login(data: Login, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()

    if not user or not verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token(user)

    return {
        "access_token": token,
        "role": user.role
    }

# =========================
# ADMIN ROUTES
# =========================

# 👉 Fetch all employees (for dropdown in Admin UI)
@app.get("/admin/employees")
def get_all_employees(
    admin: User = Depends(admin_only),
    db: Session = Depends(get_db)
):
    return db.query(User).filter(User.role == "employee").all()


# 👉 Create salary slip
@app.post("/salary-slip")
def create_salary_slip(
    slip: SalarySlipCreate,
    admin: User = Depends(admin_only),
    db: Session = Depends(get_db)
):
    salary = SalarySlip(
        user_id=slip.user_id,
        month=slip.month,
        amount=slip.amount
    )
    db.add(salary)
    db.commit()
    return {"msg": "Salary slip created"}

# =========================
# EMPLOYEE ROUTES
# =========================

@app.get("/salary-slip")
def view_salary_slips(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(SalarySlip).filter(
        SalarySlip.user_id == user.id
    ).all()


@app.post("/expense")
def submit_expense(
    exp: ExpenseCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    expense = Expense(
        user_id=user.id,
        description=exp.description,
        amount=exp.amount
    )
    db.add(expense)
    db.commit()
    return {"msg": "Expense submitted"}


@app.get("/expense")
def view_expenses(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Expense).filter(
        Expense.user_id == user.id
    ).all()

# =========================
# PDF SALARY SLIP EXPORT
# =========================

@app.get("/salary-slip/{slip_id}/pdf")
def download_salary_slip_pdf(
    slip_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    slip = db.query(SalarySlip).filter(SalarySlip.id == slip_id).first()

    if not slip or slip.user_id != user.id:
        raise HTTPException(status_code=404, detail="Salary slip not found")

    file_name = f"salary_slip_{slip.id}.pdf"
    file_path = os.path.join(file_name)

    c = canvas.Canvas(file_path, pagesize=A4)
    width, height = A4

    c.setFont("Helvetica-Bold", 22)
    c.drawCentredString(width / 2, height - 80, "Salary Slip")

    c.setFont("Helvetica", 12)
    c.drawString(80, height - 150, f"Employee ID: {slip.user_id}")
    c.drawString(80, height - 180, f"Month: {slip.month}")
    c.drawString(80, height - 210, f"Salary Amount: ₹ {slip.amount}")

    c.drawString(80, height - 260, "This is a system generated salary slip.")
    c.drawString(80, height - 290, "No signature required.")

    c.showPage()
    c.save()

    return FileResponse(
        file_path,
        media_type="application/pdf",
        filename=file_name
    )
