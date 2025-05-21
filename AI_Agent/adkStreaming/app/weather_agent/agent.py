import os
import asyncio
from google.adk.agents import Agent
import pyodbc
from google.adk.sessions import InMemorySessionService
from google.adk.runners import Runner
from google.genai import types # For creating message Content/Parts

import warnings
# Ignore all warnings
warnings.filterwarnings("ignore")

import logging
logging.basicConfig(level=logging.ERROR)

print("Libraries imported.")


def connect_to_sql_server():
    """Establishes a connection to the SQL Server database."""
    try:
        connection = pyodbc.connect(
            'DRIVER={ODBC Driver 17 for SQL Server};'
            'SERVER=DESKTOP-1CU83GB\\SQLEXPRESS01;'
            'DATABASE=WeatherDB;'
            'Trusted_Connection=yes;'
          
        )
        print("Connected to SQL Server successfully.")
        return connection
    except pyodbc.Error as e:
        print(f"Error connecting to SQL Server: {e}")
        return None

connection = connect_to_sql_server()
def fetch_weather_data_from_db(city):
    """Fetches weather data for a city from the SQL Server database."""
    if connection:
        try:
            cursor = connection.cursor()
            query = "SELECT temp FROM Weather WHERE city = ?"
            cursor.execute(query, (city,))
            result = cursor.fetchone()
            if result:
                print(result[0])
                return {"status": "success", "report": "temprature of this city is " + str(result[0]) + "°C"}

            else:
                return {"status": "error", "error_message": f"No weather data found for '{city}'."}
        except pyodbc.Error as e:
            print(f"Error executing query: {e}")
            return {"status": "error", "error_message": "Database query failed."}
        finally:
            print("Closing cursor...")
            # connection.close()


# Gemini API Key (Get from Google AI Studio: https://aistudio.google.com/app/apikey)
os.environ["GOOGLE_API_KEY"] = "KEY" 




# --- Verify Keys (Optional Check) ---
print("API Keys Set")


# Configure ADK to use API keys directly (not Vertex AI for this multi-model setup)
os.environ["GOOGLE_GENAI_USE_VERTEXAI"] = "False"


# @markdown **Security Note:** It's best practice to manage API keys securely (e.g., using Colab Secrets or environment variables) rather than hardcoding them directly in the notebook. Replace the placeholder strings above.


# --- Initialize the Agent ---
print("Initializing Agent...")


MODEL_GEMINI_2_0_FLASH = "gemini-2.0-flash"

# Note: Specific model names might change. Refer to LiteLLM or the model provider's documentation.
MODEL_GPT_4O = "openai/gpt-4o"
MODEL_CLAUDE_SONNET = "anthropic/claude-3-sonnet-20240229"


print("\nEnvironment configured.")




# def get_weather(city: str) -> dict:
#     """Retrieves the current weather report for a specified city."""
#     print(f"--- Tool: get_weather called for city: {city} ---")
#     return fetch_weather_data_from_db(city)


# @title Define the get_weather Tool
def get_weather(city: str) -> dict:
    """Retrieves the current weather report for a specified city.

    Args:
        city (str): The name of the city (e.g., "New York", "London", "Tokyo").

    Returns:
        dict: A dictionary containing the weather information.
              Includes a 'status' key ('success' or 'error').
              If 'success', includes a 'report' key with weather details.
              If 'error', includes an 'error_message' key.
    """
    # Best Practice: Log tool execution for easier debugging
    print(f"--- Tool: get_weather called for city: {city} ---")
    city_normalized = city.lower().replace(" ", "") # Basic input normalization

    # Mock weather data for simplicity
    mock_weather_db = {
        "newyork": fetch_weather_data_from_db('karachi'),
        "london": {"status": "success", "report": "It's cloudy in London with a temperature of 15°C."},
        "tokyo": {"status": "success", "report": "Tokyo is experiencing light rain and a temperature of 18°C."},
    }

    # Best Practice: Handle potential errors gracefully within the tool
    if city_normalized in mock_weather_db:
        return mock_weather_db[city_normalized]
    else:
        return {"status": "error", "error_message": f"Sorry, I don't have weather information for '{city}'."}

