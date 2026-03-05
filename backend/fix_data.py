import pandas as pd

# 1. Load your CSV (make sure the filename matches)
df = pd.read_csv('dataset.csv')

# 2. Define a logical rule-set for the AI to learn from
def calculate_severity(row):
    # Standardize string matching just in case
    report = str(row['Report_Type']).strip().lower()
    days = int(row['Days_Since_Last_Issue'])
    
    if report == 'contamination':
        return 'Critical' if days > 3 else 'High'
    elif report == 'shortage':
        return 'High' if days > 5 else 'Medium'
    else: # For 'leak' or anything else
        return 'Medium' if days > 7 else 'Low'

# 3. Apply the logic to fill the existing target column
df['Predicted_Severity'] = df.apply(calculate_severity, axis=1)

# 4. Save to a new file (OneDrive locks the original)
df.to_csv('dataset_fixed.csv', index=False)

print("Severity column successfully populated! You are ready to train.")