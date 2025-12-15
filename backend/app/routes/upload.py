"""
Upload routes: handle file uploads for prescriptions and test results.
"""

import os
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.models import User, Prescription, TestResult
from app.schemas import PrescriptionResponse, TestResultResponse
from app.dependencies import get_current_user
from app.config import settings

router = APIRouter(prefix="/uploads", tags=["uploads"])


# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(os.path.join(settings.UPLOAD_DIR, "prescriptions"), exist_ok=True)
os.makedirs(os.path.join(settings.UPLOAD_DIR, "test_results"), exist_ok=True)


@router.post("/prescription", response_model=PrescriptionResponse, status_code=status.HTTP_201_CREATED)
def upload_prescription(
    file: UploadFile = File(...),
    chat_id: Optional[int] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload a prescription image file.
    
    Args:
        chat_id: Optional chat ID to link the prescription to
        file: Image file to upload
        current_user: Authenticated user
        db: Database session
        
    Returns:
        Created prescription record
        
    Raises:
        HTTPException: If file is invalid or chat doesn't exist
    """
    # Validate file type (basic check - can be enhanced)
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )
    
    # Verify chat exists and belongs to user (if chat_id provided)
    if chat_id:
        from app.models import Chat
        chat = db.query(Chat).filter(Chat.id == chat_id, Chat.user_id == current_user.id).first()
        if not chat:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat not found or not authorized"
            )
    
    # Generate unique filename
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    file_extension = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
    filename = f"prescription_{current_user.id}_{timestamp}{file_extension}"
    file_path = os.path.join(settings.UPLOAD_DIR, "prescriptions", filename)
    
    # Save file
    with open(file_path, "wb") as buffer:
        content = file.file.read()
        buffer.write(content)
    
    # Create database record
    prescription = Prescription(
        user_id=current_user.id,
        chat_id=chat_id,
        image_path=file_path
    )
    
    db.add(prescription)
    db.commit()
    db.refresh(prescription)
    
    return prescription


@router.post("/test-result", response_model=TestResultResponse, status_code=status.HTTP_201_CREATED)
def upload_test_result(
    file: Optional[UploadFile] = File(None),
    raw_text: Optional[str] = Form(None),
    chat_id: Optional[int] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload a test result (as text or file).
    For now, generates a dummy summary. In production, this would call an AI service.
    
    Args:
        chat_id: Optional chat ID to link the test result to
        file: Optional file to upload
        raw_text: Optional text content (if not uploading file)
        current_user: Authenticated user
        db: Database session
        
    Returns:
        Created test result record
        
    Raises:
        HTTPException: If neither file nor text provided, or chat doesn't exist
    """
    # Verify chat exists and belongs to user (if chat_id provided)
    if chat_id:
        from app.models import Chat
        chat = db.query(Chat).filter(Chat.id == chat_id, Chat.user_id == current_user.id).first()
        if not chat:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat not found or not authorized"
            )
    
    # Get content (from file or text)
    content_text = None
    file_path = None
    
    if file:
        # Save file
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        file_extension = os.path.splitext(file.filename)[1] if file.filename else ".txt"
        filename = f"test_result_{current_user.id}_{timestamp}{file_extension}"
        file_path = os.path.join(settings.UPLOAD_DIR, "test_results", filename)
        
        with open(file_path, "wb") as buffer:
            content = file.file.read()
            buffer.write(content)
        
        # If it's a text file, read it
        if file.content_type and "text" in file.content_type:
            with open(file_path, "r") as f:
                content_text = f.read()
        else:
            content_text = f"File uploaded: {filename}"
    
    elif raw_text:
        content_text = raw_text
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either file or raw_text must be provided"
        )
    
    # Generate summary (PLACEHOLDER - replace with AI service)
    # TODO: Call AI service to generate summary from content_text
    summary_text = f"Summary: This is a placeholder summary. In production, an AI service would analyze the test results and provide a detailed summary. Original content length: {len(content_text)} characters."
    
    # Create database record
    test_result = TestResult(
        user_id=current_user.id,
        chat_id=chat_id,
        raw_text=content_text if not file_path else file_path,
        summary_text=summary_text
    )
    
    db.add(test_result)
    db.commit()
    db.refresh(test_result)
    
    return test_result