# Example tool usage (optional self-test)
print(get_weather("New York"))
print(get_weather("Paris"))










# @title Define the Weather Agent
# Use one of the model constants defined earlier
AGENT_MODEL = MODEL_GEMINI_2_0_FLASH  # Starting with a powerful Gemini model

weather_agent = Agent(
    name="weather_agent_v1",
    model=AGENT_MODEL, # Specifies the underlying LLM
    description="Provides weather information for specific cities.", # Crucial for delegation later
    instruction="You are a helpful weather assistant. Your primary goal is to provide current weather reports. "
                "When the user asks for the weather in a specific city, "
                "you MUST use the 'get_weather' tool to find the information. "
                "Analyze the tool's response: if the status is 'error', inform the user politely about the error message. "
                "If the status is 'success', present the weather 'report' clearly and concisely to the user. "
                "Only use the tool when a city is mentioned for a weather request.",
    tools=[get_weather], # Make the tool available to this agent
)

print(f"Agent '{weather_agent.name}' created using model '{AGENT_MODEL}'.")














# @title Setup Session Service and Runner

# --- Session Management ---
# Key Concept: SessionService stores conversation history & state.
# InMemorySessionService is simple, non-persistent storage for this tutorial.
session_service = InMemorySessionService()

# Define constants for identifying the interaction context
APP_NAME = "weather_tutorial_app"
USER_ID = "user_1"
SESSION_ID = "session_001" # Using a fixed ID for simplicity

# Create the specific session where the conversation will happen
session = session_service.create_session(
    app_name=APP_NAME,
    user_id=USER_ID,
    session_id=SESSION_ID
)
print(f"Session created: App='{APP_NAME}', User='{USER_ID}', Session='{SESSION_ID}'")

# --- Runner ---
# Key Concept: Runner orchestrates the agent execution loop.
runner = Runner(
    agent=weather_agent, # The agent we want to run
    app_name=APP_NAME,   # Associates runs with our app
    session_service=session_service # Uses our session manager
)
print(f"Runner created for agent '{runner.agent.name}'.")












# @title Define Agent Interaction Function
from google.genai import types # For creating message Content/Parts

async def call_agent_async(query: str):
  """Sends a query to the agent and prints the final response."""
  print(f"\n>>> User Query: {query}")

  # Prepare the user's message in ADK format
  content = types.Content(role='user', parts=[types.Part(text=query)])

  final_response_text = "Agent did not produce a final response." # Default

  # Key Concept: run_async executes the agent logic and yields Events.
  # We iterate through events to find the final answer.
  async for event in runner.run_async(user_id=USER_ID, session_id=SESSION_ID, new_message=content):
      # You can uncomment the line below to see *all* events during execution
      # print(f"  [Event] Author: {event.author}, Type: {type(event).__name__}, Final: {event.is_final_response()}, Content: {event.content}")

      # Key Concept: is_final_response() marks the concluding message for the turn.
      if event.is_final_response():
          if event.content and event.content.parts:
             # Assuming text response in the first part
             final_response_text = event.content.parts[0].text
          elif event.actions and event.actions.escalate: # Handle potential errors/escalations
             final_response_text = f"Agent escalated: {event.error_message or 'No specific message.'}"
          # Add more checks here if needed (e.g., specific error codes)
          break # Stop processing events once the final response is found

  print(f"<<< Agent Response: {final_response_text}")







  # @title Run the Initial Conversation

# We need an async function to await our interaction helper
async def run_conversation():
    await call_agent_async("What is the temprature like in karachi?")
    await call_agent_async("How about Paris?") # Expecting the tool's error message
    await call_agent_async("Tell me the weather in New York")



def main():
    # Run the conversation in a loop
    asyncio.run(run_conversation())

# Execute the conversation using await in an async context (like Colab/Jupyter)
#await run_conversation()