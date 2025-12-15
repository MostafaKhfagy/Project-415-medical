"""
Triage service - integrates the trained scikit-learn text classifier with answer retrieval.

The model and data files should be placed in `backend/models/`:
- models/triage_text_classifier.joblib
- models/label_to_specialty.json
- models/answer_retrieval_index.joblib
- models/qa_database.csv
"""

from functools import lru_cache
import json
from pathlib import Path
from typing import List, Optional, Tuple, Dict, Any

import joblib
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.schemas import TriageResult

# Base paths for the saved models and data
BASE_DIR = Path(__file__).resolve().parents[2]
MODEL_PATH = BASE_DIR / "models" / "triage_text_classifier.joblib"
LABEL_MAPPING_PATH = BASE_DIR / "models" / "label_to_specialty.json"
ANSWER_RETRIEVAL_PATH = BASE_DIR / "models" / "answer_retrieval_index.joblib"
QA_DATABASE_PATH = BASE_DIR / "models" / "qa_database.csv"

# Answer retrieval settings
TOP_K_ANSWERS = 1  # Number of answers to retrieve
MIN_SIMILARITY_THRESHOLD = 0.1  # Minimum similarity score


@lru_cache(maxsize=1)
def _load_model_and_mapping() -> Tuple[Any, Dict[str, Any]]:
    """
    Load and cache the trained triage model and label mapping.
    The cache keeps the model in memory so we only hit disk once.
    """
    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Model file not found at {MODEL_PATH}. "
            "Please copy triage_text_classifier.joblib to backend/models/."
        )

    model = joblib.load(MODEL_PATH)

    if LABEL_MAPPING_PATH.exists():
        with open(LABEL_MAPPING_PATH, "r", encoding="utf-8") as f:
            label_mapping = json.load(f)
    else:
        label_mapping = {"label_to_specialty": {}}

    return model, label_mapping


@lru_cache(maxsize=1)
def _load_answer_retrieval_system() -> Tuple[TfidfVectorizer, np.ndarray, pd.DataFrame]:
    """
    Load and cache the answer retrieval system.
    Returns tuple of (vectorizer, question_vectors, qa_database).
    """
    if not ANSWER_RETRIEVAL_PATH.exists():
        raise FileNotFoundError(
            f"Answer retrieval index not found at {ANSWER_RETRIEVAL_PATH}. "
            "Please copy answer_retrieval_index.joblib to backend/models/."
        )

    if not QA_DATABASE_PATH.exists():
        raise FileNotFoundError(
            f"Q&A database not found at {QA_DATABASE_PATH}. "
            "Please copy qa_database.csv to backend/models/."
        )

    # Load retrieval components
    retrieval_data = joblib.load(ANSWER_RETRIEVAL_PATH)
    vectorizer = retrieval_data['vectorizer']
    question_vectors = retrieval_data['question_vectors']

    # Load Q&A database
    qa_database = pd.read_csv(QA_DATABASE_PATH, encoding='utf-8')

    return vectorizer, question_vectors, qa_database


def _retrieve_answers(
    query_question: str,
    vectorizer: TfidfVectorizer,
    question_vectors: np.ndarray,
    qa_database: pd.DataFrame,
    predicted_category: Optional[str] = None,
    top_k: int = TOP_K_ANSWERS,
    min_similarity: float = MIN_SIMILARITY_THRESHOLD
) -> List[Dict[str, Any]]:
    """
    Retrieve most relevant answers for a given question.
    
    Args:
        query_question: The user's question
        vectorizer: Fitted TF-IDF vectorizer
        question_vectors: Pre-computed question vectors
        qa_database: Database of Q&A pairs
        predicted_category: Optional category to filter results
        top_k: Number of answers to retrieve
        min_similarity: Minimum similarity threshold
        
    Returns:
        List of dictionaries containing answers and metadata
    """
    # Vectorize the query question
    query_vector = vectorizer.transform([query_question])
    
    # Calculate cosine similarity with all questions
    similarities = cosine_similarity(query_vector, question_vectors)[0]
    
    # Get indices of top-k most similar questions
    top_indices = np.argsort(similarities)[::-1][:top_k * 3]  # Get extra candidates
    
    # Filter by category if provided
    results = []
    for idx in top_indices:
        if len(results) >= top_k:
            break
            
        similarity_score = float(similarities[idx])
        
        # Skip if similarity too low
        if similarity_score < min_similarity:
            continue
        
        # Get Q&A pair
        qa_row = qa_database.iloc[idx]
        
        # Filter by category if specified
        if predicted_category and qa_row['category'] != predicted_category:
            continue
        
        results.append({
            'question': qa_row['question'],
            'answer': qa_row['answer'],
            'category': qa_row['category'],
            'similarity': similarity_score
        })
    
    return results


