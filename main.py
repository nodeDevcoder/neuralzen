import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error

# Example training dataset
data = {
    "Text": [
        "What was the most relevant thing that happened this week",
        "What else happened that is relevant",
        "What was something that was good",
        "What was something that you wish did not happen"
    ],
    "Stress_Level": [3, 2, 1, 4]
}

df = pd.DataFrame(data)

# Features and target variable
X = df["Text"]
y = df["Stress_Level"]

# Split the dataset into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Create a TF-IDF vectorizer and linear regression model
from sklearn.feature_extraction.text import TfidfVectorizer

vectorizer = TfidfVectorizer()
X_train_tfidf = vectorizer.fit_transform(X_train)

model = LinearRegression()

# Train the model
model.fit(X_train_tfidf, y_train)

# Evaluate the model
X_test_tfidf = vectorizer.transform(X_test)
predictions = model.predict(X_test_tfidf)

# Print evaluation metrics
mse = mean_squared_error(y_test, predictions)
print(f"Mean Squared Error: {mse}")

# Save the trained model
import joblib

joblib.dump(vectorizer, 'text_vectorizer.joblib')
joblib.dump(model, 'stress_regression_model.joblib')
