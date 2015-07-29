# -*- coding: utf-8 -*-
import inspect

from django.db import models

from .exceptions import WrongModelFormatException
from .settings import MODELS


app_label = 'storage'


class ModelsRegistry():

    relationship_fields = ['ForeignKey', 'ManyToManyField', 'OneToOneField']

    @classmethod
    def registry(cls):
        """ Создает модели, описанные из MODELS и возвращает их список."""
        models = []
        for model_name, model_fields in MODELS.items():
            try:
                model = cls.registry_model(model_name, model_fields)
                models.append(model)
            except:
                print u'Ошибка при создании модели {}'.format(model_name)
                raise
        return models

    @classmethod
    def registry_model(cls, model_name, fields):
        """ Возвращает модель model_name c полями fields."""

        attrs = {}
        attrs['__module__'] = '{}.models'.format(app_label)

        # Создаем класс Meta модели, указываем в нем app_label и сортировку
        Meta = type('Meta', (), {})
        Meta.app_label = app_label

        # Заполняем поля
        for field in fields:
            cls.check_field(model_name, field)
            field_name = field['name']
            field_type = field['type']
            params = field.get('params', {})

            if cls.is_relationship_fields(field):
                args = [cls.process_relationship_fields(field, model_name)]
            else:
                args = []

            django_field = cls.get_modelfield(field_type, model_name, field_name)
            attrs[field_name] = django_field(*args, **params)

            # Для отображения в админке задваем unicode и сортировку
            if field.get('is_unicode') is True:
                unicode_field = field_name
                attrs['__unicode__'] = lambda self: unicode(getattr(self, unicode_field))
                Meta.ordering = (unicode_field,)

        attrs['Meta'] = Meta

        # Создаем модель
        model = type(model_name, (models.Model,), attrs)

        return model

    @classmethod
    def is_relationship_fields(cls, field):
        """ Возвращает признак того, что поле является связкой с другой моделью."""

        return field['type'] in cls.relationship_fields

    @classmethod
    def process_relationship_fields(cls, field, model_name):
        """ Возвращает строковое описание модели, на которое указывает field."""

        if 'to' not in field:
            msg = u'Не указан параметр "to" для поля {} модели {}'.format(
                field['name'], model_name)
            cls.raise_error(msg)

        if field['to'] not in MODELS.keys() and field['to'] != 'self':
            msg = u'Неверно указан параметр "to" для поля {} модели {}'.format(
                field['name'], model_name)
            cls.raise_error(msg)

        if field['to'] == 'self':
            return field['to']

        return u'{}.{}'.format(app_label, field['to'])

    @classmethod
    def get_modelfield(cls, field_type, model_name, field_name):
        """Возвращает django-field класс из models."""

        try:
            django_field = getattr(models, field_type)
        except AttributeError:
            msg = u'Неверно указан тип поля {0} ({1}) модели {2}'.format(
                field_name, field_type, model_name)
            cls.raise_error(msg)

        if not inspect.isclass(django_field) or models.Field not in inspect.getmro(django_field):
            msg = u'Неверно указан тип поля {0} ({1}) модели {2}'.format(
                field_name, field_type, model_name)
            cls.raise_error(msg)

        return django_field

    @classmethod
    def check_field(cls, model_name, field):
        """ Проверяет наличие обязательных параметров для полей (name, type)."""

        if 'name' not in field:
            msg = u'Не указан параметр name для поля:\n{}\nмодели {}'.format(
                unicode(field), model_name)
            cls.raise_error(msg)

        if 'type' not in field:
            msg = u'Не указан параметр type для поля:\n{}\nмодели {}'.format(
                unicode(field), model_name)
            cls.raise_error(msg)

    @classmethod
    def raise_error(cls, message):
        raise WrongModelFormatException(message.encode('utf-8'))


model_classes = ModelsRegistry.registry()
