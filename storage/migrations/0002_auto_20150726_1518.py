# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('storage', '0001_initial'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='author',
            options={'ordering': ('name',)},
        ),
        migrations.AlterModelOptions(
            name='book',
            options={'ordering': ('title',)},
        ),
        migrations.AddField(
            model_name='author',
            name='relative',
            field=models.OneToOneField(null=True, blank=True, to='storage.Author'),
        ),
    ]
