from neo4j import GraphDatabase
import geopandas as gpd
from shapely.geometry import Point
from geopy.geocoders import Nominatim
import time

uri = "neo4j+s://2c863c08.databases.neo4j.io"
username = "neo4j"
password = "7QK9213EWCQePO_8bxjdcnBpjF1zjKwl6_ZjlnqGGkI"
driver = GraphDatabase.driver(uri, auth=(username, password))

geolocator = Nominatim(user_agent="logistics_locator")

def geocode_address(address):
    time.sleep(1)
    location = geolocator.geocode(address)
    if location:
        return location.latitude, location.longitude
    else:
        raise ValueError(f"No se pudo geocodificar: {address}")

datasets = [
    {
        "name": "Telde",
        "nodes_path": "primary_secondary_nodes_telde.geojson",
        "edges_path": "primary_secondary_edges_telde.geojson"
    },
    {
        "name": "Las Palmas",
        "nodes_path": "primary_secondary_nodes_lp.geojson",
        "edges_path": "primary_secondary_edges_lp.geojson"
    }
]

def insert_nodes_batch(tx, nodes):
    query = """
    UNWIND $nodes AS node
    MERGE (n:StreetNode {id: toString(node.id)}) 
    SET n.latitude = node.latitude, n.longitude = node.longitude
    """
    tx.run(query, nodes=nodes)

def insert_relationships_batch(tx, relationships):
    query = """
    UNWIND $relationships AS rel
    MATCH (a:StreetNode {id: toString(rel.start_id)}), (b:StreetNode {id: toString(rel.end_id)})
    MERGE (a)-[:CONNECTED_TO {street_name: rel.street_name, length: rel.length}]->(b)
    """
    tx.run(query, relationships=relationships)

def insert_logistics_node(tx, center_name, lat, lon):
    query = """
    MERGE (l:LogisticsCenter {name: $name})
    SET l.latitude = $lat, l.longitude = $lon
    """
    tx.run(query, name=center_name, lat=lat, lon=lon)

def connect_logistics_to_nearest_street(tx, center_name, nearest_node_id):
    query = """
    MATCH (l:LogisticsCenter {name: $name})
    MATCH (s:StreetNode {id: toString($node_id)})
    MERGE (l)-[:CONNECTED_TO]->(s)
    MERGE (s)-[:CONNECTED_TO]->(l)
    """
    tx.run(query, name=center_name, node_id=nearest_node_id)

def insert_store_node(tx, store_name, lat, lon):
    query = """
    MERGE (s:Store {name: $name})
    SET s.latitude = $lat,
        s.longitude = $lon
    """
    tx.run(query, name=store_name, lat=lat, lon=lon)

def connect_store_to_nearest_street(tx, store_name, nearest_node_id):
    query = """
    MATCH (s:Store {name: $name})
    MATCH (n:StreetNode {id: toString($node_id)})
    MERGE (s)-[:CONNECTED_TO]->(n)
    MERGE (n)-[:CONNECTED_TO]->(s)
    """
    tx.run(query, name=store_name, node_id=nearest_node_id)

