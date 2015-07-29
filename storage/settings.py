# coding: utf-8

__all__ = ['MODELS']


author_fields = [
    {'name': 'name', 'type': 'CharField', 'params': {'max_length': 255}, 'is_unicode': True},
    {'name': 'birth_at', 'type': 'DateField', 'params': {'null': True, 'blank': True}},
    {'name': 'relative', 'type': 'OneToOneField', 'to': 'self',
        'params': {'null': True, 'blank': True}},
]

book_fields = [
    {'name': 'title', 'type': 'CharField', 'params': {'max_length': 255}, 'is_unicode': True},
    {'name': 'page_count', 'type': 'IntegerField', 'params': {'null': True, 'blank': True}},
    {'name': 'author', 'type': 'ForeignKey', 'to': 'Author'},
]

MODELS = {
    'Book': book_fields,
    'Author': author_fields,
}
