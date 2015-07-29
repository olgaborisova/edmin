from django.apps import apps
from django.contrib import admin


def register():
    models = apps.get_app_config('storage').get_models()
    for model in models:
        admin.site.register(model)

register()
