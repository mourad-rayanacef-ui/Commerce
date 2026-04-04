from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import ChatMessage, User
from app.schemas import ChatMessageCreate, ChatMessageResponse
from typing import List
from datetime import datetime

router = APIRouter(prefix="/api/chat", tags=["chat"])

# Send a message
@router.post("/send", response_model=ChatMessageResponse)
def send_message(
    message: ChatMessageCreate,
    sender_id: int,
    db: Session = Depends(get_db)
):
    """
    Send a message from sender_id to receiver_id
    """
    # Verify receiver exists
    receiver = db.query(User).filter(User.id == message.receiver_id).first()
    if not receiver:
        raise HTTPException(status_code=404, detail="Receiver not found")
    
    new_message = ChatMessage(
        sender_id=sender_id,
        receiver_id=message.receiver_id,
        message=message.message
    )
    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    return new_message


# Get all conversations for a user
@router.get("/conversations")
def get_conversations(user_id: int, db: Session = Depends(get_db)):
    """
    Get list of all conversations for a user with latest message info
    """
    # Get all messages where user is sender or receiver
    messages = db.query(ChatMessage).filter(
        (ChatMessage.sender_id == user_id) | (ChatMessage.receiver_id == user_id)
    ).order_by(ChatMessage.created_at.desc()).all()
    
    conversations = {}
    
    for msg in messages:
        # Determine the other user in conversation
        other_user_id = msg.receiver_id if msg.sender_id == user_id else msg.sender_id
        
        if other_user_id not in conversations:
            other_user = db.query(User).filter(User.id == other_user_id).first()
            if other_user:
                # Count unread messages from this user
                unread_count = db.query(ChatMessage).filter(
                    (ChatMessage.sender_id == other_user_id) &
                    (ChatMessage.receiver_id == user_id) &
                    (ChatMessage.is_read == False)
                ).count()
                
                conversations[other_user_id] = {
                    "user_id": other_user_id,
                    "username": other_user.username,
                    "full_name": other_user.full_name,
                    "role": other_user.role,
                    "last_message": msg.message,
                    "last_message_time": msg.created_at.isoformat(),
                    "unread_count": unread_count
                }
    
    return list(conversations.values())


# Get all messages between two users
@router.get("/messages/{other_user_id}", response_model=List[ChatMessageResponse])
def get_messages(
    user_id: int,
    other_user_id: int,
    skip: int = Query(0),
    limit: int = Query(50),
    db: Session = Depends(get_db)
):
    """
    Get conversation history between user_id and other_user_id
    """
    # Get all messages between the two users
    messages = db.query(ChatMessage).filter(
        ((ChatMessage.sender_id == user_id) & (ChatMessage.receiver_id == other_user_id)) |
        ((ChatMessage.sender_id == other_user_id) & (ChatMessage.receiver_id == user_id))
    ).order_by(ChatMessage.created_at.asc()).offset(skip).limit(limit).all()
    
    # Mark messages from other_user as read
    db.query(ChatMessage).filter(
        (ChatMessage.sender_id == other_user_id) &
        (ChatMessage.receiver_id == user_id) &
        (ChatMessage.is_read == False)
    ).update({ChatMessage.is_read: True})
    db.commit()
    
    return messages


# Mark message as read
@router.put("/messages/{message_id}/read")
def mark_as_read(message_id: int, db: Session = Depends(get_db)):
    """
    Mark a specific message as read
    """
    message = db.query(ChatMessage).filter(ChatMessage.id == message_id).first()
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    message.is_read = True
    db.add(message)
    db.commit()
    db.refresh(message)
    return {"status": "read", "message": message}


# Get unread message count
@router.get("/unread-count")
def get_unread_count(user_id: int, db: Session = Depends(get_db)):
    """
    Get total unread message count for user
    """
    unread_count = db.query(ChatMessage).filter(
        (ChatMessage.receiver_id == user_id) &
        (ChatMessage.is_read == False)
    ).count()
    
    return {"unread_count": unread_count}


# Get unread messages from specific user
@router.get("/unread/{other_user_id}")
def get_unread_from_user(
    user_id: int,
    other_user_id: int,
    db: Session = Depends(get_db)
):
    """
    Get count of unread messages from a specific user
    """
    unread_count = db.query(ChatMessage).filter(
        (ChatMessage.sender_id == other_user_id) &
        (ChatMessage.receiver_id == user_id) &
        (ChatMessage.is_read == False)
    ).count()
    
    return {"unread_count": unread_count}


# Delete a message
@router.delete("/messages/{message_id}")
def delete_message(message_id: int, user_id: int, db: Session = Depends(get_db)):
    """
    Delete a message (only if user is sender)
    """
    message = db.query(ChatMessage).filter(ChatMessage.id == message_id).first()
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    if message.sender_id != user_id:
        raise HTTPException(status_code=403, detail="Can only delete your own messages")
    
    db.delete(message)
    db.commit()
    return {"status": "deleted"}