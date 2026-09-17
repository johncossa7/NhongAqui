from django.db import migrations


def clear_existing_product_images(apps, schema_editor):
    ProductImage = apps.get_model("products", "ProductImage")

    for product_image in ProductImage.objects.exclude(image="").iterator():
        image = product_image.image
        try:
            if image.name and image.storage.exists(image.name):
                image.storage.delete(image.name)
        except OSError:
            pass

    ProductImage.objects.all().delete()


class Migration(migrations.Migration):
    dependencies = [
        ("products", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(clear_existing_product_images, migrations.RunPython.noop),
    ]
