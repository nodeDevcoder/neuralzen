import streamlit as st
import joblib

# Load the trained model and vectorizer
vectorizer = joblib.load('text_vectorizer.joblib')
model = joblib.load('stress_regression_model.joblib')

def predict_average_stress(text_responses):
    # Vectorize the text responses
    text_responses_tfidf = vectorizer.transform(text_responses)
    
    # Predict the average stress rating
    average_stress = model.predict(text_responses_tfidf).mean()

    return average_stress

def display_status_and_tips(average_stress):
    st.subheader("Average Stress Rating:")
    st.write(f"The predicted average stress rating is: {average_stress:.2f}")

    # Display status and tips based on stress level
    if 0 <= average_stress < 1:
        st.subheader("You are Experiencing No Stress")
        st.write("You're in a good place! Keep up the positive habits.")
        st.subheader("Tips:")
        st.write("1. Practice deep breathing exercises.")
        st.write("2. Take short breaks during the day.")
        st.write("3. Engage in activities you enjoy.")
        st.write("4. Maintain a regular sleep schedule.")
        st.write("5. Stay connected with friends and family.")
    elif 1 <= average_stress < 2:
        st.subheader("You are Experiencing Healthy Stress")
        st.write("A manageable level of stress can be beneficial. Focus on maintaining balance.")
        st.subheader("Tips:")
        st.write("1. Prioritize and organize tasks.")
        st.write("2. Practice time management.")
        st.write("3. Incorporate relaxation techniques.")
        st.write("4. Stay physically active.")
        st.write("5. Seek social support when needed.")
    elif 2 <= average_stress < 3:
        st.subheader("You are Moderately Stressed")
        st.write("Consider implementing stress reduction techniques and seeking support.")
        st.subheader("Tips:")
        st.write("1. Consider mindfulness and meditation.")
        st.write("2. Break tasks into smaller steps.")
        st.write("3. Practice positive self-talk.")
        st.write("4. Connect with mental health resources.")
        st.write("5. Consider professional support like cognitive-behavioral therapy.")
    elif 3 <= average_stress <= 4:
        st.subheader("You are Extremely Stressed")
        st.write("It's crucial to prioritize self-care and consider reaching out for professional help.")
        st.subheader("Tips:")
        st.write("1. Reach out to a mental health professional.")
        st.write("2. Consider support groups or counseling.")
        st.write("3. Prioritize self-care and rest.")
        st.write("4. Contact emergency hotlines if needed.")
        st.write("5. Inform friends or family about your situation.")

# Streamlit UI
st.title("Stress Level Predictor with Status and Tips")

# User input (first two responses are required)
most_relevant = st.text_area("What was the most relevant thing that happened this week:")
relevant_else = st.text_area("What else happened that is relevant:")

# Make the remaining two responses optional
something_good = st.text_area("What was something that was good:")
something_bad = st.text_area("What was something that you wish did not happen:")

# Custom validator function for required fields
def validate_required_fields():
    if not most_relevant or not relevant_else:
        return "First two responses are required."
    return None

# Make prediction when the user clicks the button
if st.button("Predict Average Stress Rating", on_click=validate_required_fields):
    # Combine the user responses
    text_responses = [most_relevant, relevant_else, something_good, something_bad]

    # Make prediction
    result = predict_average_stress(text_responses)
    
    # Display status and tips based on stress level
    display_status_and_tips(result)
