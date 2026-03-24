import asyncio
import httpx
from bs4 import BeautifulSoup

async def get_html(url):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, follow_redirects=True)
            response.raise_for_status()
            return response.text
    except httpx.RequestError as e:
        print(f"Error fetching the URL: {e}")
        return None

async def parse_job_listings(url):
    html = await get_html(url)
    
    if not html:
        return []

    soup = BeautifulSoup(html, 'html.parser')
    all_jobs = soup.find_all('div', class_='card card-hover card-visited wordwrap job-link js-hot-block mt-sm sm:mt-lg')

    job_listings = []
    for job in all_jobs:
        title_elem = job.find('h2')
        title = title_elem.text.strip() if title_elem else 'No Title'
        
        job_div = job.find('div', class_='mt-xs')
        if not job_div:
            continue
            
        job_span = job_div.find('span', class_='mr-xs')
        company = 'No Company'
        if job_span:
            company_span_span = job_span.find('span', class_="strong-600")
            if company_span_span:
                company = company_span_span.text.strip()
                
        location_elem = job.find('span', class_="")
        location = location_elem.text.strip() if location_elem else 'No Location'

        salary = 'On Interview'
        salary_span = job.find('span', class_='strong-600')
        if salary_span and "грн" in salary_span.text:
            salary = salary_span.text.replace('\u202f', '').replace('\u2009', '').replace('\xa0', '')

        needed_skills = [] #need to intagrate LLM and parse skills from job description and compare with user skills to find missing ones

        job_listings.append({
            'title': title,
            'company': company,
            'location': location,
            'salary': salary,
            'skills': needed_skills if needed_skills else []
        })

    return job_listings

if __name__ == "__main__":
    # Add many websites and parse them
    url = "https://www.work.ua/jobs-it/"
    results = asyncio.run(parse_job_listings(url))
    print(results)



