import pandas as pd
import numpy as np

np.random.seed(42)
n_total = 500
n_healthy = n_total // 2
n_pd = n_total - n_healthy

# Healthy group (target 0)
healthy = pd.DataFrame({
    "age": np.random.randint(40, 71, size=n_healthy),  # 40 to 70
    "heart rate": np.random.normal(loc=70, scale=5, size=n_healthy).astype(int),
    "spo2": np.clip(np.random.normal(loc=97, scale=1, size=n_healthy), 95, 100).astype(int),
    "muscle stiffness": np.round(np.random.normal(loc=3, scale=1, size=n_healthy), 2),
    "calories burnt": np.random.normal(loc=2200, scale=300, size=n_healthy).astype(int),
    "average sleep": np.round(np.random.normal(loc=7, scale=1, size=n_healthy), 2),
    "daily step count": np.random.normal(loc=10000, scale=2000, size=n_healthy).astype(int),
    "parkinsons": np.zeros(n_healthy, dtype=int)
})

# Parkinson's group (target 1)
pd_group = pd.DataFrame({
    "age": np.random.randint(50, 86, size=n_pd),  # 50 to 85
    "heart rate": np.random.normal(loc=75, scale=8, size=n_pd).astype(int),
    "spo2": np.clip(np.random.normal(loc=95, scale=2, size=n_pd), 90, 100).astype(int),
    "muscle stiffness": np.round(np.random.normal(loc=6, scale=1.5, size=n_pd), 2),
    "calories burnt": np.random.normal(loc=1800, scale=300, size=n_pd).astype(int),
    "average sleep": np.round(np.random.normal(loc=6, scale=1, size=n_pd), 2),
    "daily step count": np.random.normal(loc=5000, scale=1500, size=n_pd).astype(int),
    "parkinsons": np.ones(n_pd, dtype=int)
})

# Combine both groups
df = pd.concat([healthy, pd_group], axis=0).sample(frac=1).reset_index(drop=True)
# Optionally, save to CSV:
df.to_csv("synthetic_parkinsons_dataset.csv", index=False)

print(df.head())