with driver.session() as session:
    all_street_nodes = gpd.GeoDataFrame()

    for dataset in datasets:
        print(f"📦 Importando datos de {dataset['name']}...")

        gdf_nodes = gpd.read_file(dataset["nodes_path"])
        gdf_edges = gpd.read_file(dataset["edges_path"])

        all_street_nodes = all_street_nodes._append(gdf_nodes, ignore_index=True)

        nodes_list = [
            {"id": str(row.osmid), "latitude": row.geometry.y, "longitude": row.geometry.x}
            for _, row in gdf_nodes.iterrows()
        ]

        relationships_list = [
            {
                "start_id": str(row["u"]), "end_id": str(row["v"]),
                "street_name": str(row.get("ref", "Unnamed Road")),
                "length": row.get("length", 0)
            }
            for _, row in gdf_edges.iterrows()
        ]

        session.write_transaction(insert_nodes_batch, nodes_list)
        session.write_transaction(insert_relationships_batch, relationships_list)

        print(f"✅ {dataset['name']} importado correctamente.")

    # =======================
    # Insertar Centros Logísticos
    # =======================

    logistics_centers = [
        {
            "name": "CENCOSU",
            "address": "Calle Josefina Mayor, 3, 35219, Telde, El Goro",
            "products": ["refrigerados","congelados","secos","limpieza","higiene","bebidas"]
        },
        {
            "name": "Merca Las Palmas",
            "address": "Cuesta Ramón, 35229, Las Palmas de Gran Canaria",
            "products": ["frutas", "verduras"]
        }
    ]

    stores = [
        {
            "name": "Spar Aeropuerto",
            "address": "Aeropuerto de Gran Canaria, Terminal de llegadas, Av. la Aviación, 35230 Telde, Las Palmas, España",
            "lat": 27.93743,
            "lon": -15.39064
        },
        {
            "name": "SPAR Las Torres",
            "address": "C. Archivero Joaquín Blanco Montesdeoca, 14, 35010 Las Palmas de Gran Canaria, Las Palmas, España"
        },
        {
            "name": "SPAR Málaga",
            "address": "C. Málaga, 7, 35016 Las Palmas de Gran Canaria, Las Palmas, España"
        },
        {
            "name": "SPAR San Juan",
            "address": "C. José Arencibia Gil, 8, 35200 Telde, Las Palmas"
        }
    ]

    for center in logistics_centers:
        print(f"📍 Geocodificando: {center['name']}...")
        lat, lon = geocode_address(center["address"])
        session.write_transaction(insert_logistics_node, center["name"], lat, lon)

        center_point = Point(lon, lat)
        all_street_nodes = all_street_nodes.set_geometry('geometry')
        all_street_nodes = all_street_nodes.to_crs(epsg=3395)
        nearest_node = all_street_nodes.loc[all_street_nodes["dist"].idxmin()]
        nearest_id = str(nearest_node.osmid)

        session.write_transaction(connect_logistics_to_nearest_street, center["name"], nearest_id)
        print(f"✅ {center['name']} conectado al nodo de calle {nearest_id}.")

    print("🏪 Insertando tiendas...")
    for store in stores:
        print(f"📍 Procesando tienda: {store['name']}...")
        if "lat" in store and "lon" in store:
            lat, lon = store["lat"], store["lon"]
        else:
            lat, lon = geocode_address(store["address"])

        session.write_transaction(insert_store_node, store["name"], lat, lon)

        store_point = Point(lon, lat)
        all_street_nodes = all_street_nodes.to_crs(epsg=3395)
        nearest_node = all_street_nodes.loc[all_street_nodes["dist"].idxmin()]
        nearest_id = str(nearest_node.osmid)

        session.write_transaction(connect_store_to_nearest_street, store["name"], nearest_id)
        print(f"✅ Tienda '{store['name']}' conectada al nodo de calle {nearest_id}")


    # Crear conexión entre Telde y Las Palmas por carretera en común
    edges_telde = gpd.read_file("primary_secondary_edges_telde.geojson")
    edges_lp = gpd.read_file("primary_secondary_edges_lp.geojson")
    nodes_telde = gpd.read_file("primary_secondary_nodes_telde.geojson")
    nodes_lp = gpd.read_file("primary_secondary_nodes_lp.geojson")

    # Detectar las carreteras en común, según la referencia, que conectan telde y las palmas
    refs_telde = set(edges_telde['ref'].dropna())
    refs_lp = set(edges_lp['ref'].dropna())
    common_refs = refs_telde & refs_lp

    if len(common_refs) == 1:
        shared_ref = list(common_refs)[0]
        print(f"🔗 Carretera común detectada: {shared_ref}")

        telde_edges = edges_telde[edges_telde['ref'] == shared_ref]
        lp_edges = edges_lp[edges_lp['ref'] == shared_ref]

        telde_ids = set(telde_edges['u']).union(telde_edges['v'])
        lp_ids = set(lp_edges['u']).union(lp_edges['v'])

        telde_nodes = nodes_telde[nodes_telde['osmid'].isin(telde_ids)]
        lp_nodes = nodes_lp[nodes_lp['osmid'].isin(lp_ids)]

        # el par de nodos más cercano
        closest = min(
            ((t['osmid'], l['osmid'], t.geometry.distance(l.geometry))
             for _, t in telde_nodes.iterrows()
             for _, l in lp_nodes.iterrows()),
            key=lambda x: x[2]
        )

        telde_id, lp_id, dist = closest

        session.write_transaction(
            insert_relationships_batch,
            [
                {"start_id": str(telde_id), "end_id": str(lp_id), "street_name": shared_ref,
                 "length": round(dist * 111000, 2)},
                {"start_id": str(lp_id), "end_id": str(telde_id), "street_name": shared_ref,
                 "length": round(dist * 111000, 2)}
            ]
        )
        print(f"✅ Conexión {shared_ref} creada entre {telde_id} (Telde) y {lp_id} (Las Palmas).")

    elif len(common_refs) == 0:
        print("No se encontraron carreteras comunes entre Telde y Las Palmas.")
    else:
        print(f"Se encontraron múltiples refs comunes: {common_refs}. Especifica cuál usar.")

print("🚚 Todos los datos han sido insertados en Neo4j con éxito.")