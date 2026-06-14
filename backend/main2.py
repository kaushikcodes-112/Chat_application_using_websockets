from fastapi import FastAPI, Form
from fastapi.responses import HTMLResponse

app = FastAPI()

# In-memory user pool
REGISTERED_USERS = set()

# --- 1. THE VISUAL GATEWAY (GET) ---
# We give the function an optional 'error' argument that defaults to None
@app.get("/register", response_class=HTMLResponse)
def serve_registration_form(error: str | None = None):
    
    # If an error string exists, build a little styled HTML notification snippet
    error_alert = ""
    if error:
        error_alert = f"""
        <div style="color: #721c24; background-color: #f8d7da; padding: 10px; border-radius: 4px; margin-bottom: 15px; border: 1px solid #f5c6cb;">
            ⚠️ {error}
        </div>
        """

    # We use Python f-string interpolation to dynamically drop the alert box into the page layout!
    return f"""
    <!DOCTYPE html>
    <html>
        <head>
            <title>Chat Login</title>
            <style>
                body {{ font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f4f6f9; }}
                .card {{ background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); width: 280px; text-align: center; }}
                input {{ padding: 10px; width: 90%; margin-bottom: 15px; border: 1px solid #ccc; border-radius: 4px; }}
                button {{ padding: 10px 20px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; width: 100%; }}
            </style>
        </head>
        <body>
            <div class="card">
                <h2>Join Chatroom</h2>
                
                {error_alert}  <form action="/register" method="post">
                    <input type="text" name="chat_nickname" placeholder="Choose a username" required autocomplete="off">
                    <button type="submit">Enter Room</button>
                </form>
            </div>
        </body>
    </html>
    """

# --- 2. THE DATA PROCESSOR (POST) ---
@app.post("/register", response_class=HTMLResponse)
def process_registration_payload(chat_nickname: str = Form(...)):
    # Normalize input to strip spaces
    username = chat_nickname.strip()
    
    # INTERCEPTION PHASE: Check if the username already exists in our active set memory
    if username in REGISTERED_USERS:
        # Instead of raising a systemic HTTPException, we bypass it!
        # We re-call our own GET function and return its HTML, embedding the specific warning message string
        return serve_registration_form(error="That name is already taken! Please try again.")

    # SUCCESS PHASE: The string is completely unique
    REGISTERED_USERS.add(username)
    
    # For now, return a basic page acknowledging entry. Next up, we point this directly to the chatroom gateway route!
    return f"""
    <h2>Success! Registered as: {username}</h2>
    <p>We will configure this room to automatically spin open your stateful WebSockets thread connection next.</p>
    """