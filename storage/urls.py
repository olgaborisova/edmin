from django.conf.urls import url, patterns

from .views import ModelList, ObjectList, FieldList, ObjectDetailView


urlpatterns = patterns(
    '',
    url(r'^models/$', ModelList.as_view(), name='model_list'),
    url(r'^objects/$', ObjectList.as_view(), name='object_list'),
    url(r'^objects/(?P<model_name>\w+)/(?P<pk>\d+)$',
        ObjectDetailView.as_view(),
        name='object_list'),
    url(r'^fields/$', FieldList.as_view(), name='field_list'),
)
