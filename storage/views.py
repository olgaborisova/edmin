from django.apps import apps
from django.http import Http404

from rest_framework import serializers
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import UpdateAPIView

from .settings import MODELS


class ModelList(APIView):

    def get(self, request, format=None):
        models = [{'name': name} for name in MODELS.keys()]
        return Response(models)


class ObjectList(APIView):

    def get(self, request, format=None):
        model_name = request.GET.get('model')
        if model_name not in MODELS.keys():
            raise Http404

        model = apps.get_app_config('storage').get_model(model_name)
        qs = model.objects.all()

        objects = self.get_objects_list(qs)
        return Response(objects)

    def get_objects_list(self, qs):
        objects_list = []
        fields = MODELS[qs.model.__name__]
        for model_obj in qs:
            obj = {'id': model_obj.pk}
            for field in fields:
                field_name = field['name']
                if field['type'] in ('ForeignKey', 'OneToOneField'):
                    value = getattr(model_obj, field_name)
                    if value is None:
                        obj[field_name] = {'id': '', 'title': ''}
                    else:
                        obj[field_name] = {'id': value.pk, 'title': unicode(value)}
                else:
                    obj[field_name] = getattr(model_obj, field_name) or ''
            objects_list.append(obj)
        return objects_list


class FieldList(APIView):

    def get(self, request, format=None):
        model_name = request.GET.get('model')
        if model_name not in MODELS.keys():
            raise Http404

        fields = MODELS[model_name]
        objects = [{'name': f['name'], 'type': f['type']} for f in fields]
        return Response(objects)


class ObjectDetailView(UpdateAPIView):

    def get_model_class(self):
        model_name = self.kwargs['model_name']
        if model_name not in MODELS.keys():
            raise Http404
        return apps.get_app_config('storage').get_model(model_name)

    def get_queryset(self):
        models_class = self.get_model_class()
        qs = models_class.objects.all()
        return qs

    def get_serializer_class(self):
        model_class = self.get_model_class()
        fields = MODELS[self.kwargs['model_name']]
        field_names = [field['name'] for field in fields]
        field_names.append('id')

        class SomeModelSerializer(serializers.ModelSerializer):

            class Meta:
                model = model_class
                fields = field_names

        return SomeModelSerializer
