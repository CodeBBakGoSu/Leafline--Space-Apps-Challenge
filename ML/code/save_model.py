import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.linear_model import Ridge, Lasso, ElasticNet
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import matplotlib.pyplot as plt
import joblib
import warnings
warnings.filterwarnings("ignore")

# ==============================
# CONFIGURATION
# ==============================
CONFIG = {
    "path": r"C:\sehwi\NASAHackerton\data\output",
    "feature_file": "merged.csv",
    "bloom_file": "bloom_dates.csv",
    "save_dir": "saved_models",
    "features": [
        "EVI", "tmax", "tmin", "dayl", "vp", "accum_prcp",
        "tmax_spring", "tmax_summer", "tmax_fall", "tmax_winter",
        "tmin_spring", "tmin_summer", "tmin_fall", "tmin_winter",
        "prcp_spring", "prcp_summer", "prcp_fall", "prcp_winter",
        "vp_spring", "vp_summer", "vp_fall", "vp_winter"
    ],
    "target": "target",
    "scaler_type": "minmax",  # or "standard"
    "test_size": 0.2,
    "models": {
        "Ridge": Ridge(),
        "Lasso": Lasso(),
        "ElasticNet": ElasticNet()
    },
    "param_grid": {"alpha": [0.01, 0.1, 0.2, 0.5, 1.0, 10.0]}
}

# ==============================
# FUNCTIONS
# ==============================

def load_data(config):
    path = config["path"]
    features_df = pd.read_csv(os.path.join(path, config["feature_file"]))
    date_df = pd.read_csv(os.path.join(path, config["bloom_file"]))
    features_df["date"] = pd.to_datetime(features_df["date"])
    date_df["bloom_date"] = pd.to_datetime(date_df["bloom_date"])
    return features_df, date_df


def get_next_bloom_diff(ref_date, future_dates):
    future = future_dates[future_dates > ref_date]
    if not future.empty:
        diff = (future.min() - ref_date).days
        return min(diff, 365)
    else:
        first_next_year = future_dates.min() + pd.DateOffset(years=1)
        diff = (first_next_year - ref_date).days
        return min(diff, 365)


def create_target(features_df, date_df, config):
    features_df[config["target"]] = features_df["date"].apply(
        lambda x: get_next_bloom_diff(x, date_df["bloom_date"])
    )
    save_path = os.path.join(config["path"], "features_with_targets.csv")
    features_df.to_csv(save_path, index=False)
    print(f"Target 생성 완료 → {save_path}")
    return features_df


def split_and_scale(X, y, config):
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=config["test_size"], shuffle=False
    )
    scaler = MinMaxScaler() if config["scaler_type"] == "minmax" else StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    return X_train_scaled, X_test_scaled, y_train, y_test, scaler


def train_models(X_train_scaled, y_train, X_test_scaled, y_test, config):
    results = {}
    for name, model in config["models"].items():
        grid = GridSearchCV(model, config["param_grid"], cv=5)
        grid.fit(X_train_scaled, y_train)
        best_model = grid.best_estimator_
        y_pred = best_model.predict(X_test_scaled)

        mae = mean_absolute_error(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        r2 = r2_score(y_test, y_pred)

        results[name] = {"model": best_model, "MAE": mae, "RMSE": rmse, "R2": r2}
        print(f"[{name}] α={grid.best_params_['alpha']} | MAE={mae:.2f}, RMSE={rmse:.2f}, R2={r2:.4f}")
    return results


def save_model_and_scaler(model, scaler, config):
    save_dir = os.path.join(config["path"], config["save_dir"])
    os.makedirs(save_dir, exist_ok=True)
    joblib.dump(model, os.path.join(save_dir, "ridge_model.joblib"))
    joblib.dump(scaler, os.path.join(save_dir, "scaler.joblib"))
    print(f"Saved a model and scaler. → {save_dir}")


def evaluate_predictions(features_df, date_df, model, scaler, config):
    X = features_df[config["features"]]
    y = features_df[config["target"]]
    _, X_test_scaled, _, y_test, _ = split_and_scale(X, y, config)

    y_pred = np.clip(model.predict(X_test_scaled), 0, 365)
    predicted_df = features_df.iloc[int(len(features_df)*(1-config["test_size"])):].copy()
    predicted_df["pred_days"] = y_pred
    predicted_df["pred_bloom_date"] = predicted_df["date"] + pd.to_timedelta(predicted_df["pred_days"], unit="D")

    def get_true_bloom_date(ref_date):
        candidates = date_df["bloom_date"][date_df["bloom_date"] > ref_date]
        if not candidates.empty:
            return candidates.min()
        first_bloom = date_df["bloom_date"].min()
        return first_bloom.replace(year=ref_date.year + 1) if pd.notnull(first_bloom) else pd.NaT

    predicted_df["true_bloom_date"] = predicted_df["date"].apply(get_true_bloom_date)
    predicted_df["true_days_until_bloom"] = (predicted_df["true_bloom_date"] - predicted_df["date"]).dt.days
    predicted_df["abs_error"] = abs(predicted_df["true_days_until_bloom"] - predicted_df["pred_days"])

    print("\n[Prediction Sample]")
    print(predicted_df[["date", "pred_days", "true_days_until_bloom", "abs_error"]].head(10))
    print(f"\nMAE: {predicted_df['abs_error'].mean():.2f}일")
    print(f"Maximum Error: {predicted_df['abs_error'].max():.2f}일")

    visualize_bloom_dates(predicted_df)
    return predicted_df


def visualize_results(pred_df):
    plt.figure(figsize=(12, 6))
    plt.plot(pred_df["date"], pred_df["true_days_until_bloom"], label="True", color="black", linewidth=2)
    plt.plot(pred_df["date"], pred_df["pred_days"], label="Predicted", linestyle="--")
    plt.xlabel("Date")
    plt.ylabel("Days Until Bloom")
    plt.title("Predicted vs True Days Until Bloom (Ridge)")
    plt.legend()
    plt.tight_layout()
    plt.show()

def visualize_bloom_dates(pred_df):
    plt.figure(figsize=(12, 6))
    plot_df = pred_df.sort_values("date")

    plt.plot(plot_df["date"], plot_df["true_bloom_date"],
             label="True Bloom Date", color="black", linewidth=2)
    plt.plot(plot_df["date"], plot_df["pred_bloom_date"],
             label="Predicted Bloom Date", color="dodgerblue", linestyle="--", linewidth=2)

    for _, row in plot_df.iterrows():
        plt.plot([row["date"], row["date"]],
                 [row["true_bloom_date"], row["pred_bloom_date"]],
                 color="gray", linestyle=":", linewidth=1)

    plt.xlabel("Reference Date")
    plt.ylabel("Bloom Date")
    plt.title("Predicted vs True Bloom Date (Ridge)")
    plt.legend()
    plt.grid(True)
    plt.tight_layout()
    plt.show()

# ==============================
# MAIN PIPELINE
# ==============================
if __name__ == "__main__":
    features_df, date_df = load_data(CONFIG)
    features_df = create_target(features_df, date_df, CONFIG)
    X = features_df[CONFIG["features"]]
    y = features_df[CONFIG["target"]]

    X_train_scaled, X_test_scaled, y_train, y_test, scaler = split_and_scale(X, y, CONFIG)
    results = train_models(X_train_scaled, y_train, X_test_scaled, y_test, CONFIG)

    ridge_model = results["Ridge"]["model"]
    save_model_and_scaler(ridge_model, scaler, CONFIG)

    _ = evaluate_predictions(features_df, date_df, ridge_model, scaler, CONFIG)


