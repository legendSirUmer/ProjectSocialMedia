from django.db import models

# Create your models here.
class ChatMessage(models.Model):
    
    username = models.CharField(max_length=100)
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender} to {self.receiver}: {self.message[:20]}..."