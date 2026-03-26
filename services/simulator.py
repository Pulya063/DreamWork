import os
import json
import math
from unittest.mock import patch

from openai import OpenAI
from dotenv import load_dotenv
from sqlalchemy import null

from api.ai import get_ai_response
from services.web_parcing import parse_job_listings

load_dotenv()


class Calculator:
    @staticmethod
    def calculate_time(hours_per_week: int, total_hours: int) -> dict:
        """
        Розраховує час потрібний для підготовки до бажаної професії.

        1. Запитує у LLM: скільки годин потрібно на вивчення повного списку
           матеріалів для цільової професії.
        2. Ділить загальну кількість годин на години/тиждень від користувача.
        3. Повертає результат у днях та тижнях.
        """

        total_weeks = round(total_hours / hours_per_week)

        return {
            "total_hours_needed": total_hours,
            "total_weeks_needed": total_weeks,
            "hours_per_week": hours_per_week
        }

    @staticmethod
    def get_missing_skills(current_skills, required_skills):

        missing = [skill for skill in required_skills if skill not in current_skills]
        return missing

    @staticmethod
    def calculate_average_market_salary(market_info):
        market_salaries = [salary for salary in market_info.get("salary")]

        if market_salaries:
            average_salary = sum(market_salaries) / len(market_salaries)
            return average_salary

        return 0

    @staticmethod
    def calculate_salary_growth(current_income, job_market_salary):
        difference = job_market_salary - current_income

        if difference == 0:
            return 0

        result = (difference / current_income) * 100
        return result


class Simulator:
    def __init__(self):
        self.calculator = Calculator()

    def llm_response(self, target_job):
        prompt = (
            f"""You are a career advisor and labor market analyst.
            
            Your task is to estimate:
            1) Total number of hours required to become job-ready for the role
            2) Required skills
            3) Current job market statistics for this role
            
            Target job: "{target_job}"
            
            Rules:
            - Respond ONLY with a valid JSON object
            - Do NOT include any explanations or text outside JSON
            - Use realistic, data-driven estimates (no placeholders)
            - Numbers must be integers or floats
            - change_percent must be calculated as:
              ((new_vacancies - closed_vacancies) / closed_vacancies) * 100
            - market_trend must be one of: "uptrend", "downtrend", "stable"
            - Ensure required_skills contains at least 8 relevant skills
            - description must be concise but informative (2-3 sentences max)
            
            STRICT JSON FORMAT:
            
            {{
              "total_hours": number,
              "required_skills": ["skill1", "skill2"],
              "new_vacancies": number,
              "closed_vacancies": number,
              "change_percent": number,
              "market_trend": "uptrend | downtrend | stable",
              "description": "string"
            }}
            
            If the format is incorrect, regenerate the response.
            """
        )

        ai_response = get_ai_response(prompt)

        return ai_response

    async def run(self, data):
        parsing_info = await parse_job_listings(data.get("target_job"))
        llm_info = self.llm_response(data.get("target_job"))

        missing = self.calculator.get_missing_skills(data["current_skills"], required_skills=llm_info["required_skills"])

        time_result = self.calculator.calculate_time(
            hours_per_week=data["hours_per_week"],
            total_hours=llm_info["total_hours"]
        )

        success_result = {
          "new_vacancies": llm_info["new_vacancies"],
          "closed_vacancies": llm_info["closed_vacancies"],
          "change_percent": llm_info["change_percent"],
          "market_trend": llm_info["market_trend"],
          "description": llm_info["description"]
        }

        if parsing_info:
            market_salary = self.calculator.calculate_average_market_salary(parsing_info)
        else:
            market_salary = 0

        salary_growth = self.calculator.calculate_salary_growth(data["current_income"], market_salary)

        return {
            "recommended_skills": missing,
            "time_estimate": time_result,
            "market_analysis": success_result,
            "salary_growth": salary_growth
        }
