class Calculator:
    @staticmethod
    def calculate_growth(data):
        return 0.1

    @staticmethod
    def calculate_time(data):
        # income, hours per week, etc.
        return 12  # Example time in weeks

    @staticmethod
    def calculate_success(data):
        # MLL
        return 0.8  # Example success probability

    @staticmethod
    def get_missing_skills(data, required_skills=None):
        if required_skills is None:
            required_skills = ["Skill A", "Skill B", "Skill C"]

        for i in data:
            if i in required_skills:
                required_skills.remove(i)

        return required_skills

class Simulator:
    def __init__(self):
        self.calculator = Calculator()

    def run(self, data):
        missing = self.calculator.get_missing_skills(data["current_skills"])
        growth = self.calculator.calculate_growth(data["current_skills"])
        time = self.calculator.calculate_time(data["hours_per_week"])
        probability = self.calculator.calculate_success(data)

        return {
            "recommended_skills": missing,
            "estimated_time_weeks": time,
            "success_probability": probability,
            "skill_growth": growth
        }
