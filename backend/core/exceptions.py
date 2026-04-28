"""
Custom exception handler for consistent error responses across the API.
"""
import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    request = context.get('request')

    # Build minimal log info
    user_id = request.user.id if request and request.user.is_authenticated else 'anonymous'
    status_code = response.status_code if response is not None else 500
    path = request.path if request else 'unknown'

    if response is not None:
        if response.status_code == status.HTTP_400_BAD_REQUEST:
            custom_response_data = {
                "error": "Validation error",
                "status": response.status_code,
                "detail": response.data,
            }
        else:
            custom_response_data = {
                "error": response.data if isinstance(response.data, str) else response.data.get('detail', 'An error occurred'),
                "status": response.status_code,
            }
        response.data = custom_response_data
        logger.warning(f"API Error [status={status_code}] [user={user_id}] [path={path}]")
    else:
        logger.exception(f"Unhandled exception [user={user_id}] [path={path}]")
        response = Response(
            {
                "error": "Internal server error",
                "status": status.HTTP_500_INTERNAL_SERVER_ERROR,
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return response