import redis
import json
from typing import List, Dict, Optional
import uuid
from openai import OpenAI
import os


class ChatManager:
    def __init__(self):
        self.redis_client = redis.Redis(
            host=os.getenv("REDIS_HOST", "localhost"),
            port=int(os.getenv("REDIS_PORT", 6379)),
            decode_responses=True,
        )
        self.openai_client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
        self.session_timeout = 3600 * 24  # 24 hours

    def create_session(self) -> str:
        """Create a new chat session"""
        session_id = str(uuid.uuid4())
        self.redis_client.hset(f"session:{session_id}", "messages", "[]")
        self.redis_client.expire(f"session:{session_id}", self.session_timeout)
        return session_id

    def get_messages(self, session_id: str) -> List[Dict]:
        """Get messages for a session"""
        messages_str = self.redis_client.hget(f"session:{session_id}", "messages")
        if messages_str:
            return json.loads(messages_str)
        return []

    def add_message(self, session_id: str, role: str, content: str) -> None:
        """Add a message to the session"""
        messages = self.get_messages(session_id)
        messages.append({"role": role, "content": content})
        self.redis_client.hset(
            f"session:{session_id}", "messages", json.dumps(messages)
        )
        self.redis_client.expire(f"session:{session_id}", self.session_timeout)

    async def process_message(self, session_id: str, message: str) -> str:
        """Process a message and get AI response"""
        try:
            # Add user message
            self.add_message(session_id, "user", message)

            # Get full conversation history
            messages = self.get_messages(session_id)

            # Get AI response
            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=messages,
                temperature=0.7,
            )

            # Add AI response to history
            ai_message = response.choices[0].message.content
            self.add_message(session_id, "assistant", ai_message)

            return ai_message
        except Exception as e:
            raise Exception(f"Failed to process message: {str(e)}")

    def session_exists(self, session_id: str) -> bool:
        """Check if a session exists"""
        return bool(self.redis_client.exists(f"session:{session_id}"))
