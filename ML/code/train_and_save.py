# ======================================================
# Comparison of multiple linear models + visualization + best model saving
# ======================================================

import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import MinMaxScaler
from sklearn.linear_model import (
    LinearRegression, Ridge, Lasso, ElasticNet,
    BayesianRidge, HuberRegressor, SGDRegressor, TheilSenRegressor, RANSACRegressor
)
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import matplotlib.pyplot as plt
import joblib
import warnings
warnings.filterwarnings("ignore")

# ---------------------- Load Data ---------------------- #
path = r'C:\Sehwi\NASA_Hackathon\data\output'
features_df = pd.read_csv(os.path.join(path, 'merged.csv'))
date_df = pd.read_csv(os.path.join(path, 'bloom_dates.csv'))

features_df['date'] = pd.to_datetime(features_df['date'])
date_df['bloom_date'] = pd.to_datetime(date_df['bloom_date'])

# ---------------------- Target Generation ---------------------- #
def get_next_bloom_diff(ref_date, future_dates):
    """Calculate days until the next bloom date."""
    future = future_dates[future_dates > ref_date]
    if not future.empty:
        diff = (future.min() - ref_date).days
        return diff if diff <= 365 else 365
    else:
        first_next_year = future_dates.min() + pd.DateOffset(years=1)
        diff = (first_next_year - ref_date).days
        return diff if diff <= 365 else 365

features_df['target'] = features_df['date'].apply(
    lambda x: get_next_bloom_diff(x, date_df['bloom_date'])
)

# ---------------------- Feature Selection ---------------------- #
features_candidates = [
    'EVI', 'tmax', 'tmin', 'dayl', 'vp',
    'tmax_spring', 'tmax_summer', 'tmax_fall', 'tmax_winter',
    'tmin_spring', 'tmin_summer', 'tmin_fall', 'tmin_winter',
    'prcp_spring', 'prcp_summer', 'prcp_fall', 'prcp_winter',
    'vp_spring', 'vp_summer', 'vp_fall', 'vp_winter', 'accum_prcp'
]
target = 'target'

X = features_df[features_candidates]
y = features_df[target]

# Time-series split (shuffle=False)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, shuffle=False
)

# ---------------------- Scaling ---------------------- #
scaler = MinMaxScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# ---------------------- Model Definitions ---------------------- #
models = {
    "LinearRegression": LinearRegression(),
    "Ridge": Ridge(),
    "Lasso": Lasso(),
    "ElasticNet": ElasticNet(),
    "BayesianRidge": BayesianRidge(),
    "HuberRegressor": HuberRegressor(),
    "SGDRegressor": SGDRegressor(max_iter=1000, tol=1e-3),
    "TheilSenRegressor": TheilSenRegressor(),
    "RANSACRegressor": RANSACRegressor(estimator=LinearRegression())
}

param_grids = {
    "Ridge": {"alpha": [0.01, 0.1, 0.5, 1.0, 5.0, 10.0]},
    "Lasso": {"alpha": [0.001, 0.01, 0.1, 1.0]},
    "ElasticNet": {"alpha": [0.001, 0.01, 0.1, 1.0], "l1_ratio": [0.2, 0.5, 0.8]},
}

# ---------------------- Training and Evaluation ---------------------- #
results = {}
for name, model in models.items():
    print(f"Training {name} ...")
    if name in param_grids:
        grid = GridSearchCV(model, param_grids[name], cv=5, scoring="neg_mean_absolute_error")
        grid.fit(X_train_scaled, y_train)
        best_model = grid.best_estimator_
    else:
        model.fit(X_train_scaled, y_train)
        best_model = model

    y_pred = best_model.predict(X_test_scaled)
    y_pred = np.clip(y_pred, 0, 365)

    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)

    results[name] = {"model": best_model, "MAE": mae, "RMSE": rmse, "R2": r2}
    print(f"{name} | MAE: {mae:.2f}, RMSE: {rmse:.2f}, R²: {r2:.4f}")
    print("-" * 50)

# ---------------------- Compare Results ---------------------- #
result_df = pd.DataFrame(results).T.sort_values(by="MAE")
print("\nModel Performance Comparison:")
print(result_df[["MAE", "RMSE", "R2"]])

best_model_name = result_df.index[0]
best_model = results[best_model_name]["model"]

print(f"\nBest Model: {best_model_name}")

