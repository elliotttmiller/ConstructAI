"""
Module 2: Graph Database for Clause Relationships

Stores clauses and their relationships in a graph structure for powerful queries.
"""

from typing import Dict, List, Any, Optional
import logging

logger = logging.getLogger(__name__)


class ClauseGraphDB:
    """
    Graph database interface for specification clauses.
    
    Stores clauses and their relationships (references, dependencies, conflicts).
    Currently uses in-memory storage; can be upgraded to Neo4j.
    """
    
    def __init__(self, use_neo4j: bool = False, neo4j_uri: str = None):
        self.use_neo4j = use_neo4j
        self.neo4j_uri = neo4j_uri
        
        # In-memory storage
        self.clauses = {}
        self.relationships = []
        
        if use_neo4j:
            try:
                self._init_neo4j()
            except Exception as e:
                logger.warning(f"Neo4j initialization failed: {e}. Using in-memory storage.")
                self.use_neo4j = False
        
        logger.info(f"ClauseGraphDB initialized (Neo4j: {self.use_neo4j})")
    
    def _init_neo4j(self):
        """Initialize Neo4j connection."""
        try:
            from neo4j import GraphDatabase
            
            if not self.neo4j_uri:
                self.neo4j_uri = "bolt://localhost:7687"
            
            self.driver = GraphDatabase.driver(self.neo4j_uri)
            logger.info(f"Connected to Neo4j at {self.neo4j_uri}")
            
        except ImportError:
            raise ImportError("neo4j package not installed. Install with: pip install neo4j")
    
    def add_clause(self, clause_id: str, clause_data: Dict[str, Any]):
        """Add a clause to the graph."""
        if self.use_neo4j:
            self._add_clause_neo4j(clause_id, clause_data)
        else:
            self.clauses[clause_id] = clause_data
            logger.debug(f"Added clause {clause_id} to in-memory storage")
    
    def _add_clause_neo4j(self, clause_id: str, clause_data: Dict[str, Any]):
        """Add clause to Neo4j."""
        with self.driver.session() as session:
            session.run(
                """
                CREATE (c:Clause {
                    id: $id,
                    text: $text,
                    division: $division,
                    clause_type: $clause_type
                })
                """,
                id=clause_id,
                text=clause_data.get("text", ""),
                division=clause_data.get("masterformat_division"),
                clause_type=clause_data.get("clause_type")
            )
    
    def add_relationship(self, clause1_id: str, clause2_id: str, rel_type: str, properties: Dict = None):
        """Add a relationship between two clauses."""
        relationship = {
            "from": clause1_id,
            "to": clause2_id,
            "type": rel_type,
            "properties": properties or {}
        }
        
        if self.use_neo4j:
            self._add_relationship_neo4j(clause1_id, clause2_id, rel_type, properties)
        else:
            self.relationships.append(relationship)
    
    def _add_relationship_neo4j(self, clause1_id: str, clause2_id: str, rel_type: str, properties: Dict):
        """Add relationship to Neo4j."""
        with self.driver.session() as session:
            session.run(
                f"""
                MATCH (c1:Clause {{id: $id1}})
                MATCH (c2:Clause {{id: $id2}})
                CREATE (c1)-[r:{rel_type}]->(c2)
                SET r = $props
                """,
                id1=clause1_id,
                id2=clause2_id,
                props=properties or {}
            )
    
    def query_related_clauses(self, clause_id: str, rel_type: Optional[str] = None) -> List[Dict]:
        """Query clauses related to a given clause."""
        if self.use_neo4j:
            return self._query_related_neo4j(clause_id, rel_type)
        else:
            related = []
            for rel in self.relationships:
                if rel["from"] == clause_id:
                    if rel_type is None or rel["type"] == rel_type:
                        to_clause = self.clauses.get(rel["to"])
                        if to_clause:
                            related.append({
                                "clause": to_clause,
                                "relationship": rel["type"]
                            })
            return related
    
    def close(self):
        """Close database connection."""
        if self.use_neo4j and hasattr(self, 'driver'):
            self.driver.close()
