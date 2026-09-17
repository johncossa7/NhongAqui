from io import BytesIO
from uuid import uuid4

from django.conf import settings
from django.core.files.base import ContentFile
from PIL import Image, ImageOps, UnidentifiedImageError
from rest_framework import serializers

ALLOWED_IMAGE_FORMATS = {"JPEG", "PNG", "WEBP"}


def prepare_product_image(uploaded_file) -> ContentFile:
    if uploaded_file.size > settings.MAX_PRODUCT_IMAGE_SIZE:
        max_mb = settings.MAX_PRODUCT_IMAGE_SIZE // (1024 * 1024)
        raise serializers.ValidationError(f"Cada fotografia deve ter no maximo {max_mb} MB.")

    try:
        uploaded_file.seek(0)
        with Image.open(uploaded_file) as source:
            source.verify()

        uploaded_file.seek(0)
        with Image.open(uploaded_file) as source:
            if source.format not in ALLOWED_IMAGE_FORMATS:
                raise serializers.ValidationError("Use apenas fotografias JPG, PNG ou WebP.")
            if getattr(source, "is_animated", False):
                raise serializers.ValidationError("Imagens animadas nao sao permitidas.")
            if source.width * source.height > settings.MAX_PRODUCT_IMAGE_PIXELS:
                raise serializers.ValidationError("A fotografia tem resolucao demasiado elevada.")

            image = ImageOps.exif_transpose(source)
            image.thumbnail(
                (settings.PRODUCT_IMAGE_MAX_DIMENSION, settings.PRODUCT_IMAGE_MAX_DIMENSION),
                Image.Resampling.LANCZOS,
            )
            image = image.convert("RGBA" if "A" in image.getbands() else "RGB")
            output = BytesIO()
            image.save(
                output,
                format="WEBP",
                quality=settings.PRODUCT_IMAGE_WEBP_QUALITY,
                method=6,
            )
    except serializers.ValidationError:
        raise
    except (Image.DecompressionBombError, UnidentifiedImageError, OSError, ValueError) as exc:
        raise serializers.ValidationError("O ficheiro nao e uma fotografia valida.") from exc

    return ContentFile(output.getvalue(), name=f"{uuid4().hex}.webp")
