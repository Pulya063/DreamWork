from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api import auth, users, simulation, plan, tasks, ai, notifications, resources, dashboard

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://0.0.0.0:3000",
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
app.include_router(simulation.router, prefix="/api/simulation", tags=["Simulation"])
app.include_router(plan.router, prefix="/api/plan", tags=["Plan"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["Tasks"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])
app.include_router(resources.router, prefix="/api/resources", tags=["Resources"])

@app.get("/")
async def root():
    return {"message": "Hello World"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
