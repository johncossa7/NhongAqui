from decimal import Decimal
from random import choice, randint

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from accounts.models import SellerProfile
from categories.models import Category
from favorites.models import Favorite
from products.models import Product
from reviews.models import Review

User = get_user_model()

CATEGORIES = [
    "Telemoveis e Tablets",
    "Informatica",
    "Eletronica",
    "Moda",
    "Calcado",
    "Beleza e Cuidados",
    "Casa e Jardim",
    "Moveis",
    "Eletrodomesticos",
    "Desporto",
    "Criancas e Bebes",
    "Jogos e Consolas",
    "Automoveis e Acessorios",
    "Outros",
]

PRODUCTS = [
    ("iPhone 13 128GB", "Telemoveis e Tablets", 42000),
    ("Samsung Galaxy S22", "Telemoveis e Tablets", 36000),
    ("Lenovo ThinkPad T480", "Informatica", 28500),
    ("PlayStation 5 com comando", "Jogos e Consolas", 52000),
    ("TV Samsung 43 polegadas", "Eletronica", 24000),
    ("Sapatilhas Nike Air", "Calcado", 4500),
    ("Sofa de 3 lugares", "Moveis", 18000),
    ("Frigorifico Defy", "Eletrodomesticos", 30000),
    ("Bicicleta urbana", "Desporto", 8500),
    ("Mesa de jantar", "Casa e Jardim", 12500),
    ("Vestido elegante", "Moda", 2200),
    ("Tablet Samsung A8", "Telemoveis e Tablets", 15000),
    ("Monitor Dell 24 polegadas", "Informatica", 9000),
    ("Coluna Bluetooth JBL", "Eletronica", 5500),
    ("Carrinho de bebe", "Criancas e Bebes", 7000),
    ("Liquidificador Philips", "Eletrodomesticos", 2300),
    ("Capacete moto", "Automoveis e Acessorios", 3500),
    ("Relogio smartwatch", "Eletronica", 6200),
    ("Cama casal", "Moveis", 21000),
    ("Mochila para laptop", "Informatica", 1800),
]


class Command(BaseCommand):
    help = "Seed demo users, categories, products, reviews and favorites."

    def handle(self, *args, **options):
        categories = {}
        for index, name in enumerate(CATEGORIES):
            category, _ = Category.objects.get_or_create(
                name=name,
                defaults={"sort_order": index, "icon": "tag"},
            )
            categories[name] = category

        sellers = []
        for index in range(1, 5):
            user, created = User.objects.get_or_create(
                email=f"vendedor{index}@nhongaqui.local",
                defaults={
                    "first_name": f"Vendedor {index}",
                    "last_name": "Demo",
                    "phone": f"+2588400000{index}",
                    "province": "Maputo",
                    "city": choice(["Maputo", "Matola"]),
                    "neighborhood": choice(["Polana", "Malhangalene", "Fomento", "Liberdade"]),
                    "verification_status": User.VerificationStatus.VERIFIED if index <= 2 else User.VerificationStatus.UNVERIFIED,
                },
            )
            if created:
                user.set_password("Password123!")
                user.save()
            SellerProfile.objects.update_or_create(
                user=user,
                defaults={
                    "display_name": f"Loja Demo {index}",
                    "bio": "Vendedor de demonstracao do NhongAqui.",
                    "verified": index <= 2,
                },
            )
            sellers.append(user)

        buyer, created = User.objects.get_or_create(
            email="comprador@nhongaqui.local",
            defaults={
                "first_name": "Comprador",
                "last_name": "Demo",
                "phone": "+258850000000",
                "province": "Maputo",
                "city": "Maputo",
            },
        )
        if created:
            buyer.set_password("Password123!")
            buyer.save()
            SellerProfile.objects.create(user=buyer, display_name=buyer.full_name)

        for index, (title, category_name, price) in enumerate(PRODUCTS):
            product, _ = Product.objects.get_or_create(
                title=title,
                seller=choice(sellers),
                defaults={
                    "category": categories[category_name],
                    "description": f"{title} em bom estado, disponivel para entrega em Maputo ou Matola.",
                    "price": Decimal(price),
                    "negotiable": index % 2 == 0,
                    "condition": choice(
                        [
                            Product.Condition.NEW,
                            Product.Condition.LIKE_NEW,
                            Product.Condition.GOOD,
                            Product.Condition.USED,
                        ]
                    ),
                    "province": "Maputo",
                    "city": choice(["Maputo", "Matola"]),
                    "neighborhood": choice(["Polana", "Baixa", "Fomento", "T3"]),
                    "status": Product.Status.ACTIVE,
                    "featured": index < 4,
                    "views_count": randint(5, 250),
                },
            )
            if index % 3 == 0 and product.seller != buyer:
                Review.objects.get_or_create(
                    reviewer=buyer,
                    reviewed_user=product.seller,
                    product=product,
                    defaults={"rating": choice([4, 5]), "comment": "Boa comunicacao e produto conforme."},
                )
            if index % 4 == 0:
                Favorite.objects.get_or_create(user=buyer, product=product)

        self.stdout.write(self.style.SUCCESS("Demo data created for NhongAqui."))
