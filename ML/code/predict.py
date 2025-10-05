import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import Ridge, Lasso, ElasticNet
from sklearn.model_selection import GridSearchCV
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import matplotlib.pyplot as plt
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings("ignore")

# Load dataset
path_ind = r'C:\Sehwi\NASA_Hackathon\data\USA NPN\processed\individual_phenometrics_data_redbud.csv'
df_ind = pd.read_csv(path_ind)
df_ind_site1 = df_ind[df_ind['Site_ID'] == 18208]

# Goal: Predict First_Yes_DOY (flowering day; 1–366) using linear models (Ridge / Lasso / ElasticNet)
feature_candidates = [
    'AGDD', 'AGDD_in_F', 'Tmax_Winter', 'Tmax_Spring', 'Tmax_Summer', 'Tmax_Fall',
    'Tmin_Winter', 'Tmin_Spring', 'Tmin_Summer', 'Tmin_Fall',
    'Prcp_Winter', 'Prcp_Spring', 'Prcp_Summer', 'Prcp_Fall',
    'Accum_Prcp', 'Daylength'
]
target = 'First_Yes_DOY'

X = df_ind_site1[feature_candidates].astype(float)
y = df_ind_site1[target].astype(float)

print(X.shape, y.shape)

# 1. Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# 2. Standardize features
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# 3. Define model candidates
models = {
    "Ridge": Ridge(),
    "Lasso": Lasso(),
    "ElasticNet": ElasticNet()
}

# 4. Define hyperparameter grid
param_grid = {
    "Ridge": {"alpha": np.logspace(-3, 3, 20)},
    "Lasso": {"alpha": np.logspace(-3, 3, 20)},
    "ElasticNet": {
        "alpha": np.logspace(-3, 3, 10),
        "l1_ratio": np.linspace(0.1, 0.9, 9)
    }
}

results = []

# 5. Train and evaluate each model
for name, model in models.items():
    print(f"\nTraining {name} model...")

    grid = GridSearchCV(model, param_grid[name], cv=5, scoring='neg_mean_squared_error')
    grid.fit(X_train_scaled, y_train)

    best_model = grid.best_estimator_
    y_pred = best_model.predict(X_test_scaled)

    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)

    results.append({
        "Model": name,
        "Best Params": grid.best_params_,
        "MAE": mae,
        "RMSE": rmse,
        "R²": r2
    })

    print(f"Results for {name}:")
    print(f"   - Best Params: {grid.best_params_}")
    print(f"   - MAE:  {mae:.3f}")
    print(f"   - RMSE: {rmse:.3f}")
    print(f"   - R²:   {r2:.3f}")

# 6. Summarize results
results_df = pd.DataFrame(results)
print("\nModel Performance Summary:")
print(results_df)

# 7. Visualization (Actual vs Predicted)
# Select best model based on R²
best_row = results_df.sort_values("R²", ascending=False).iloc[0]
best_model_name = best_row["Model"]
best_params = best_row["Best Params"]

# Refit the best model
final_model = models[best_model_name].set_params(**best_params)
final_model.fit(X_train_scaled, y_train)
y_pred_final = final_model.predict(X_test_scaled)

# Plot actual vs predicted
plt.figure(figsize=(6, 6))
plt.scatter(y_test, y_pred_final, edgecolor='k', alpha=0.7)
plt.plot([y.min(), y.max()], [y.min(), y.max()], 'r--')
plt.xlabel("Actual Flowering Day (DOY)")
plt.ylabel("Predicted Flowering Day (DOY)")
plt.title(f"{best_model_name} Prediction Results (Actual vs Predicted)")
plt.grid(True)
plt.show()

# Function to convert DOY to calendar date
def doy_to_date(year, doy):
    """Convert year and DOY to date (YYYY-MM-DD)"""
    date = datetime(year, 1, 1) + timedelta(days=doy - 1)
    return date.strftime("%Y-%m-%d")

# Example:
# print([doy_to_date(2025, round(result)) for result in y_pred_final])
