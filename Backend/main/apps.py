from django.apps import AppConfig
from django.db.models.signals import post_save


class MainConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'main'

    def ready(self):
        from .observer import schedule_product_deletion, schedule_story_deletion
        Product = self.get_model('Product')
        Story = self.get_model('Story')
        post_save.connect(schedule_product_deletion, sender=Product)
        post_save.connect(schedule_story_deletion, sender=Story)
