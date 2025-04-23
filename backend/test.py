from datetime import datetime

# Get current date
current_date = datetime.now()

# Convert to string in the desired format
date_string = current_date.strftime("%Y-%m-%d")  # Format: YYYY-MM-DD
print(date_string)
