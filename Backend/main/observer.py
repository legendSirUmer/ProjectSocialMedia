from django.apps import apps
from django.db import connection
from django.db.models.signals import post_save
from django.dispatch import receiver
from threading import Timer
from collections import deque
from threading import Thread
import time

class Observer:
    def update(self, user, post):
        # Use the stored procedure to create a notification for the user
        with connection.cursor() as cursor:
            cursor.execute(
                "EXEC CreateNotification @user_id=%s, @message=%s, @created_at=%s",
                [user.id, f"Your friend {post.user} uploaded a new post!", post.created_at]
            )

class PostSubject:
    def __init__(self):
        self.observers = []

    def attach(self, observer):
        self.observers.append(observer)

    def notify(self, user, post):
        for observer in self.observers:
            observer.update(user, post)

post_subject = PostSubject()
post_observer = Observer()
post_subject.attach(post_observer)

# Add these functions back for signal registration in AppConfig.ready

def schedule_product_deletion(sender, instance, created, **kwargs):
    if created:
        def enqueue_instance():
            product_deletion_queue.append(instance)
        Timer(20 * 24 * 60 * 60, enqueue_instance).start()

def schedule_story_deletion(sender, instance, created, **kwargs):
    if created:
        def enqueue_instance():
            story_deletion_queue.append(instance)
        Timer(24 * 60 * 60, enqueue_instance).start()

product_deletion_queue = deque()
story_deletion_queue = deque()

# Round Robin worker for product deletion
def product_deletion_worker():
    while True:
        if product_deletion_queue:
            instance = product_deletion_queue.popleft()
            time.sleep(1)  # Simulate time slice for round robin
            instance.delete()
        else:
            time.sleep(1)

Thread(target=product_deletion_worker, daemon=True).start()

def story_deletion_worker():
    while True:
        if story_deletion_queue:
            instance = story_deletion_queue.popleft()
            time.sleep(1)  # Simulate time slice for round robin
            instance.delete()
        else:
            time.sleep(1)

Thread(target=story_deletion_worker, daemon=True).start()

@receiver(post_save, sender=None)
def notify_friends_on_post(sender, instance, created, **kwargs):
    # Dynamically get models to avoid circular import
    Post = apps.get_model('main', 'Post')
    FollowersCount = apps.get_model('main', 'FollowersCount')
    if sender == Post and created:
        followers = FollowersCount.objects.filter(user__username=instance.user)
        for follower in followers:
            post_subject.notify(follower.follower, instance)
