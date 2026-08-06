# Smart Incident Detection Dashboard

A machine-learning intrusion-detection prototype with a scikit-learn training workflow, persisted Random Forest pipeline, FastAPI prediction endpoint, and React dashboard.

## Verified workflow

1. `download_data.py` downloads the CICIDS2018 source data.
2. The numbered notebooks explore and preprocess the data, train/evaluate the model, and persist the pipeline with joblib.
3. `backend/app.py` loads the saved pipeline and feature list and exposes predictions through FastAPI.
4. The Vite/React frontend submits flow features and visualizes the returned class probabilities.

No accuracy figure is claimed here; consult the executed notebook output when evaluating a particular training run.

## Project structure

```text
backend/
  app.py
frontend/
  src/
notebooks/
  0_setup.ipynb
  1_explore.ipynb
  2_preprocess_and_train.ipynb
  3_deploy_test.ipynb
  models/
requirements.txt
download_data.py
```

## Backend and model setup

```bash
python -m venv .venv
pip install -r requirements.txt
uvicorn backend.app:app --reload --port 8000
```

The included persisted model files allow the API to start without retraining. To reproduce training, run the numbered notebooks in order after obtaining the dataset. A new training run should write the pipeline and feature-name artifacts expected by `backend/app.py`.

Swagger/OpenAPI documentation is available at `http://127.0.0.1:8000/docs` while the API is running.

## Frontend setup

```bash
cd frontend
npm ci
npm run dev
```

Open the local URL printed by Vite. Start the API first so prediction requests can complete.

## Dataset

The project uses the [CICIDS2018 dataset from the Canadian Institute for Cybersecurity](https://www.unb.ca/cic/datasets/ids-2018.html). Raw dataset files are not committed.

## Limitations

- This is an educational prototype, not a production intrusion-detection system.
- Predictions depend on the included training data and feature schema.
- The repository does not include a verified live deployment or a current product screenshot.


