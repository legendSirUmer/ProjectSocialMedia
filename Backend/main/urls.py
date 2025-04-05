
# basic URL Configurations
from django.urls import include, path
# import routers
from rest_framework import routers
# import everything from views
from .views import *
 
# define the router
router = routers.DefaultRouter()
 
# define the router path and viewset to be used
#router.register(r'Posts', PostViewSet)
#router.register(r'Posts', RawQueryAPIView)
# specify URL Path for rest_framework
urlpatterns = [
    
    path('allposts/', PostAPIView.as_view(), name='Post-api'),
    path('createpost/',CreatePostAPIView.as_view(), name='CreatePost-api'),
    
    path('api-auth/', include('rest_framework.urls'))
  
]