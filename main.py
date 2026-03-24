from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api import (
    auth, users, jobs, skills, simulation,
    plan, tasks, ai, notifications
)

app = FastAPI()

origins = [
    "http://localhost/3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin for origin in origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(jobs.router, prefix="/api/jobs", tags=["Jobs"])
app.include_router(skills.router, prefix="/api/skills", tags=["Skills"])
app.include_router(simulation.router, prefix="/api/simulation", tags=["Simulation"])
app.include_router(plan.router, prefix="/api/plan", tags=["Plan"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["Tasks"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/hello/{name}")
async def say_hello(name: str):
    return {"message": f"Hello {name}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)