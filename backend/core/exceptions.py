"""
Custom exception handler for consistent error responses across the API.
"""
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom exception handler that returns consistent error response format
    while preserving field-level validation details.
    """
    response = exception_handler(exc, context)

    if response is not None:
        # For validation errors (400), keep the field-specific details
        if response.status_code == status.HTTP_400_BAD_REQUEST:
            # DRF validation errors are typically a dict or list
            custom_response_data = {
                "error": "Validation error",
                "status": response.status_code,
                "detail": response.data,  # Preserve field-level errors
            }
        else:
            # For other errors (401, 403, 404, etc.), use the simple format
            custom_response_data = {
                "error": response.data if isinstance(response.data, str) else response.data.get('detail', 'An error occurred'),
                "status": response.status_code,
            }
        response.data = custom_response_data
        logger.warning(f"API Error [{response.status_code}]: {custom_response_data['error']}")
    else:
        # Unhandled exception - 500 error
        logger.exception(f"Unhandled exception in view: {context['view'].__class__.__name__}")
        response = Response(
            {
                "error": "Internal server error",
                "status": status.HTTP_500_INTERNAL_SERVER_ERROR,
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return response