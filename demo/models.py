from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class Supermercado(db.Model):
    __tablename__ = 'supermercado'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String, nullable=False)
    lat = db.Column(db.Float, nullable=False)
    lng = db.Column(db.Float, nullable=False)
    inventario = db.relationship("Inventario", back_populates="supermercado")


class Producto(db.Model):
    __tablename__ = 'producto'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String, nullable=False)
    inventario = db.relationship("Inventario", back_populates="producto")


class Inventario(db.Model):
    __tablename__ = 'inventario'
    id = db.Column(db.Integer, primary_key=True)
    supermercado_id = db.Column(db.Integer, db.ForeignKey('supermercado.id'))
    producto_id = db.Column(db.Integer, db.ForeignKey('producto.id'))
    cantidad = db.Column(db.Integer, nullable=False)

    supermercado = db.relationship("Supermercado", back_populates="inventario")
    producto = db.relationship("Producto", back_populates="inventario")
