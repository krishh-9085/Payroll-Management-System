from pydantic import BaseModel

class UserCreate(BaseModel):
    email: str
    password: str
    role: str

class Login(BaseModel):
    email: str
    password: str

class SalarySlipCreate(BaseModel):
    user_id: int
    month: str
    amount: float

class ExpenseCreate(BaseModel):
    description: str
    amount: float
