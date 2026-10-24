
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor
from sklearn.dummy import DummyRegressor
from sklearn.metrics import mean_absolute_error

# 1. Load the dataset
data = pd.read_csv("ml/mess_wait_data.csv")

# 2. Select inputs (features) and output (target)
X = data[["queue_size", "open_counters", "meal", "day"]]
y = data["wait_minutes"]

# 3. Convert text features into numerical values
preprocessor = ColumnTransformer(
    transformers=[
        ("text", OneHotEncoder(handle_unknown="ignore"),
         ["meal", "day"])
    ],
    remainder="passthrough"
)

# 4. Split data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=42
)

# 5. Create the ML model
model = Pipeline([
    ("preprocessor", preprocessor),
    ("regressor", RandomForestRegressor(
        n_estimators=100, random_state=42
    ))
])

# 6. Train the model
model.fit(X_train, y_train)

# 7. Make predictions on test data
predictions = model.predict(X_test)

# 8. Measure prediction error
mae = mean_absolute_error(y_test, predictions)
print("Random Forest MAE:", round(mae, 2), "minutes")

# 9. Compare with a simple baseline
baseline = DummyRegressor(strategy="mean")
baseline.fit(X_train[["queue_size"]], y_train)

baseline_predictions = baseline.predict(
    X_test[["queue_size"]]
)
baseline_mae = mean_absolute_error(y_test, baseline_predictions)

print("Baseline MAE:", round(baseline_mae, 2), "minutes")

# 10. Try a new prediction
new_queue = pd.DataFrame([{
    "queue_size": 12,
    "open_counters": 3,
    "meal": "Lunch",
    "day": "Monday"
}])

predicted_wait = model.predict(new_queue)[0]

print("Example predicted waiting time:",
      round(predicted_wait, 1), "minutes")
joblib.dump(model, "ml/wait_time_model.joblib")

print("Model saved successfully!")