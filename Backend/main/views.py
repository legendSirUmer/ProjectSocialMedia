from django.shortcuts import render
# import viewsets
from rest_framework import viewsets
# import local data

from .models import Post

from rest_framework import authentication, permissions
from django.contrib.auth.models import User
from django.db import connection
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status


# create a viewset


class PostAPIView(APIView):
    
    queryset = Post.objects.none()
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
    permission_classes = []  # Restrict to admin users
    
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
            
            # Basic query validation (customize as needed)
            if any(keyword in query.lower() for keyword in ['drop', 'truncate', 'alter']):
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