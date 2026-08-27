from django.db import models


class Subscriber(models.Model):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=80, blank=True)
    is_active = models.BooleanField(default=True)
    is_confirmed = models.BooleanField(
        default=False,
        help_text="Double opt-in: only send campaigns to confirmed subscribers.",
    )
    subscribed_at = models.DateTimeField(auto_now_add=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    unsubscribed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-subscribed_at"]

    def __str__(self):
        return self.email
