from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib import colors
import os

from database import Base, engine, SessionLocal
from models import User, SalarySlip, Expense
from schemas import UserCreate, Login, SalarySlipCreate, ExpenseCreate
from auth import hash_password, verify_password, create_token
from dependencies import admin_only, get_current_user


def seed_demo_user():
    db = SessionLocal()
    try:
        demo_email = "hire-me@anshumat.org"

        existing_user = db.query(User).filter(User.email == demo_email).first()
        if not existing_user:
            demo_user = User(
                email=demo_email,
                password=hash_password("HireMe@2025!"),
                role="employee"
            )
            db.add(demo_user)
            db.commit()
            print("✅ Demo user created")
        else:
            print("ℹ️ Demo user already exists")

    finally:
        db.close()


# =========================
# APP & DB SETUP
# =========================

Base.metadata.create_all(bind=engine)
seed_demo_user()


app = FastAPI()

# CORS (FOR DEPLOYMENT)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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

@app.get("/admin/employees")
def get_all_employees(
    admin: User = Depends(admin_only),
    db: Session = Depends(get_db)
):
    return db.query(User).filter(User.role == "employee").all()


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
# PROFESSIONAL PDF SALARY SLIP
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
    file_path = file_name

    c = canvas.Canvas(file_path, pagesize=A4)
    width, height = A4

    # ================= HEADER =================
    c.setFont("Helvetica-Bold", 22)
    c.setFillColor(colors.HexColor("#4f46e5"))  # Indigo
    c.drawCentredString(width / 2, height - 50, "Payroll Management System")

    c.setFont("Helvetica", 12)
    c.setFillColor(colors.black)
    c.drawCentredString(width / 2, height - 80, "Salary Slip")

    c.setStrokeColor(colors.grey)
    c.line(40, height - 100, width - 40, height - 100)

    # ================= EMPLOYEE DETAILS =================
    y = height - 140
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y, "Employee Details")

    c.setFont("Helvetica", 11)
    y -= 25
    c.drawString(50, y, "Employee Email:")
    c.drawString(200, y, user.email)

    y -= 20
    c.drawString(50, y, "Employee ID:")
    c.drawString(200, y, str(slip.user_id))

    y -= 20
    c.drawString(50, y, "Salary Month:")
    c.drawString(200, y, slip.month)

    # ================= SALARY TABLE =================
    y -= 40
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y, "Salary Breakdown")

    table_x = 50
    table_y = y - 20
    table_width = width - 100
    row_height = 30

    # Header background
    c.setFillColor(colors.lightgrey)
    c.rect(table_x, table_y - row_height, table_width, row_height, fill=1)

    c.setFillColor(colors.black)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(table_x + 10, table_y - 20, "Component")
    c.drawRightString(table_x + table_width - 20, table_y - 20, "Amount (₹)")

    # Row
    c.setFont("Helvetica", 11)
    c.drawString(table_x + 10, table_y - 50, "Basic Salary")
    c.drawRightString(
        table_x + table_width - 20,
        table_y - 50,
        f"{slip.amount}"
    )

    # Border
    c.rect(table_x, table_y - row_height * 2, table_width, row_height * 2)

    # ================= TOTAL =================
    y = table_y - row_height * 2 - 30
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, y, "Total Salary:")
    c.drawString(200, y, f"₹ {slip.amount}")

    # ================= FOOTER =================
    c.setStrokeColor(colors.grey)
    c.line(40, 100, width - 40, 100)

    c.setFont("Helvetica", 10)
    c.setFillColor(colors.grey)
    c.drawCentredString(
        width / 2,
        80,
        "This is a system-generated salary slip. No signature required."
    )

    c.showPage()
    c.save()

    return FileResponse(
        file_path,
        media_type="application/pdf",
        filename=file_name
    )
