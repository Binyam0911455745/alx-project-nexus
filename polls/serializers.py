from rest_framework import serializers
from .models import Poll, Choice, Vote

class ChoiceSerializer(serializers.ModelSerializer):
    votes_count = serializers.SerializerMethodField()

    class Meta:
        model = Choice
        fields = ['id', 'choice_text', 'votes_count']
        read_only_fields = ['votes_count']

    def get_votes_count(self, obj):
        return obj.votes.count()

class PollSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True, read_only=True) # Nested serializer

    class Meta:
        model = Poll
        fields = ['id', 'question', 'pub_date', 'end_date', 'choices']

class VoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vote
        fields = ['id', 'choice', 'user', 'voted_at']
        read_only_fields = ['user', 'voted_at']

    def validate(self, data):
        # Check if user has already voted in this poll
        user = self.context['request'].user
        poll = data['choice'].poll
        if Vote.objects.filter(user=user, choice__poll=poll).exists():
            raise serializers.ValidationError("You have already voted in this poll.")
        return data