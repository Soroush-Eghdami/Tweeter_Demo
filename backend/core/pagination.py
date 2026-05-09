from rest_framework.pagination import PageNumberPagination

class TweeterPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'   # allows ?page_size=30
    max_page_size = 100