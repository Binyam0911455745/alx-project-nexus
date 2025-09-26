#from django.contrib import admin

# Register your models here.

from django.contrib import admin
from .models import Poll, Choice, Vote

admin.site.register(Poll)
admin.site.register(Choice)
admin.site.register(Vote)