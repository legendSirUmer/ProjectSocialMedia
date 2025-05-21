from google.adk.agents import Agent
from google.adk.tools import google_search
import re

def is_spam(text):
    # Simple spam detection logic (can be replaced with ML or more rules)
    spam_keywords = [
        r"free\s+money", r"win\s+prize", r"click\s+here", r"congratulations", r"urgent", r"lottery",
        r"claim\s+now", r"buy\s+now", r"limited\s+offer", r"act\s+now", r"winner", r"100%\s+free",
        r"easy\s+money", r"risk\s+free", r"guaranteed", r"no\s+credit\s+check", r"investment\s+opportunity"
    ]
    text_lower = text.lower()
    for pattern in spam_keywords:
        if re.search(pattern, text_lower):
            return True
    # Heuristic: excessive links or repeated characters
    if text_lower.count("http") > 2 or re.search(r"(.)\\1{5,}", text_lower):
        return True
    return False

root_agent = Agent(
   name="basic_spam_agent",
   model="gemini-2.0-flash",
   description="Agent for spamming detection.",
   instruction=(
  
       "If the input text is spam, answer 'yes'. Otherwise, answer 'no'. "
     
   ),
   tools=[google_search,is_spam],

)