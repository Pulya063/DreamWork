import httpx
import re
from bs4 import BeautifulSoup

BASE_URL = "https://www.work.ua"


def parse_salary(salary_text: str) -> int:
    if not salary_text:
        return 0

    cleaned = salary_text.replace("\u202f", "").replace("\u2009", "").replace("\xa0", "")
    numbers = re.findall(r"\d+", cleaned)
    numbers = list(map(int, numbers))

    if not numbers:
        return 0

    if len(numbers) >= 2:
        return sum(numbers[:2]) // 2

    return numbers[0]


async def fetch_html(client: httpx.AsyncClient, url: str) -> str | None:
    try:
        response = await client.get(
            url,
            follow_redirects=True,
            headers={"User-Agent": "Mozilla/5.0"},
        )
        response.raise_for_status()
        return response.text
    except httpx.RequestError as error:
        print(f"[ERROR] Request failed: {error}")
        return None


async def parse_job_listings(target_job: str):
    async with httpx.AsyncClient(timeout=15.0) as client:
        url = f"{BASE_URL}/jobs-{target_job.lower().replace(' ', '+')}/"
        html = await fetch_html(client, url)

    if not html:
        return []

    soup = BeautifulSoup(html, "html.parser")
    jobs = soup.select("#pjax-jobs-list div.job-link")

    results = []

    for job in jobs:
        job_id = job.get("data-id")
        link = f"{BASE_URL}/jobs/{job_id}/" if job_id else None

        title_elem = job.find("h2")
        title = title_elem.text.strip() if title_elem else "No Title"

        company = "No Company"
        company_elem = job.select_one(".strong-600")
        if company_elem:
            company = company_elem.text.strip()

        location = "No Location"
        location_elem = job.find("span", attrs={"title": True})
        if location_elem:
            location = location_elem.text.strip()

        salary_text = None
        salary_elem = job.find(string=lambda value: value and "грн" in value)
        if salary_elem:
            salary_text = salary_elem.strip()

        salary = parse_salary(salary_text) if salary_text else 0

        results.append(
            {
                "id": job_id,
                "title": title,
                "company": company,
                "location": location,
                "salary": salary,
                "link": link,
            }
        )

    return results


async def parse_youtube():
    return None


async def parse_stackoverflow():
    return None
