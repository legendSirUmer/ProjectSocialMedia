from django.shortcuts import render
# import viewsets
from rest_framework import viewsets
# import local data

from django.contrib.auth.hashers import make_password,check_password
from .models import Post, Product,Profile 

from rest_framework import authentication, permissions
from django.contrib.auth.models import User
from django.db import connection
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view
from django.views.decorators.csrf import csrf_exempt


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
        raw_query_check = "SELECT * FROM main_followerscount WHERE user = %s AND follower = %s"
        params_check = [user, follower]

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
        raw_query_check = "SELECT * FROM main_followerscount WHERE user = %s AND follower = %s"
        params_check = [user, follower]

        with connection.cursor() as cursor:
            cursor.execute(raw_query_check, params_check)
            if not cursor.fetchone():
                return Response(
                    {"message": "You are not following this user."},
                    status=status.HTTP_200_OK
                )

        # Delete the follow relationship from the table
        raw_query_delete = "DELETE FROM main_followerscount WHERE user = %s AND follower = %s"
        params_delete = [user, follower]

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






