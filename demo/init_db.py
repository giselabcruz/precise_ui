from app import app, db
from models import Producto, Supermercado, Inventario
from faker import Faker
import random

fake = Faker()

PRODUCTOS = [
    "Leche", "Pan", "Huevos", "Queso", "Jamón", "Yogur", "Manzanas", "Plátanos", "Arroz", "Pasta",
    "Cereal", "Aceite de oliva", "Azúcar", "Sal", "Harina", "Café", "Té", "Galletas", "Zanahorias", "Tomates",
    "Papas", "Cebollas", "Pollo", "Carne molida", "Pescado", "Agua embotellada", "Refrescos", "Jugo", "Snacks", "Mermelada"
]

SUPERMERCADOS = [
    ("Spar Aeropuerto", 27.93743, -15.39064),
    ("Spar Las Torres", 28.1136159, -15.4527868),
    ("Spar Málaga", 28.0908995, -15.4158081),
    ("Spar San Juan", 28.000558, -15.4142733)
]


def reset_db():
    with app.app_context():
        print("🧨 Borrando y recreando tablas...")
        db.drop_all()
        db.create_all()

        print("🔁 Insertando supermercados y productos...")

        supermercados = [
            Supermercado(nombre=nombre, lat=lat, lng=lng)
            for nombre, lat, lng in SUPERMERCADOS
        ]
        db.session.add_all(supermercados)
        db.session.commit()

        productos = [Producto(nombre=nombre) for nombre in PRODUCTOS]
        db.session.add_all(productos)
        db.session.commit()

        print("🧪 Generando inventario aleatorio...")

        supermercado_ids = [s.id for s in Supermercado.query.all()]
        producto_ids = [p.id for p in Producto.query.all()]

        inventario = []
        for j in supermercado_ids:
            for i in producto_ids:
                inventario.append(
                    Inventario(
                        supermercado_id=j,
                        producto_id=i,
                        cantidad=random.randint(100, 200)
                    )
                )

        db.session.add_all(inventario)
        db.session.commit()

        print("✅ Base de datos reiniciada.")


if __name__ == "__main__":
    reset_db()
