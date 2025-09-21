from rest_framework.routers import DefaultRouter
from .views import PollViewSet, ChoiceViewSet # , VoteViewSet

router = DefaultRouter()
router.register(r'polls', PollViewSet)
router.register(r'choices', ChoiceViewSet)
# router.register(r'votes', VoteViewSet)

urlpatterns = router.urls