# ---------------------- Save Best Model ---------------------- #
save_dir = os.path.join(path, "saved_models")
os.makedirs(save_dir, exist_ok=True)
joblib.dump(best_model, os.path.join(save_dir, "best_model.joblib"))
joblib.dump(scaler, os.path.join(save_dir, "scaler.joblib"))
print(f"Best model ({best_model_name}) saved to → {save_dir}")

# ---------------------- Prediction and Visualization ---------------------- #
y_pred = best_model.predict(X_test_scaled)
y_pred = np.clip(y_pred, 0, 365)

predicted_bloom_dates = X_test.copy()
predicted_bloom_dates['date'] = features_df.loc[X_test.index, 'date']
predicted_bloom_dates['pred_days'] = y_pred
predicted_bloom_dates['pred_bloom_date'] = predicted_bloom_dates['date'] + pd.to_timedelta(predicted_bloom_dates['pred_days'], unit='D')

# Compute actual bloom date
def get_true_bloom_date(ref_date):
    future_dates = date_df['bloom_date']
    candidates = future_dates[future_dates > ref_date]
    if not candidates.empty:
        return candidates.min()
    else:
        first_bloom = future_dates.min()
        if pd.isnull(first_bloom):
            return pd.NaT
        adjusted_bloom = first_bloom.replace(year=ref_date.year + 1)
        return adjusted_bloom if adjusted_bloom > ref_date else pd.NaT

predicted_bloom_dates['true_bloom_date'] = predicted_bloom_dates['date'].apply(get_true_bloom_date)
predicted_bloom_dates['true_days_until_bloom'] = (predicted_bloom_dates['true_bloom_date'] - predicted_bloom_dates['date']).dt.days
predicted_bloom_dates['abs_error'] = abs(predicted_bloom_dates['true_days_until_bloom'] - predicted_bloom_dates['pred_days'])

print("\n[Sample Prediction Results]")
print(predicted_bloom_dates[['date', 'pred_days', 'true_days_until_bloom', 'abs_error', 'pred_bloom_date', 'true_bloom_date']].head(10))

print(f"\nMean Absolute Error (MAE): {predicted_bloom_dates['abs_error'].mean():.2f} days")
print(f"Max Error: {predicted_bloom_dates['abs_error'].max():.2f} days")
print(f"Min Error: {predicted_bloom_dates['abs_error'].min():.2f} days")

# ---------------------- Visualization ---------------------- #
plt.figure(figsize=(12, 6))
plt.plot(predicted_bloom_dates['date'], predicted_bloom_dates['true_days_until_bloom'],
         label='True Days Until Bloom', color='black', linewidth=2)
plt.plot(predicted_bloom_dates['date'], predicted_bloom_dates['pred_days'],
         label=f'Predicted ({best_model_name})', linestyle='--', alpha=0.8)
plt.xlabel('Reference Date')
plt.ylabel('Days Until Bloom')
plt.title(f'Predicted vs True Days Until Bloom ({best_model_name})')
plt.legend()
plt.tight_layout()
plt.show()

# Visualization by bloom date instead of reference date
plt.figure(figsize=(12, 6))
plot_df = predicted_bloom_dates.sort_values('date')

plt.plot(plot_df['date'], plot_df['true_bloom_date'], label='True Bloom Date', color='black', linewidth=2)
plt.plot(plot_df['date'], plot_df['pred_bloom_date'], label=f'Predicted Bloom Date ({best_model_name})',
         color='dodgerblue', linestyle='--', linewidth=2)

for _, row in plot_df.iterrows():
    plt.plot([row['date'], row['date']], [row['true_bloom_date'], row['pred_bloom_date']],
             color='gray', linestyle=':', linewidth=1)

plt.xlabel('Reference Date')
plt.ylabel('Bloom Date')
plt.title(f'Predicted vs True Bloom Date ({best_model_name})')
plt.legend()
plt.grid(True)
plt.tight_layout()
plt.show()

# ---------------------- Save Prediction Results as JSON ---------------------- #
json_save_path = os.path.join(path, "predicted_results.json")

# Select columns to export
json_df = predicted_bloom_dates[['date', 'pred_days', 'true_days_until_bloom',
                                 'abs_error', 'pred_bloom_date', 'true_bloom_date']].copy()

# Convert datetime columns to string for JSON serialization
json_df['date'] = json_df['date'].astype(str)
json_df['pred_bloom_date'] = json_df['pred_bloom_date'].astype(str)
json_df['true_bloom_date'] = json_df['true_bloom_date'].astype(str)

# Save to JSON
json_df.to_json(json_save_path, orient='records', force_ascii=False, indent=4)

print(f"Prediction results saved as JSON → {json_save_path}")
