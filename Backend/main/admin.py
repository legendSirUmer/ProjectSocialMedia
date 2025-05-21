from django.contrib import admin
from .models import Profile, Post, LikePost, FollowersCount, Product, Story 

admin.site.register(Profile)
admin.site.register(Post)
admin.site.register(LikePost)
admin.site.register(FollowersCount)
admin.site.register(Product)
admin.site.register(Story)
admin.site.site_header = "Social Media App Admin"

# Register your models here.
