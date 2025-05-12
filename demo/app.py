from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO, emit
from models import db, Supermercado, Producto, Inventario
from neo4j import GraphDatabase

app = Flask(__name__)

# Configuración de la base de datos
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://precise_user:precise_pass@localhost/precise_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
socketio = SocketIO(app)

uri = "neo4j+s://2c863c08.databases.neo4j.io"
username = "neo4j"
password = "7QK9213EWCQePO_8bxjdcnBpjF1zjKwl6_ZjlnqGGkI"
driver = GraphDatabase.driver(uri, auth=(username, password))


def get_all_nodes():
    with driver.session() as session:
        result = session.run("MATCH (n)-[r]->(m) RETURN n, r, m")
        nodes = []
        for record in result:
            nodes.append({
                "node": record["n"]._properties,
                "relationship": record["r"].type,
                "connected_node": record["m"]._properties
            })
        return nodes


@app.route("/api/nodes", methods=['GET'])
def get_nodes():
    nodes = get_all_nodes()
    return jsonify(nodes)


@app.route("/")
def index():
    supermercados = Supermercado.query.all()
    productos = Producto.query.all()
    inventario = db.session.query(Inventario, Supermercado, Producto).join(
        Supermercado, Inventario.supermercado_id == Supermercado.id
    ).join(
        Producto, Inventario.producto_id == Producto.id
    ).all()

    datos = [{
        "supermercado": s.nombre,
        "producto": p.nombre,
        "cantidad": i.cantidad
    } for i, s, p in inventario]

    return render_template("index.html", inventario=datos, supermercados=supermercados, productos=productos)


@app.route("/filtrar", methods=["POST"])
def filtrar():
    data = request.get_json()
    supermercado_id = data.get("supermercado_id")
    producto_id = data.get("producto_id")

    query = db.session.query(Inventario, Supermercado, Producto).join(
        Supermercado, Inventario.supermercado_id == Supermercado.id
    ).join(
        Producto, Inventario.producto_id == Producto.id
    )

    if supermercado_id:
        query = query.filter(Inventario.supermercado_id == supermercado_id)
    if producto_id:
        query = query.filter(Inventario.producto_id == producto_id)

    resultados = [{
        "supermercado": s.nombre,
        "producto": p.nombre,
        "cantidad": i.cantidad
    } for i, s, p in query.all()]

    return jsonify(resultados)


@app.route("/consumo", methods=["GET", "POST"])
def consumo():
    if request.method == "POST":
        data = request.get_json()
        supermercado_id = data.get("supermercado_id")
        producto_id = data.get("producto_id")
        cantidad = data.get("cantidad", 0)

        item = Inventario.query.filter_by(
            supermercado_id=supermercado_id,
            producto_id=producto_id
        ).first()

        if item:
            if item.cantidad >= cantidad:
                item.cantidad -= cantidad
                db.session.commit()

                socketio.emit("inventario_actualizado", {
                    "supermercado_id": supermercado_id,
                    "producto_id": producto_id,
                    "cantidad": item.cantidad
                })

                return jsonify({"status": "ok", "message": "Consumo registrado correctamente"})
            else:
                return jsonify({"status": "error", "message": "No hay suficiente stock"})
        else:
            return jsonify({"status": "error", "message": "Producto no encontrado en ese supermercado"})

    supermercados = Supermercado.query.all()
    productos = Producto.query.all()
    return render_template("consumo.html", supermercados=supermercados, productos=productos)


@app.route("/trayectorias")
def trayectorias():
    return render_template('trayectorias.html')


@app.route("/api/rutas")
def rutas():
    rutas = [
        {
            "path": [
                {"latitude": 28.04278, "longitude": -15.4195549},
                {"latitude": 28.0908995, "longitude": -15.4158081}
            ]
        }
    ]
    return jsonify(rutas)


alertas_info = []


@app.route('/api/alerta', methods=["GET", "POST"])
def alerta():
    global alertas_info

    if request.method == "POST":
        data = request.get_json()

        alerta = {
            "producto": data["producto"],
            "supermercado": data["supermercado"]
        }
        alertas_info.append(alerta)

        return jsonify({"message": "Alerta recibida"}), 200

    if not alertas_info:
        return jsonify({"message": "No hay alertas activas"}), 404

    alertas_respuesta = []
    for alerta in alertas_info:
        supermercado = Supermercado.query.filter_by(nombre=alerta["supermercado"]).first()
        if supermercado:
            alertas_respuesta.append({
                "supermercado": supermercado.nombre,
                "producto": alerta["producto"],
                "lat": supermercado.lat,
                "lng": supermercado.lng
            })

    return jsonify(alertas_respuesta)


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    socketio.run(app, host="192.168.1.172", port=80, debug=True)
