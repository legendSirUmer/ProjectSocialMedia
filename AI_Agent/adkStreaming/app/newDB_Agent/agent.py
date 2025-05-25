from google.adk.agents import Agent
from google.adk.tools import google_search  # Import the tool


import pyodbc
import json # For potentially structured error messages or results

# --- Configuration ---
# SQL Server Configuration
DB_SERVER = "DESKTOP-1CU83GB\\SQLEXPRESS01"  # e.g., "localhost\\SQLEXPRESS"
DB_NAME = "Ubook"
# For Windows Authentication (Trusted Connection):
DB_USERNAME = None
DB_PASSWORD = None
# For SQL Server Authentication:
# DB_USERNAME = "your_sql_username"
# DB_PASSWORD = "your_sql_password"
DB_DRIVER = "ODBC Driver 17 for SQL Server" # Make sure this matches

# --- ADK Tool Definition ---
# Assuming you have access to google.adk.tools.tool decorator
# If not, this is how you would conceptually define a tool for function calling
# with google-generativeai or vertexai SDKs.

try:
    from google.adk.tools import tool # Try to import the ADK tool decorator
except ImportError:
    print("Warning: google.adk.tools.tool not found. Using a placeholder decorator.")
    print("This code will not run as an ADK agent without the actual ADK library.")
    # Placeholder decorator if ADK is not available, for conceptual illustration
    def tool(func_or_name=None, description=None):
        if callable(func_or_name): # Used as @tool
            func_or_name._is_adk_tool = True
            func_or_name._adk_description = description or func_or_name.__doc__
            return func_or_name
        else: # Used as @tool("name", "description")
            def decorator(func):
                func._is_adk_tool = True
                func._adk_tool_name = func_or_name
                func._adk_description = description or func.__doc__
                return func
            return decorator



@tool(description="Executes a given SQL SELECT query against the Ubook database and returns the results.")
def execute_sql_query(sql_query: str) -> str:
    """
    Executes a read-only SQL SELECT query on the SQL Server database.
    Args:
        sql_query (str): The SQL SELECT query to execute.
                         Example: "SELECT FirstName, LastName FROM Employees WHERE Department = 'Engineering'"
    Returns:
        str: A string representation of the query results (e.g., JSON list of dicts or CSV-like)
             or an error message if the query fails.
    """
    print(f"Tool 'execute_sql_query' received SQL: {sql_query}")
    connection_string_parts = [
        f"DRIVER={{{DB_DRIVER}}}",
        f"SERVER={DB_SERVER}",
        f"DATABASE={DB_NAME}",
    ]
    if DB_USERNAME and DB_PASSWORD:
        connection_string_parts.append(f"UID={DB_USERNAME}")
        connection_string_parts.append(f"PWD={DB_PASSWORD}")
    else:
        connection_string_parts.append("Trusted_Connection=yes")

    connection_string = ";".join(connection_string_parts)
    results = []
    conn = None # Initialize conn to None
    try:
        conn = pyodbc.connect(connection_string)
        cursor = conn.cursor()

        # Basic validation: only allow SELECT statements for safety in this basic example
        if not sql_query.strip().upper().startswith("SELECT"):
            return "Error: Only SELECT queries are allowed."

        cursor.execute(sql_query)
        columns = [column[0] for column in cursor.description]
        for row in cursor.fetchall():
            results.append(dict(zip(columns, row)))

        if not results:
            return "Query executed successfully, but no results were found."
        # Convert to a string format that the LLM can easily parse or present
        # JSON string is often a good choice
        return json.dumps(results, indent=2, default=str) # default=str for dates/decimals

    except pyodbc.Error as ex:
        sqlstate = ex.args[0]
        error_message = f"SQL Server Error ({sqlstate}): {ex.args[1]}"
        print(f"Error in 'execute_sql_query': {error_message}")
        return f"Error executing SQL query: {error_message}"
    except Exception as e:
        print(f"Generic error in 'execute_sql_query': {e}")
        return f"An unexpected error occurred: {str(e)}"
    finally:
        if conn:
            conn.close()






DATABASE_SCHEMA_INFO = """
You have access to a SQL Server database with the following tables:

Table: dbo.main_profile
Columns:
- id (INT, PRIMARY KEY): Unique identifier for the profile of user.
- bio (NVARCHAR(50)): Users bio.
- profileimg (NVARCHAR(50)): Employee's last name.
- location (NVARCHAR(50)): Department the employee belongs to.
- user_id (INT,FOREIGN KEY): Users id for Users Table.

Table: dbo.auth_user
Columns:
- id (INT, PRIMARY KEY): Unique identifier for the user.
- username (NVARCHAR(150)): Username of the user.
- first_name (NVARCHAR(30)): First name of the user.
- last_name (NVARCHAR(150)): Last name of the user.
- email (NVARCHAR(254)): Email address of the user.

You can use the 'execute_sql_query' tool to run SELECT queries against these tables.
"""





root_agent = Agent(
   # A unique name for the agent.
   name="basic_search_agent",
   # The Large Language Model (LLM) that agent will use.
   model="gemini-2.0-flash", # Google AI Studio
   #model="gemini-2.0-flash-live-preview-04-09" # Vertex AI Studio
   # A short description of the agent's purpose.
   description="Agent that answers questions by querying the Ubook SQL Server database about users and their profiles.",
   instruction=f"""You are an expert SQL query executer and a helpful assistant.
Your task is to understand the user's question about employees, translate it into a syntactically correct
SQL SELECT query for a SQL Server database, and then use the 'execute_sql_query' tool every time to run the query.
Based on the tool's output, provide a clear and concise answer to the user.
{DATABASE_SCHEMA_INFO}
Only generate SELECT queries. Do not attempt to modify data (INSERT, UPDATE, DELETE) or schema (CREATE, ALTER, DROP).
If the user asks for something that cannot be answered with a SELECT query on the Employees table,
politely state that you cannot perform that action.
If the SQL query results in an error, inform the user about the error.
If the query returns no results, inform the user that no matching data was found.
""",
   tools=[execute_sql_query] # The custom tool we defined
)


