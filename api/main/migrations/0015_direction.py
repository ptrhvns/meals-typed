# Generated by Django 4.1.2 on 2022-10-06 17:23

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("main", "0014_alter_ingredient_amount"),
    ]

    operations = [
        migrations.CreateModel(
            name="Direction",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("description", models.TextField(blank=True)),
                (
                    "recipe",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="directions",
                        to="main.recipe",
                    ),
                ),
            ],
        ),
    ]