#from django.db import models

from django.db import models
from django.contrib.auth.models import User # For user authentication
# Implement the Vote API (POST). Implement logic to prevent duplicate voting (e.g., based on user ID or IP, for simplicity).

class Poll(models.Model):
    question = models.CharField(max_length=200)
    pub_date = models.DateTimeField('date published', auto_now_add=True)
    end_date = models.DateTimeField('end date', null=True, blank=True) # Optional: for poll expiry

    def __str__(self):
        return self.question

    # Add methods for active/expired status if desired

class Choice(models.Model):
    poll = models.ForeignKey(Poll, related_name='choices', on_delete=models.CASCADE)
    choice_text = models.CharField(max_length=200)

    def __str__(self):
        return self.choice_text

class Vote(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    choice = models.ForeignKey(Choice, related_name='votes', on_delete=models.CASCADE)
    voted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'choice') # User can only vote once per poll

    def __str__(self):
        return f"{self.user.username} voted for {self.choice.choice_text}"
