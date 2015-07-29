from django.apps import AppConfig

from .models import model_classes


class StorageConfig(AppConfig):
    name = 'storage'
    verbose_name = 'storage'

    def get_models(self, *args, **kwargs):
        return model_classes
