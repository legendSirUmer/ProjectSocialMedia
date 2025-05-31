import json
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
from django.utils import timezone
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Backend.settings')
django.setup()
from .models import ChatMessage

class ChatConsumer(WebsocketConsumer):
    def connect(self):
        self.room_group_name = 'test'

        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )

        self.accept()
   

    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        username = text_data_json.get('username') or (self.scope['user'].username if hasattr(self.scope['user'], 'username') else 'User')

        # Save message to database
        ChatMessage.objects.create(username=username, message=message, timestamp=timezone.now())

        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type':'chat_message',
                'message':message,
                'username':username
            }
        )

    def chat_message(self, event):
        message = event['message']
        username = event.get('username', 'User')
        self.send(text_data=json.dumps({
            'type':'chat',
            'message':message,
            'username':username
        }))