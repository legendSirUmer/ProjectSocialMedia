from flask import Flask, render_template, request, Response
from google.adk.agents import Agent
from google.adk.tools import google_search
import asyncio

# Initialize Flask app
app = Flask(__name__)

# Initialize the agent
root_agent = Agent(
    name="basic_search_agent",
    model="gemini-2.0-flash",
    description="Agent to answer questions using Google Search.",
    instruction="You are an expert researcher. You always stick to the facts.",
    tools=[google_search]
)

# Streaming generator function
def stream_agent_response(query):
    from google.adk.sessions import InMemorySessionService
    from google.adk.runners import Runner
    from google.genai import types

    # Set up session and runner
    session_service = InMemorySessionService()
    session = session_service.create_session(app_name="search_app", user_id="user_1", session_id="session_001")
    runner = Runner(agent=root_agent, app_name="search_app", session_service=session_service)

    # Prepare the user's query
    content = types.Content(role='user', parts=[types.Part(text=query)])

    # Synchronous wrapper for the async generator
    async def generate():
        async for event in runner.run_async(user_id="user_1", session_id="session_001", new_message=content):
            if event.content and event.content.parts:
                yield event.content.parts[0].text + "<br>"

    # Use asyncio.run to collect the results synchronously
    async def collect():
        results = []
        async for item in generate():
            results.append(item)
        return results

    return asyncio.run(collect())

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/search', methods=['POST'])
def search():
    query = request.form.get('query')
    print(Response(stream_agent_response(query), content_type='text/html'))
    return Response(stream_agent_response(query), content_type='text/html')

if __name__ == '__main__':
    app.run(debug=True)