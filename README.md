# Smart Medical Triage Assistant (AHQAD)

AI-powered web application that helps patients choose the correct medical specialty based on their symptoms, estimates severity, and can retrieve a relevant medical answer from a large Arabic Q&A dataset.

---

## 1. Project Overview

- Goal: Transform an AI coding experiment into a usable **product** that a non-technical patient or doctor can actually use.
- Form: Web application with a chat interface similar to modern AI chat systems.
- Core idea: Patient writes symptoms → system predicts specialty, severity, urgency, and retrieves a likely helpful Q&A pair.

---

## 2. Main Features

- Symptom-based **specialty recommendation** (82 medical categories).
- Simple **severity** estimation (e.g., low / medium / high) and **urgent flag**.
- **Arabic medical Q&A retrieval**: suggest a relevant answer from the dataset.
- User accounts, saved chat history, and ability to return later and continue.
- Upload and save:
  - Prescription images.
  - Medical test results + short summary.
- Clear disclaimer: assistant provides guidance, **not** an official diagnosis.

---

## 3. Dataset (AHQAD Arabic Medical Q&A)

- Source: Arabic Medical Q&A Dataset (AHQAD) from Kaggle.
- Raw dataset shape: **808,472 rows**, 4 columns:
  - `Question`, `Answer`, `Category`, plus an index column.
- Cleaning steps:
  - Removed missing values.
  - Removed very short questions.
  - Removed duplicate questions.
  - Removed categories with fewer than 10 samples.
- Final dataset:
  - **807,094 Q&A pairs** after cleaning.
  - **82 unique categories** retained.
  - Average question length ≈ 115 characters.
  - Average answer length ≈ 152 characters.
- Examples of largest categories (by sample count):
  - أمراض نسائية
  - الصحة الجنسية
  - أمراض العضلات والعظام و المفاصل
  - أمراض المسالك البولية والتناسلية
  - الأمراض الجلدية
  - الطب العام
  - أمراض الجهاز الهضمي
  - أمراض الأطفال
  - أمراض القلب و الشرايين
  - أمراض نفسية

---

## 4. Model Training Summary

### 4.1 Task

- Train a **text classifier** that predicts the medical category for each question.
- Build an **answer retrieval index** to fetch the most similar Q&A for a new question.

### 4.2 Data Split

- Split ratio: **50% train / 50% test**.
- Training samples: **403,547**.
- Test samples: **403,547**.

### 4.3 Category Classifier

- Model type: **Logistic Regression** classifier over TF‑IDF text features.
- Target: `Category` (82 medical categories).
- Overall test accuracy: **63.07%** (multi-class classification).
- For top high-frequency categories, precision/recall/F1 are generally strong (especially in gynecology, dermatology, musculoskeletal, pediatrics, etc.), weaker in some ambiguous “sexual diseases” categories due to overlap and noise.

### 4.4 Answer Retrieval Index

- Built a TF‑IDF index over **all questions** (807,094 Q&A pairs).
- Vector dimension: **20,000** features.
- At inference time:
  - New question → vectorized.
  - Retrieve nearest question(s) from index.
  - Return corresponding answer(s) from the Q&A database.
- This enables the system to provide:
  - Predicted category (specialty).
  - A likely relevant answer text from the dataset.

---

## 5. Generated Artifacts

Training script produced the following files in `models/`:

1. `triage_text_classifier.joblib`  
   - Scikit‑learn pipeline (TF‑IDF + Logistic Regression).
   - Used to predict medical category / specialty from raw Arabic question text.

2. `answer_retrieval_index.joblib`  
   - Vector index for question similarity search.
   - Used to find best‑matching Q&A pairs.

3. `qa_database.csv`  
   - Cleaned Q&A data aligned with the index.
   - Provides the actual text answers to display.

4. `label_to_specialty.json`  
   - Mapping from category labels / IDs to human‑readable specialty names.
   - Used by the backend to display understandable names (e.g., “Cardiology” / “أمراض القلب و الشرايين”).

---

## 6. Inference Behavior (End-to-End)

For a new input question (e.g., symptoms):

1. **Input**  
   - User types a question/symptoms in Arabic in the web chat.

2. **Category Prediction**  
   - The backend calls `predict_specialty_and_meta()` on the loaded classifier.
   - Output includes:
     - `specialty` (mapped via `label_to_specialty.json`).
     - `severity_level` (e.g., low / medium / high).
     - `urgent` (True/False).
     - `confidence` score for the predicted category.

3. **Answer Retrieval**  
   - The question is also sent to the retrieval index.
   - The system retrieves the closest Q&A pair from `qa_database.csv`.
   - Returns:
     - Suggested answer text.
     - Answer confidence (similarity score).

4. **Final Response to User**  
   - Chat message combines:
     - Suggested specialty.
     - Severity and urgency.
     - Short explanation and disclaimer.
     - Optional retrieved answer.

Example (from test run):

- Input: question about thyroid being overactive/underactive.  
- Predicted category: **أمراض الغدد الصماء**.  
- Confidence ≈ **95.76%**.  
- Severity: **medium**, urgent = **False**.  
- Answer: retrieved from dataset with high similarity (≈100% confidence).

---

## 7. System Integration

### 7.1 Backend Integration

- Copy generated `models/` directory into the backend’s `models/` folder.
- On backend startup:
  - Load `triage_text_classifier.joblib`.
  - Load `answer_retrieval_index.joblib`.
  - Load `qa_database.csv`.
  - Load `label_to_specialty.json`.
- Expose a service function, e.g. in `triage.py`:
  - `predict_specialty_and_meta(question_text: str) -> dict`
  - `retrieve_best_answer(question_text: str) -> dict`
- Chat endpoint (`POST /chats/{id}/messages`) will:
  - Save user message.
  - Call prediction + retrieval.
  - Save assistant message with specialty, severity, urgency, and answer.

### 7.2 Frontend Integration

- React chat UI already calls the backend chat endpoint.
- The frontend reads the structured response and displays:
  - Assistant chat bubble with:
    - Recommended specialty.
    - Severity / urgency.
    - Friendly explanation.
    - Optional “Suggested answer” section.
- Non-technical user just interacts through chat; they never see technical details.

---

## 8. Product Perspective

- The project is no longer just a training script or a notebook:
  - It is a **full product**:
    - Web interface.
    - Backend API.
    - Trained AI model + retrieval system.
  - Designed for non-technical users (patients and doctors) to use directly.
- Codebase is refactored into clear layers:
  - `frontend/` – UI and user experience.
  - `backend/` – API, auth, chat, uploads, triage service.
  - `models/` – training script outputs ready for deployment.
- This structure makes it easier to:
  - Maintain and extend the system.
  - Improve the model later (e.g., better Arabic NLP).
  - Add mobile app or further clinical integrations in the future.

