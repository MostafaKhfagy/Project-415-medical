"""
Chat routes: manage chat sessions and messages.
All endpoints require authentication.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.database import get_db
from app.models import User, Chat, Message
from app.schemas import (
    ChatCreate, ChatResponse, ChatWithMessagesResponse,
    MessageCreate, MessageResponse
)
from app.dependencies import get_current_user
from app.services.triage import run_triage_model

router = APIRouter(prefix="/chats", tags=["chats"])


@router.get("", response_model=List[ChatResponse])
def get_user_chats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all chats for the current authenticated user.
    Returns list of chats with id, title, and timestamps.
    
    Args:
        current_user: Authenticated user (from dependency)
        db: Database session
        
    Returns:
        List of user's chats
    """
    chats = db.query(Chat).filter(Chat.user_id == current_user.id).order_by(Chat.updated_at.desc()).all()
    return chats


@router.post("", response_model=ChatResponse, status_code=status.HTTP_201_CREATED)
def create_chat(
    chat_data: ChatCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new chat session for the current user.
    
    Args:
        chat_data: Chat creation data (optional title)
        current_user: Authenticated user
        db: Database session
        
    Returns:
        Created chat object
    """
    new_chat = Chat(
        user_id=current_user.id,
        title=chat_data.title
    )
    db.add(new_chat)
    db.commit()
    db.refresh(new_chat)
    return new_chat


@router.get("/{chat_id}", response_model=ChatWithMessagesResponse)
def get_chat(
    chat_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific chat with all its messages.
    Only the chat owner can access it.
    
    Args:
        chat_id: ID of the chat to retrieve
        current_user: Authenticated user
        db: Database session
        
    Returns:
        Chat object with all messages
        
    Raises:
        HTTPException: If chat not found or user doesn't own it
    """
    chat = db.query(Chat).filter(Chat.id == chat_id).first()
    
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found"
        )
    
    # Ensure user owns this chat
    if chat.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this chat"
        )
    
    return chat


@router.post("/{chat_id}/messages", response_model=List[MessageResponse])
def create_message(
    chat_id: int,
    message_data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new message in a chat and get AI triage response.
    
    Process:
    1. Save user message to database
    2. Get chat history for context
    3. Run triage logic (placeholder AI)
    4. Save assistant response
    5. Return all messages in the chat
    
    Args:
        chat_id: ID of the chat
        message_data: Message content and optional extra info
        current_user: Authenticated user
        db: Database session
        
    Returns:
        List of all messages in the chat (including new ones)
        
    Raises:
        HTTPException: If chat not found or user doesn't own it
    """
    # Verify chat exists and user owns it
    chat = db.query(Chat).filter(Chat.id == chat_id).first()
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found"
        )
    
    if chat.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this chat"
        )
    
    # Save user message
    user_message = Message(
        chat_id=chat_id,
        sender="user",
        text=message_data.message
    )
    db.add(user_message)
    db.flush()  # Flush to get message ID, but don't commit yet
    
    # Get chat history for context (last 10 messages)
    previous_messages = db.query(Message).filter(
        Message.chat_id == chat_id
    ).order_by(Message.timestamp.desc()).limit(10).all()
    
    # Prepare history for triage service
    history = [
        {"sender": msg.sender, "text": msg.text, "timestamp": msg.timestamp.isoformat()}
        for msg in reversed(previous_messages)  # Reverse to get chronological order
    ]
    
    # Run triage logic with answer retrieval
    triage_result = run_triage_model(message_data.message, history)
    
    # Format assistant response with answer (matching the training script output format)
    confidence_pct = f"{triage_result.confidence * 100:.2f}%" if triage_result.confidence else "N/A"
    answer_confidence_pct = f"{triage_result.answer_confidence * 100:.2f}%" if triage_result.answer_confidence else "0.00%"
    
    assistant_response = (
        f"**التخصص المقترح:** {triage_result.specialty}\n"
        f"**مستوى الثقة:** {confidence_pct}\n"
        f"**مستوى الشدة:** {triage_result.severity_level}\n"
        f"**هل هو عاجل؟:** {'نعم' if triage_result.urgent else 'لا'}\n\n"
    )
    
    # Add answer if available
    if triage_result.answer:
        assistant_response += (
            f"**الإجابة:**\n{triage_result.answer}\n\n"
            f"**مستوى ثقة الإجابة:** {answer_confidence_pct}\n\n"
        )
    
    assistant_response += f"**{triage_result.disclaimer}**"

    # Save assistant message
    assistant_message = Message(
        chat_id=chat_id, 
        sender="assistant",
        text=assistant_response
    )
    db.add(assistant_message)
    
    # Update chat's updated_at timestamp
    chat.updated_at = datetime.utcnow()
    
    # Commit all changes
    db.commit()
    
    # Refresh messages to get all data
    db.refresh(user_message)
    db.refresh(assistant_message)
    
    # Return all messages in the chat
    last_messages = db.query(Message).filter(
        Message.chat_id == chat_id
    ).order_by(Message.timestamp.desc()).first()
    
    return [last_messages]

@router.delete("/{chat_id}", status_code=200)
def delete_chat(
    chat_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a chat and all its messages.
    Only the owner of the chat can delete it.
    """
    # Get chat
    chat = db.query(Chat).filter(Chat.id == chat_id).first()

    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found"
        )
    
    # Ensure user owns chat
    if chat.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this chat"
        )
    
    # Delete messages first (if cascade not set in DB model)
    db.query(Message).filter(Message.chat_id == chat_id).delete()

    # Delete chat
    db.delete(chat)
    db.commit()

    return {"message": "Chat deleted successfully"}
