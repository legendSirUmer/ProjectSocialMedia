from django.db import models
from django.contrib.auth import get_user_model
import uuid
from datetime import datetime
from django.utils.timezone import now
from django.db.models.signals import post_save
from django.dispatch import receiver
from threading import Timer

User = get_user_model()

# Create your models here.
class Profile(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    bio = models.TextField(blank=True)
    profileimg = models.ImageField(upload_to='profile_images', default='blank-profile-picture.png')
    location = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return self.user.username

class Post(models.Model):
    user = models.CharField(max_length=100)
    image = models.ImageField(upload_to='post_images')
    caption = models.TextField()
    created_at = models.DateTimeField(default=datetime.now)
    no_of_likes = models.IntegerField(default=0)

    def __str__(self):
        return self.user

class LikePost(models.Model):
    post_id = models.CharField(max_length=500)
    username = models.CharField(max_length=100)

    def __str__(self):
        return self.username

class FollowersCount(models.Model):
    follower = models.ForeignKey(User,on_delete=models.CASCADE, related_name='follower')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='following')

    def __str__(self):
        return self.user

class Product(models.Model):
    CATEGORY_CHOICES = [
        ("Mobiles", "Mobiles"),
        ("Vehicles", "Vehicles"),
        ("Property For Sale", "Property For Sale"),
        ("Property For Rent", "Property For Rent"),
        ("Electronics & Home Appliances", "Electronics & Home Appliances"),
        ("Bikes", "Bikes"),
        ("Business, Industrial & Agriculture", "Business, Industrial & Agriculture"),
        ("Animals", "Animals"),
        ("Furniture & Home Decor", "Furniture & Home Decor"),
        ("Fashion & Beauty", "Fashion & Beauty"),
        ("Books, Sports & Hobbies", "Books, Sports & Hobbies"),
        ("Kids", "Kids"),
        ("Services", "Services"),
        ("Jobs", "Jobs"),
    ]
    User = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    description = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='product_images', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

@receiver(post_save, sender=Product)
def schedule_product_deletion(sender, instance, created, **kwargs):
    if created:
        def delete_instance():
            instance.delete()
        Timer(20 * 24 * 60 * 60, delete_instance).start()