"""
Schema definitions for the data storage layer.

This module provides utilities for defining and validating schemas for different
data storage systems.
"""

import json
import logging
from typing import Any, Dict, List, Optional, Union

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class SchemaField:
    """Class representing a field in a schema."""
    
    def __init__(
        self,
        name: str,
        data_type: str,
        nullable: bool = True,
        primary_key: bool = False,
        foreign_key: str = None,
        unique: bool = False,
        default: Any = None,
        description: str = None,
    ):
        """
        Initialize a schema field.
        
        Args:
            name: Name of the field
            data_type: Data type of the field
            nullable: Whether the field can be null
            primary_key: Whether the field is a primary key
            foreign_key: Reference to another field (table.field)
            unique: Whether the field must be unique
            default: Default value for the field
            description: Description of the field
        """
        self.name = name
        self.data_type = data_type
        self.nullable = nullable
        self.primary_key = primary_key
        self.foreign_key = foreign_key
        self.unique = unique
        self.default = default
        self.description = description
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert the field to a dictionary.
        
        Returns:
            Dictionary representation of the field
        """
        return {
            "name": self.name,
            "type": self.data_type,
            "nullable": self.nullable,
            "primary_key": self.primary_key,
            "foreign_key": self.foreign_key,
            "unique": self.unique,
            "default": self.default,
            "description": self.description,
        }
    
    @classmethod
    def from_dict(cls, name: str, field_dict: Dict[str, Any]) -> 'SchemaField':
        """
        Create a field from a dictionary.
        
        Args:
            name: Name of the field
            field_dict: Dictionary representation of the field
            
        Returns:
            SchemaField instance
        """
        return cls(
            name=name,
            data_type=field_dict.get("type"),
            nullable=field_dict.get("nullable", True),
            primary_key=field_dict.get("primary_key", False),
            foreign_key=field_dict.get("foreign_key"),
            unique=field_dict.get("unique", False),
            default=field_dict.get("default"),
            description=field_dict.get("description"),
        )


class Schema:
    """Class representing a schema for a data storage system."""
    
    def __init__(self, name: str, fields: Dict[str, SchemaField] = None, description: str = None):
        """
        Initialize a schema.
        
        Args:
            name: Name of the schema
            fields: Dictionary mapping field names to SchemaField instances
            description: Description of the schema
        """
        self.name = name
        self.fields = fields or {}
        self.description = description
    
    def add_field(self, field: SchemaField) -> None:
        """
        Add a field to the schema.
        
        Args:
            field: SchemaField instance to add
        """
        self.fields[field.name] = field
        logger.info(f"Added field {field.name} to schema {self.name}")
    
    def remove_field(self, field_name: str) -> bool:
        """
        Remove a field from the schema.
        
        Args:
            field_name: Name of the field to remove
            
        Returns:
            True if the field was removed, False otherwise
        """
        if field_name in self.fields:
            del self.fields[field_name]
            logger.info(f"Removed field {field_name} from schema {self.name}")
            return True
        
        logger.warning(f"Field {field_name} not found in schema {self.name}")
        return False
    
    def get_field(self, field_name: str) -> Optional[SchemaField]:
        """
        Get a field from the schema.
        
        Args:
            field_name: Name of the field
            
        Returns:
            SchemaField instance if found, None otherwise
        """
        return self.fields.get(field_name)
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert the schema to a dictionary.
        
        Returns:
            Dictionary representation of the schema
        """
        return {
            "name": self.name,
            "fields": {name: field.to_dict() for name, field in self.fields.items()},
            "description": self.description,
        }
    
    def to_json(self, indent: int = 2) -> str:
        """
        Convert the schema to a JSON string.
        
        Args:
            indent: Number of spaces for indentation
            
        Returns:
            JSON string representation of the schema
        """
        return json.dumps(self.to_dict(), indent=indent)
    
    @classmethod
    def from_dict(cls, schema_dict: Dict[str, Any]) -> 'Schema':
        """
        Create a schema from a dictionary.
        
        Args:
            schema_dict: Dictionary representation of the schema
            
        Returns:
            Schema instance
        """
        name = schema_dict.get("name")
        description = schema_dict.get("description")
        
        schema = cls(name=name, description=description)
        
        fields_dict = schema_dict.get("fields", {})
        for field_name, field_dict in fields_dict.items():
            field = SchemaField.from_dict(field_name, field_dict)
            schema.add_field(field)
        
        return schema
    
    @classmethod
    def from_json(cls, json_str: str) -> 'Schema':
        """
        Create a schema from a JSON string.
        
        Args:
            json_str: JSON string representation of the schema
            
        Returns:
            Schema instance
        """
        schema_dict = json.loads(json_str)
        return cls.from_dict(schema_dict)


