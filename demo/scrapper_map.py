import osmnx as ox
import matplotlib.pyplot as plt
import geopandas as gpd

place_name = "Las Palmas de Gran Canaria, Spain"
graph = ox.graph_from_place(place_name, network_type="drive")

gdf_nodes, gdf_edges = ox.graph_to_gdfs(graph, nodes=True, edges=True)

# Filtrado de solo las carreteras primarias
primary_secondary_edges = gdf_edges[
    gdf_edges["highway"].isin(["primary", "primary_link", "secondary", "secondary_link"])]

primary_secondary_nodes = gdf_nodes[gdf_nodes.index.isin(primary_secondary_edges.index.get_level_values(0))]

primary_secondary_nodes.to_file("primary_secondary_nodes_LP.geojson", driver="GeoJSON")
primary_secondary_edges.to_file("primary_secondary_edges_LP.geojson", driver="GeoJSON")