def _predict_specialty_and_meta(symptoms: str, include_answer: bool = True) -> Dict[str, Any]:
    """
    Run the ML pipeline and derive specialty, severity, urgency, confidence, and answer.
    
    Args:
        symptoms: User's symptom/question text
        include_answer: Whether to retrieve and include answer
        
    Returns:
        Dictionary with specialty, severity, urgency, confidence, and optionally answer
    """
    model, label_mapping = _load_model_and_mapping()
    label_to_specialty = label_mapping.get("label_to_specialty", {})

    # Predict category
    predicted_label = model.predict([symptoms])[0]

    # Get confidence score
    try:
        probabilities = model.predict_proba([symptoms])[0]
        label_index = list(model.classes_).index(predicted_label)
        confidence = float(probabilities[label_index])
    except AttributeError:
        try:
            decision_scores = model.decision_function([symptoms])[0]
            if decision_scores.ndim > 0:
                confidence = float(1.0 / (1.0 + np.exp(-decision_scores[list(model.classes_).index(predicted_label)])))
            else:
                confidence = 0.5
        except:
            confidence = 0.5

    # Map to specialty name
    specialty = label_to_specialty.get(str(predicted_label), str(predicted_label))

    # Determine severity and urgency (rule-based)
    question_lower = symptoms.lower()
    
    high_severity_keywords = [
        "ألم صدر", "نوبة قلبية", "صعوبة تنفس", "ألم شديد",
        "فقدان وعي", "نزيف شديد", "سكتة", "جلطة", "سكتة دماغية"
    ]
    
    medium_severity_keywords = [
        "حمى", "سعال", "ألم بطن", "صداع", "غثيان", "إسهال", "قيء"
    ]
    
    if any(keyword in question_lower for keyword in high_severity_keywords):
        severity_level = "high"
        urgent = True
    elif any(keyword in question_lower for keyword in medium_severity_keywords):
        severity_level = "medium"
        urgent = False
    else:
        severity_level = "medium"
        urgent = False

    # Build response
    result = {
        "specialty": specialty,
        "severity_level": severity_level,
        "urgent": urgent,
        "model_label": str(predicted_label),
        "confidence": confidence
    }
    
    # Retrieve answer if requested
    if include_answer:
        try:
            vectorizer, question_vectors, qa_database = _load_answer_retrieval_system()
            answers = _retrieve_answers(
                symptoms,
                vectorizer,
                question_vectors,
                qa_database,
                predicted_category=str(predicted_label),
                top_k=TOP_K_ANSWERS
            )
            
            if answers:
                result["answer"] = answers[0]["answer"]
                result["answer_confidence"] = answers[0]["similarity"]
            else:
                result["answer"] = "عذراً، لم أتمكن من إيجاد إجابة مناسبة. يرجى استشارة طبيب متخصص."
                result["answer_confidence"] = 0.0
                
        except Exception as e:
            print(f"Warning: Could not retrieve answer: {e}")
            result["answer"] = "عذراً، حدث خطأ في استرجاع الإجابة."
            result["answer_confidence"] = 0.0
    
    return result


def _build_explanation(result: Dict[str, Any]) -> str:
    """Create a short explanation string for the chat reply."""
    confidence_pct = f"{result.get('confidence', 0.0) * 100:.2f}%"
    return (
        f"التصنيف الآلي يقترح التخصص: {result['specialty']} "
        f"بثقة تقريبية {confidence_pct}. "
        f"تم تقدير مستوى الخطورة: {result['severity_level']} "
        f"{'ويُنصح بالتعامل بشكل عاجل' if result['urgent'] else 'ويمكن المتابعة مع طبيب مختص'}."
    )


def run_triage_model(symptoms: str, history: Optional[List[dict]] = None) -> TriageResult:
    """
    Run the trained triage model on the provided symptoms text.

    Args:
        symptoms: User's symptom description (text).
        history: Optional conversation history (not used by the current model).

    Returns:
        TriageResult with specialty, severity, urgency, explanation, answer, and answer_confidence.
    """
    if not symptoms or not symptoms.strip():
        raise ValueError("Symptoms text is required for triage.")

    result = _predict_specialty_and_meta(symptoms.strip(), include_answer=True)
    explanation = _build_explanation(result)

    return TriageResult(
        specialty=result["specialty"],
        severity_level=result["severity_level"],
        urgent=result["urgent"],
        explanation=explanation,
        confidence=result.get("confidence", 0.0),
        answer=result.get("answer", ""),
        answer_confidence=result.get("answer_confidence", 0.0),
    )
