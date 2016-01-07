# -*- coding: utf-8 -*-
# Generated by Django 1.9 on 2016-01-07 15:49
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('posts', '0016_auto_20160107_1459'),
    ]

    operations = [
        migrations.AlterField(
            model_name='comment',
            name='post',
            field=models.ForeignKey(db_column=b'post_id', null=True, on_delete=django.db.models.deletion.CASCADE, to='posts.Post'),
        ),
        migrations.AlterField(
            model_name='comment',
            name='user',
            field=models.ForeignKey(db_column=b'user_id', null=True, on_delete=django.db.models.deletion.CASCADE, to='login.CustomUser'),
        ),
        migrations.AlterField(
            model_name='follower',
            name='user',
            field=models.ForeignKey(db_column=b'user_id', null=True, on_delete=django.db.models.deletion.CASCADE, to='login.CustomUser'),
        ),
        migrations.AlterField(
            model_name='post',
            name='user',
            field=models.ForeignKey(db_column=b'user_id', null=True, on_delete=django.db.models.deletion.CASCADE, to='login.CustomUser'),
        ),
    ]
