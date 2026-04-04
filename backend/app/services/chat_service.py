# backend/app/services/chat_service.py
from sqlalchemy.orm import Session
from app.models import ChatMessage, User
from typing import List

class ChatService:
    @staticmethod
    def mark_as_read(message_id: int, db: Session):
        message = db.query(ChatMessage).filter(ChatMessage.id == message_id).first()
        if message:
            message.is_read = True
            db.add(message)
            db.commit()
            db.refresh(message)
        return message
    
    @staticmethod
    def get_unread_count(user_id: int, db: Session):
        count = db.query(ChatMessage).filter(
            (ChatMessage.receiver_id == user_id) & (ChatMessage.is_read == False)
        ).count()
        return count
    
    @staticmethod
    def get_all_unread_messages(user_id: int, db: Session):
        messages = db.query(ChatMessage).filter(
            (ChatMessage.receiver_id == user_id) & (ChatMessage.is_read == False)
        ).all()
        return messages