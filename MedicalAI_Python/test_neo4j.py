from neo4j import GraphDatabase

driver = GraphDatabase.driver("bolt://localhost:7687", auth=("neo4j", "MatKhauNeo4j123"))

query = """
MATCH (d:Disease {name: $disease_full_name})-[r:HAS_ADVICE_FOR]->(a:Advice)
WHERE r.trigger = $feature_name
RETURN a.content AS advice_content
"""

try:
    with driver.session() as session:
        result = session.run(query, disease_full_name="Bệnh Tim mạch", feature_name="Age")
        print(result.single())
except Exception as e:
    print(f"Error: {e}")
