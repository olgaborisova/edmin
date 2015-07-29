# -*- coding: utf-8 -*-
from django.db import models

from django.test import TestCase

from .exceptions import WrongModelFormatException
from .models import ModelsRegistry


class ModelsRegistryTestCase(TestCase):

    @classmethod
    def setUpClass(cls):
        super(ModelsRegistryTestCase, cls).setUpClass()

        fields = [
            {'name': 'title', 'type': 'CharField', 'params': {'max_length': 120},
                'is_unicode': True},
            {'name': 'count', 'type': 'IntegerField'},
            {'name': 'relative', 'type': 'OneToOneField', 'to': 'self',
                'params': {'null': True, 'blank': True}},
        ]
        cls.Model = ModelsRegistry.registry_model('CustomModel', fields)

    def test_field_params_required(self):
        with self.assertRaisesRegexp(WrongModelFormatException, ' name '):
            ModelsRegistry.check_field('Model', {'type': 'CharField'})

        with self.assertRaisesRegexp(WrongModelFormatException, ' type '):
            ModelsRegistry.check_field('Model', {'name': 'title'})

        assert ModelsRegistry.check_field('Model', {'name': 'title', 'type': 'CharField'}) is None

    def test_get_modelfield(self):
        with self.assertRaisesRegexp(WrongModelFormatException,
                                     u'Неверно указан тип поля'.encode('utf-8')):
            ModelsRegistry.get_modelfield('SomeFieldType', 'Model', 'field_name')

        modelfield = ModelsRegistry.get_modelfield('CharField', 'Model', 'field_name')
        assert modelfield is models.CharField

    def test_registry_model_meta(self):
        assert self.Model._meta.ordering == ('title',)

    def test_registry_model_fields(self):
        assert len(self.Model._meta.get_fields()) == 4
        assert (set([field.name for field in self.Model._meta.get_fields()]) ==
                set(['id', 'title', 'count', 'relative']))

    def test_registry_model_field_type(self):
        title_field = self.Model._meta.get_field('title')
        count_field = self.Model._meta.get_field('count')
        relative_field = self.Model._meta.get_field('relative')
        assert isinstance(title_field, models.CharField)
        assert isinstance(count_field, models.IntegerField)
        assert isinstance(relative_field, models.OneToOneField)

    def test_registry_model_field_params(self):
        title_field = self.Model._meta.get_field('title')
        relative_field = self.Model._meta.get_field('relative')
        assert title_field.max_length == 120
        assert not title_field.blank
        assert not title_field.null
        assert relative_field.blank

    def test_registry_model_unicode(self):
        obj = self.Model(title='Some title', count=5)
        assert unicode(obj) == obj.title
