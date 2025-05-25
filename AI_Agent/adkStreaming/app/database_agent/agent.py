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

# --- ADK Agent Definition ---
# Assuming you have access to google.adk.agents.Agent
try:
    from google.adk.agents import Agent
except ImportError:
    print("Warning: google.adk.agents.Agent not found.")
    print("This code will not run as an ADK agent without the actual ADK library.")
    # Placeholder Agent class for conceptual illustration
    class Agent:
        def __init__(self, name, model, description, instruction, tools):
            self.name = name
            self.model = model
            self.description = description
            self.instruction = instruction
            self.tools = tools
            print(f"Placeholder Agent '{name}' initialized with model '{model}'.")
            print(f"  Description: {description}")
            print(f"  Instruction: {instruction}")
            print(f"  Tools: {[getattr(t, '_adk_tool_name', t.__name__) for t in tools]}")

        def __call__(self, query: str, **kwargs):
            print(f"\n--- Placeholder Agent '{self.name}' Invoked ---")
            print(f"User Query: {query}")
            print("Agent would now process this with the LLM and tools.")
            print("Simulating LLM deciding to use 'execute_sql_query'...")
            # This is a super simplified simulation. The actual ADK/LLM would
            # generate the SQL based on the query and instructions.
            if "how many employees" in query.lower():
                simulated_sql = "SELECT COUNT(*) FROM Employees;"
            elif "engineering department" in query.lower():
                simulated_sql = "SELECT * FROM Employees WHERE Department = 'Engineering';"
            elif "average salary" in query.lower() and "marketing" in query.lower():
                simulated_sql = "SELECT AVG(Salary) FROM Employees WHERE Department = 'Marketing';"
            else:
                simulated_sql = "SELECT 1;" # Dummy query
                print("Could not map query to a simple simulated SQL. LLM would do better.")

            print(f"Simulated SQL generated by LLM: {simulated_sql}")
            if any(t == execute_sql_query for t in self.tools): # Check if tool is available
                tool_result = execute_sql_query(sql_query=simulated_sql)
                print(f"Tool Result:\n{tool_result}")
                print("LLM would then formulate a final answer based on this tool result.")
                return f"Based on the database: {tool_result}"
            else:
                return "SQL tool not available to this agent."

# Schema information to help the LLM. This should be part of the agent's instruction.
# For more complex DBs, you might have a tool to fetch schema dynamically.
DATABASE_SCHEMA_INFO = """
You have access to a SQL Server database with the following tables:

Table: dbo.main_profile
Columns:
- id (INT, PRIMARY KEY): Unique identifier for the profile of user.
- bio (NVARCHAR(50)): Users bio.
- profileimg (NVARCHAR(50)): Employee's last name.
- location (NVARCHAR(50)): Department the employee belongs to.
- userid (INT,FOREIGN KEY): Users id for Users Table.

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
   instruction=f"""You are an expert SQL query writer and a helpful assistant.
Your task is to understand the user's question about employees, translate it into a syntactically correct
SQL SELECT query for a SQL Server database, and then use the 'execute_sql_query' tool to run the query.
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

# --- Example Usage ---
# if __name__ == "__main__":
#     print("SQL Query Agent (ADK Style) - Ready for questions.")
#     print("Note: If ADK libraries are not fully available, this will run in placeholder mode.")

#     questions = [
#         "How many users are there?",
#         "List all employees in the Engineering department.",
#         "What is the average salary of employees in the Marketing department?",
#         "Show me the first names and hire dates of employees hired before '2021-01-01'.",
#         "Who is the employee with EmployeeID 3?",
#         "Try to update a salary for employee 1.", # Should be rejected by instruction/tool
#         "What are the distinct departments?"
#     ]

#     for q in questions:
#         print("-" * 40)
#         # In a real ADK setup, you'd invoke the agent, e.g., response = sql_query_agent(q)
#         # The placeholder Agent has a basic __call__ for demonstration.
#         response = sql_query_agent(q)
#         print(f"\nAgent's Final Response (simulated for placeholder):\n{response}")
#         print("-" * 40)

#     # Example of directly testing the tool (useful for debugging)
#     # print("\n--- Direct Tool Test ---")
#     # test_sql = "SELECT TOP 2 FirstName, Salary FROM Employees ORDER BY Salary DESC;"
#     # tool_output = execute_sql_query(sql_query=test_sql)
#     # print(f"Direct tool output for '{test_sql}':\n{tool_output}")






# if __name__ == "__main__":
#     print("SQL Query Agent (ADK Style) - Ready for questions.")

#     # --- TEMPORARY DEBUGGING: Inspect the agent object ---
#     print("-" * 20 + " AGENT INSPECTION " + "-" * 20)
#     print(f"Type of sql_query_agent: {type(sql_query_agent)}")
#     print("Methods and attributes (dir(sql_query_agent)):")
#     for item in dir(sql_query_agent):
#         if not item.startswith('_'): # Filter out private/dunder methods for brevity
#             print(f"  {item}")
#     print("-" * 50)
#     # --- END TEMPORARY DEBUGGING ---


#     questions = [
#         "How many users are there in the auth_user table?",
#         "List all usernames from the auth_user table.",
#         "Show me users whose first name is 'John'."
#         # Add more relevant questions for your Ubook schema
#     ]

#     for q in questions:
#         print("-" * 40)
#         print(f"User Question: {q}")
#         try:
#             # === ATTEMPT DIFFERENT INVOCATION METHODS ===
#             # Try one of these at a time, commenting out the others.
#             # The input format (q vs. {"input": q}) might also need to change.

#             # Option 1: .run()
#             response_object = sql_query_agent.run(q)
#             # response_object = sql_query_agent.run({"input": q}) # Alternative input format

#             # Option 2: .chat() - If it's more conversational
#             # response_object = sql_query_agent.chat(q)
#             # response_object = sql_query_agent.chat({"message": q})

#             # Option 3: Find another method from the dir() output and try it
#             # response_object = sql_query_agent.some_other_method(q)


#             print(f"\nAgent's Response Object:\n{response_object}")

#             if isinstance(response_object, dict):
#                 final_answer = response_object.get('output', response_object.get('answer', str(response_object)))
#             elif hasattr(response_object, 'text'):
#                  final_answer = response_object.text
#             elif isinstance(response_object, str): # If the method directly returns a string
#                 final_answer = response_object
#             else:
#                 final_answer = str(response_object)

#             print(f"\nAgent's Final Answer:\n{final_answer}")

#         except AttributeError as ae:
#             print(f"AttributeError: {ae}")
#             print("The method used to call the agent is incorrect.")
#             print("Please check the Google ADK documentation or the `dir()` output above for the correct agent invocation method.")
#         except TypeError as te:
#             print(f"TypeError: The method was found, but the arguments are incorrect: {te}")
#             print("Check if the input should be a string directly, or a dictionary like {'input': q}, etc.")
#         except Exception as e:
#             print(f"An unexpected error occurred: {e}")
#         print("-" * 40)
