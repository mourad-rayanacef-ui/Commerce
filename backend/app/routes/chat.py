from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List
from ..database import get_db
from .. import models, schemas
from ..auth import get_current_active_user

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("/send", response_model=schemas.ChatMessageResponse)
async def send_message(
    msg_data: schemas.ChatMessageCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    # Verify receiver exists
    receiver = db.query(models.User).filter(models.User.id == msg_data.receiver_id).first()
    if not receiver:
        raise HTTPException(status_code=404, detail="Receiver not found")
    
    message = models.ChatMessage(
        sender_id=current_user.id,
        receiver_id=msg_data.receiver_id,
        message=msg_data.message,
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    return message


@router.get("/messages/{user_id}", response_model=List[schemas.ChatMessageResponse])
async def get_messages(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    messages = db.query(models.ChatMessage).filter(
        or_(
            and_(models.ChatMessage.sender_id == current_user.id, models.ChatMessage.receiver_id == user_id),
            and_(models.ChatMessage.sender_id == user_id, models.ChatMessage.receiver_id == current_user.id),
        )
    ).order_by(models.ChatMessage.created_at.asc()).all()
    
    # Mark messages as read
    for msg in messages:
        if msg.receiver_id == current_user.id and not msg.is_read:
            msg.is_read = True
    db.commit()
    
    return messages


@router.get("/conversations", response_model=List[schemas.ConversationResponse])
async def get_conversations(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    # Find all unique users this user has chatted with
    if current_user.role == "admin":
        # Admin sees all customer conversations
        customers = db.query(models.User).filter(models.User.role == "customer").all()
        result = []
        for customer in customers:
            # Check if there are messages
            last_msg = db.query(models.ChatMessage).filter(
                or_(
                    and_(models.ChatMessage.sender_id == customer.id, models.ChatMessage.receiver_id == current_user.id),
                    and_(models.ChatMessage.sender_id == current_user.id, models.ChatMessage.receiver_id == customer.id),
                )
            ).order_by(models.ChatMessage.created_at.desc()).first()
            
            unread_count = db.query(models.ChatMessage).filter(
                models.ChatMessage.sender_id == customer.id,
                models.ChatMessage.receiver_id == current_user.id,
                models.ChatMessage.is_read == False,
            ).count()
            
            result.append(schemas.ConversationResponse(
                user_id=customer.id,
                username=customer.username,
                full_name=customer.full_name,
                last_message=last_msg.message[:50] + "..." if last_msg and len(last_msg.message) > 50 else (last_msg.message if last_msg else None),
                unread_count=unread_count,
            ))
        return result
    else:
        # Customer sees their own conversation with admin
        admin = db.query(models.User).filter(models.User.role == "admin").first()
        if not admin:
            return []
        
        last_msg = db.query(models.ChatMessage).filter(
            or_(
                and_(models.ChatMessage.sender_id == current_user.id, models.ChatMessage.receiver_id == admin.id),
                and_(models.ChatMessage.sender_id == admin.id, models.ChatMessage.receiver_id == current_user.id),
            )
        ).order_by(models.ChatMessage.created_at.desc()).first()
        
        return [schemas.ConversationResponse(
            user_id=admin.id,
            username=admin.username,
            full_name=admin.full_name,
            last_message=last_msg.message if last_msg else None,
            unread_count=0,
        )]
