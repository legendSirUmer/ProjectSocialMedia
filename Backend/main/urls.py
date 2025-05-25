# basic URL Configurations
from django.urls import include, path
# import routers
from rest_framework import routers
# import everything from views
from .views import *
from . import views


# define the router
router = routers.DefaultRouter()

# define the router path and viewset to be used
#router.register(r'Posts', PostViewSet)
#router.register(r'Posts', RawQueryAPIView)
# specify URL Path for rest_framework
urlpatterns = [
    
    path('allposts/', PostAPIView.as_view(), name='Post-api'),
    path('createpost/',CreatePostAPIView.as_view(), name='CreatePost-api'),
    path('register/', register_user, name='Register-api'),
    path('login/', login_user, name='login-api'),
    path('api-auth/', include('rest_framework.urls')),
    path('follow_user/', follow_user, name='FollowUser-api'),
    path('unfollow_user/', unfollow_user, name='UnfollowUser-api'),
    path('create_post/',create_post, name='Create_Post-api'),
    path('add_product/', add_product, name='AddProduct-api'),
    path('update_profile/', update_profile, name='UpdateProfile-api'),
    path('create-postobject/', create_post_object, name='CreatePostObject-api'),
    path('suggested-users/', views.suggested_users, name='suggested_users'),
    path('create_story/', views.create_story, name='create_story'),
    path('upload_short/', upload_short, name='upload_short'),
    path('get_all_shorts/', get_all_shorts, name='get_all_shorts'),
]