class SchemaRegistry:
    """Registry for schemas."""
    
    def __init__(self):
        """Initialize the schema registry."""
        self.schemas = {}
        logger.info("Initialized schema registry")
    
    def register_schema(self, schema: Schema) -> bool:
        """
        Register a schema.
        
        Args:
            schema: Schema to register
            
        Returns:
            True if registration is successful, False otherwise
        """
        try:
            self.schemas[schema.name] = schema
            logger.info(f"Registered schema: {schema.name}")
            return True
        except Exception as e:
            logger.error(f"Failed to register schema {schema.name}: {str(e)}")
            return False
    
    def get_schema(self, name: str) -> Optional[Schema]:
        """
        Get a schema by name.
        
        Args:
            name: Name of the schema
            
        Returns:
            Schema if found, None otherwise
        """
        return self.schemas.get(name)
    
    def list_schemas(self) -> List[str]:
        """
        List all registered schemas.
        
        Returns:
            List of schema names
        """
        return list(self.schemas.keys())
    
    def remove_schema(self, name: str) -> bool:
        """
        Remove a schema from the registry.
        
        Args:
            name: Name of the schema
            
        Returns:
            True if the schema was removed, False otherwise
        """
        if name in self.schemas:
            del self.schemas[name]
            logger.info(f"Removed schema {name} from registry")
            return True
        
        logger.warning(f"Schema {name} not found in registry")
        return False
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert the registry to a dictionary.
        
        Returns:
            Dictionary representation of the registry
        """
        return {
            "schemas": {name: schema.to_dict() for name, schema in self.schemas.items()},
        }
    
    def to_json(self, indent: int = 2) -> str:
        """
        Convert the registry to a JSON string.
        
        Args:
            indent: Number of spaces for indentation
            
        Returns:
            JSON string representation of the registry
        """
        return json.dumps(self.to_dict(), indent=indent)
    
    @classmethod
    def from_dict(cls, registry_dict: Dict[str, Any]) -> 'SchemaRegistry':
        """
        Create a registry from a dictionary.
        
        Args:
            registry_dict: Dictionary representation of the registry
            
        Returns:
            SchemaRegistry instance
        """
        registry = cls()
        
        schemas_dict = registry_dict.get("schemas", {})
        for schema_name, schema_dict in schemas_dict.items():
            schema = Schema.from_dict(schema_dict)
            registry.register_schema(schema)
        
        return registry
    
    @classmethod
    def from_json(cls, json_str: str) -> 'SchemaRegistry':
        """
        Create a registry from a JSON string.
        
        Args:
            json_str: JSON string representation of the registry
            
        Returns:
            SchemaRegistry instance
        """
        registry_dict = json.loads(json_str)
        return cls.from_dict(registry_dict)


def create_schema_from_config(name: str, config: Dict[str, Dict[str, Any]]) -> Schema:
    """
    Create a schema from a configuration dictionary.
    
    Args:
        name: Name of the schema
        config: Configuration dictionary mapping field names to field properties
        
    Returns:
        Schema instance
    """
    schema = Schema(name=name)
    
    for field_name, field_config in config.items():
        field = SchemaField.from_dict(field_name, field_config)
        schema.add_field(field)
    
    return schema

