#from django.shortcuts import render

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Poll, Choice, Vote
from .serializers import PollSerializer, ChoiceSerializer, VoteSerializer
from rest_framework_simplejwt.authentication import JWTAuthentication # If using JWT

class PollViewSet(viewsets.ModelViewSet):
    queryset = Poll.objects.all().order_by('-pub_date')
    serializer_class = PollSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly] # Allow read for all, write for authenticated

    # Custom action for voting
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def vote(self, request, pk=None):
        poll = self.get_object()
        choice_id = request.data.get('choice_id')

        try:
            choice = poll.choices.get(id=choice_id)
        except Choice.DoesNotExist:
            return Response({'error': 'Invalid choice ID'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = VoteSerializer(data={'choice': choice.id}, context={'request': request})
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # Custom action to view results (can be combined with detail view)
    @action(detail=True, methods=['get'])
    def results(self, request, pk=None):
        poll = self.get_object()
        serializer = PollSerializer(poll) # Re-use poll serializer for results
        return Response(serializer.data)


class ChoiceViewSet(viewsets.ModelViewSet):
    queryset = Choice.objects.all()
    serializer_class = ChoiceSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

# You might not need a separate VoteViewSet for CRUD, as voting is handled via PollViewSet's action
# But if you need to list/delete votes directly, you could add it:
# class VoteViewSet(viewsets.ModelViewSet):
#    queryset = Vote.objects.all()
#    serializer_class = VoteSerializer
#    permission_classes = [permissions.IsAuthenticated]
