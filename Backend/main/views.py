from django.shortcuts import render
# import viewsets
from rest_framework import viewsets
# import local data

from django.contrib.auth.hashers import make_password,check_password
from .models import Post, Product,Profile ,Shorts

from rest_framework import authentication, permissions
from django.contrib.auth.models import User
from django.db import connection
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view
from django.views.decorators.csrf import csrf_exempt
from .spam_detecting_agent.agent import is_spam


# create a viewset


class PostAPIView(APIView):
    
    queryset = Post.objects.none()
    permission_classes = []
    def get(self, request):
        
        # Define your raw SQL query
        raw_query = "SELECT * FROM main_post"

        # Execute the query using the cursor
        with connection.cursor() as cursor:
            cursor.execute(raw_query)
            rows = cursor.fetchall()

        # Format the data as needed
        result = [{"id": row[0], "user": row[1], "img": row[2], "caption": row[3], "date": row[4], "likes": row[5]} for row in rows]  # Adjust column names
    
        # Return a JSON response
        return Response(result)



class CreatePostAPIView(APIView):
    permission_classes = []  # no Restriction
    
    def post(self, request):
        """
        Execute a raw SQL query (SAFELY) via POST request
        Expected payload:
        {
            "query": "SELECT * FROM auth_user WHERE id = %s",
            "params": [1]  # Optional parameters for safety
        }
        """
        try:
            query = request.data.get('query')
            params = request.data.get('params', [])
            
            if not query:
                return Response(
                    {"error": "Query parameter is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Basic query validation 
            if any(keyword in query.lower() for keyword in ['drop', 'truncate', 'alter', 'OR']):
                return Response(
                    {"error": "Potentially dangerous query detected"},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            with connection.cursor() as cursor:
                cursor.execute(query, params)  # SAFE: Parameterized query
                
                if query.strip().lower().startswith('select'):
                    # For SELECT queries, return results
                    columns = [col[0] for col in cursor.description]
                    rows = cursor.fetchall()
                    results = [dict(zip(columns, row)) for row in rows]
                    return Response(results, status=status.HTTP_200_OK)
                else:
                    # For INSERT/UPDATE/DELETE, return affected row count
                    return Response(
                        {
                            "message": "Query executed successfully",
                            "rows_affected": cursor.rowcount
                        },
                        status=status.HTTP_200_OK
                    )
                    
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )




@api_view(['POST'])
def register_user(request):
    """
    API to handle user registration.
    Expected payload:
    {
        "username": "example",
        "email": "example@example.com",
        "password": "password123",
        "gender": "male" or "female"
    }
    """
    try:
        username = request.data.get('firstname') + ' ' + request.data.get('lastname')
        print(username)
        firstname = request.data.get('firstname')
        lastname = request.data.get('lastname')
        email = request.data.get('email')
        password = request.data.get('password')
        password = make_password(password)

        value = check_password(123,password)
        print(value)
        #gender = request.data.get('gender')


        if not username or not email or not password:
            return Response(
                {"error": "All fields (username, email, password) are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(username=username).exists():
            return Response(
                {"error": "Username already exists."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(email=email).exists():
            return Response(
                {"error": "Email already exists."},
                status=status.HTTP_400_BAD_REQUEST
            )

    

        raw_query = "insert into dbo.auth_user(username,password,email,is_superuser,first_name,last_name,is_staff,is_active,date_joined) values (%s,%s,%s,%s,%s,%s,%s,%s,GETDATE())"
        if any(keyword in raw_query.lower() for keyword in ['drop', 'truncate', 'alter', 'OR']):
                return Response(
                    {"error": "Potentially dangerous query detected"},
                    status=status.HTTP_403_FORBIDDEN
                )
        params = [username, password, email, 0, firstname, lastname, 0, 1]

        with connection.cursor() as cursor:
            cursor.execute(raw_query, params)  # SAFE: Parameterized query
        

        return Response(
            {"message": "User registered successfully."},
            status=status.HTTP_201_CREATED
        )

    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )




@api_view(['POST'])
def login_user(request):
    """
    API to handle user login.
    Expected payload:
    {
    
        "email": "example@example.com",
        "password": "password123",
    
    }
    """
    try:
           
        email = request.data.get('email')
        password = request.data.get('password')
        # value = check_password(123,password)
        # print(value)
        #gender = request.data.get('gender')

        if not email or not password:
            return Response(
                {"error": "All fields ( email, password) are required."},
                status=status.HTTP_400_BAD_REQUEST
            )


        if User.objects.filter(email=email).exists():
            CurrUser = User.objects.get(email=email)
            
            CurrProfile = Profile.objects.get(user=CurrUser)
            if check_password(password, CurrUser.password):
                return Response(
                    {"message": "Login successful.","username": CurrUser.username , "email": CurrUser.email, "id": CurrUser.id,'profileimg': CurrProfile.profileimg.url,'bio': CurrProfile.bio,'location': CurrProfile.location},   
                    status=status.HTTP_200_OK
                )
            else:
                return Response(
                    {"error": "Invalid password."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(
                {"error": "Email incorrect."},
                status=status.HTTP_400_BAD_REQUEST
            )


    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@csrf_exempt
def follow_user(request):
    """
    API to handle user following.
    Expected payload:
    {
        "follower": "username1",  # Username of the user who is following
        "user": "username2"       # Username of the user being followed
    }
    """
    try:
        follower = request.data.get('follower')
        user = request.data.get('user')

        if not follower or not user:
            return Response(
                {"error": "Both follower and user are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if follower == user:
            return Response(
                {"error": "A user cannot follow themselves."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if the follow relationship already exists
        raw_query_check = "SELECT * FROM main_followerscount WHERE user_id = %s AND follower_id = %s"
        params_check = [follower,user]

        with connection.cursor() as cursor:
            cursor.execute(raw_query_check, params_check)
            if cursor.fetchone():
                return Response(
                    {"message": "You are already following this user."},
                    status=status.HTTP_200_OK
                )

        # Insert the follow relationship into the table
        raw_query_insert = "INSERT INTO main_followerscount VALUES (%s, %s)"
        params_insert = [user, follower]

        with connection.cursor() as cursor:
            cursor.execute(raw_query_insert, params_insert)

        return Response(
            {"message": "Followed the user successfully."},
            status=status.HTTP_201_CREATED
        )

    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@csrf_exempt
def unfollow_user(request):
    """
    API to handle unfollowing a user.
    Expected payload:
    {
        "follower": "username1",  # Username of the user who is unfollowing
        "user": "username2"       # Username of the user being unfollowed
    }
    """
    try:
        follower = request.data.get('follower')
        user = request.data.get('user')
        print(user,follower)

        if not follower or not user:
            return Response(
                {"error": "Both follower and user are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if follower == user:
            return Response(
                {"error": "A user cannot unfollow themselves."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if the follow relationship exists
        raw_query_check = "SELECT * FROM main_followerscount WHERE user_id = %s AND follower_id = %s"
        params_check = [ follower,user]

        with connection.cursor() as cursor:
            cursor.execute(raw_query_check, params_check)
            if not cursor.fetchone():
                return Response(
                    {"message": "You are not following this user."},
                    status=status.HTTP_200_OK
                )
        print(user,follower)
        # Delete the follow relationship from the table
        raw_query_delete = "DELETE FROM main_followerscount WHERE user_id = %s AND follower_id = %s"
        params_delete = [ follower,user]

        with connection.cursor() as cursor:
            cursor.execute(raw_query_delete, params_delete)

        return Response(
            {"message": "Unfollowed the user successfully."},
            status=status.HTTP_200_OK
        )

    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@csrf_exempt
def create_post(request):
    """
    API to create a new post.
    Expected payload:
    {
        "username": "example_user",
        "caption": "This is a sample caption",
        "image": "image_url_or_path"
    }
    """
    try:
        username = request.data.get('username')
        caption = request.data.get('caption')
        image = request.data.get('image')

        if is_spam(caption):
            return Response(
            {"error": "Caption detected as spam. Post not created."},
            status=status.HTTP_403_FORBIDDEN
        )

        if not username or not caption or not image:
            return Response(
                {"error": "All fields (username, caption, image) are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if the user exists
        if not User.objects.filter(username=username).exists():
            return Response(
                {"error": "User does not exist."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Insert the post into the database
        Post.objects.create(
            user=username,
            caption=caption,
            image=image
        )
        return Response(
            {"message": "Post created successfully."},
            status=status.HTTP_201_CREATED
        )

    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@csrf_exempt
def add_product(request):
    """
    API to add a new product.
    Expected payload:
    {
        "user_id": 1,
        "name": "Product Name",
        "price": 100.00,
        "category": "Mobiles",
        "description": "Product description",
        "image": "image_url_or_path"
    }
    """
    try:
        user_id = request.data.get('user_id')
        name = request.data.get('name')
        price = request.data.get('price')
        category = request.data.get('category')
        description = request.data.get('description', '')
        image = request.data.get('image', None)

        

        if not user_id or not name or not price or not category:
            return Response(
                {"error": "All fields (user_id, name, price, category) are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if the user exists
        if not User.objects.filter(id=user_id).exists():
            return Response(
                {"error": "User does not exist."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = User.objects.get(id=user_id)

        # Create the product
        Product.objects.create(
            User=user,
            name=name,
            price=price,
            category=category,
            description=description,
            image=image
        )

        return Response(
            {"message": "Product added successfully."},
            status=status.HTTP_201_CREATED
        )

    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@csrf_exempt
def update_profile(request):
    """
    API to update a user's profile.
    Expected payload:
    {
        "user_id": 1,
        "bio": "New bio text",
        "location": "New location",
        "profileimg": "profile_images/new-image.png"  # Optional
    }
    """
    try:
        user_id = request.data.get('user_id')
        bio = request.data.get('bio', None)
        location = request.data.get('location', None)
        profileimg = request.data.get('profileimg', None)

        if not user_id:
            return Response(
                {"error": "user_id is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not Profile.objects.filter(user_id=user_id).exists():
            return Response(
                {"error": "Profile does not exist for this user."},
                status=status.HTTP_404_NOT_FOUND
            )

        profile = Profile.objects.get(user_id=user_id)
        if bio is not None:
            profile.bio = bio
        if location is not None:
            profile.location = location
        if profileimg is not None:
            profile.profileimg = profileimg
        profile.save()

        return Response(
            {"message": "Profile updated successfully.",
             "profileimg": profile.profileimg.url,
             
             },
            status=status.HTTP_200_OK
        )
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@csrf_exempt
def create_post_object(request):
    """
    API to create a new Post object.
    Accepts multipart/form-data for image upload.
    Expected payload:
    {
        "username": "example_user",
        "caption": "This is a sample caption",
        "image": <uploaded file>
    }
    """
    try:
        username = request.POST.get('username')
        caption = request.POST.get('caption')
        image = request.FILES.get('image')

        if not username or not caption or not image:
            return Response(
                {"error": "All fields (username, caption, image) are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if the user exists
        if not User.objects.filter(username=username).exists():
            return Response(
                {"error": "User does not exist."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # SPAM CHECK
        if is_spam(caption):
            return Response(
                {"error": "Caption detected as spam. Post not allowed."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Create the post
        Post.objects.create(
            user=username,
            caption=caption,
            image=image
        )
        return Response(
            {"message": "Post created successfully."},
            status=status.HTTP_201_CREATED
        )
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
def suggested_users(request):
    """
    Returns a list of random user suggestions (excluding the current user if provided).
    Each user includes id, username, and profileimg (if exists).
    """
    import random
    from .models import Profile
    try:
        # Optionally exclude the current user from suggestions
        current_user_id = request.data.get('user_id')
        print(current_user_id)
        users_qs = Profile.objects.all()
        if current_user_id:
            users_qs = users_qs.exclude(user_id=current_user_id)
        users = list(users_qs)
        print(users)
        random.shuffle(users)
        suggestions = []
        for user in users[:5]:  # Limit to 5 suggestions
            suggestions.append({
                'id': user.user.id,
                'username': user.user.username,
                'profileimg': user.profileimg.url if user.profileimg else ''
            })
        return Response(suggestions, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@csrf_exempt
def create_story(request):
    """
    API to create a new Story object.
    Accepts multipart/form-data for image upload and text.
    Expected payload:
    {
        "user_id": 1,
        "image": <uploaded file>,
        "text": "Story text"
    }
    """
    try:
        user_id = request.POST.get('user_id')
        text = request.POST.get('text', '')
        image = request.FILES.get('image', None)

        if not user_id:
            return Response({"error": "user_id is required."}, status=status.HTTP_400_BAD_REQUEST)
        if not image and not text.strip():
            return Response({"error": "Please add an image or text for your story."}, status=status.HTTP_400_BAD_REQUEST)
        if not User.objects.filter(id=user_id).exists():
            return Response({"error": "User does not exist."}, status=status.HTTP_400_BAD_REQUEST)
        user = User.objects.get(id=user_id)
        from .models import Story
        story = Story.objects.create(user=user, image=image, text=text)
        return Response({"message": "Story created successfully.", "story_id": story.id}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@csrf_exempt
def upload_short(request):
    """
    API to upload a new short video.
    Accepts multipart/form-data for video upload.
    Expected payload:
    {
        "user_id": <user_id>,
        "title": "Short Title",
        "description": "Description (optional)",
        "video": <uploaded file>
    }
    """
    try:
        user_id = request.POST.get('user_id')
        title = request.POST.get('title')
        description = request.POST.get('description', '')
        video = request.FILES.get('video')

        if not user_id or not title or not video:
            return Response({"error": "user_id, title, and video are required."}, status=status.HTTP_400_BAD_REQUEST)
        if not User.objects.filter(id=user_id).exists():
            return Response({"error": "User does not exist."}, status=status.HTTP_400_BAD_REQUEST)
        user = User.objects.get(id=user_id)
        short = Shorts.objects.create(user=user, title=title, description=description, video=video)
        return Response({"message": "Short uploaded successfully.", "short_id": short.id}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_all_shorts(request):
    """
    API to get all shorts (most recent first) using a raw SQL query.
    Returns a list of shorts with user, title, description, video URL, and created_at.
    """
    try:
        with connection.cursor() as cursor:
            cursor.execute('''
                SELECT s.id, u.username, s.title, s.description, s.video, s.created_at
                FROM main_shorts s
                JOIN auth_user u ON s.user_id = u.id
                ORDER BY s.created_at DESC
            ''')
            rows = cursor.fetchall()
            data = [
                {
                    'id': row[0],
                    'user': row[1],
                    'title': row[2],
                    'description': row[3],
                    'video': request.build_absolute_uri('/media/' + row[4]) if row[4] else '',
                    'created_at': row[5],
                }
                for row in rows
            ]
        return Response(data, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)






