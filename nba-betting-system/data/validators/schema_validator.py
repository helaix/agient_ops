"""
Schema Validator

Validates data records against predefined schemas to ensure data consistency
and completeness across different sources.
"""

from typing import Dict, List, Any, Optional
import logging
from datetime import datetime
import jsonschema
from jsonschema import validate, ValidationError

from ..architecture import DataValidator, DataRecord, DataQuality, DataSourceType


class SchemaValidator(DataValidator):
    """Validates data records against JSON schemas."""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.logger = logging.getLogger("validator.schema")
        self.schemas = self._load_schemas()
        
    def _load_schemas(self) -> Dict[str, Dict[str, Any]]:
        """Load validation schemas for different data types."""
        return {
            'nba_game_data': {
                "type": "object",
                "required": ["game_id", "data", "timestamp"],
                "properties": {
                    "game_id": {"type": "string", "minLength": 1},
                    "timestamp": {"type": "string"},
                    "data": {
                        "type": "object",
                        "required": ["game_header", "data_type"],
                        "properties": {
                            "game_header": {
                                "type": "object",
                                "required": ["GAME_ID", "HOME_TEAM_ID", "VISITOR_TEAM_ID"],
                                "properties": {
                                    "GAME_ID": {"type": ["string", "number"]},
                                    "HOME_TEAM_ID": {"type": ["string", "number"]},
                                    "VISITOR_TEAM_ID": {"type": ["string", "number"]},
                                    "GAME_DATE_EST": {"type": "string"},
                                    "GAME_STATUS_TEXT": {"type": "string"}
                                }
                            },
                            "data_type": {"type": "string", "enum": ["game_data"]},
                            "season": {"type": "string"},
                            "season_type": {"type": "string"}
                        }
                    }
                }
            },
            'nba_player_stats': {
                "type": "object",
                "required": ["player_id", "data", "timestamp"],
                "properties": {
                    "player_id": {"type": "string", "minLength": 1},
                    "team_id": {"type": "string"},
                    "timestamp": {"type": "string"},
                    "data": {
                        "type": "object",
                        "required": ["player_stats", "data_type"],
                        "properties": {
                            "player_stats": {
                                "type": "object",
                                "required": ["PLAYER_ID", "PLAYER_NAME", "TEAM_ID"],
                                "properties": {
                                    "PLAYER_ID": {"type": ["string", "number"]},
                                    "PLAYER_NAME": {"type": "string"},
                                    "TEAM_ID": {"type": ["string", "number"]},
                                    "GP": {"type": ["number", "null"]},
                                    "MIN": {"type": ["number", "null"]},
                                    "PTS": {"type": ["number", "null"]},
                                    "REB": {"type": ["number", "null"]},
                                    "AST": {"type": ["number", "null"]}
                                }
                            },
                            "data_type": {"type": "string", "enum": ["player_stats"]},
                            "season": {"type": "string"},
                            "season_type": {"type": "string"}
                        }
                    }
                }
            },
            'nba_team_stats': {
                "type": "object",
                "required": ["team_id", "data", "timestamp"],
                "properties": {
                    "team_id": {"type": "string", "minLength": 1},
                    "timestamp": {"type": "string"},
                    "data": {
                        "type": "object",
                        "required": ["team_stats", "data_type"],
                        "properties": {
                            "team_stats": {
                                "type": "object",
                                "required": ["TEAM_ID", "TEAM_NAME"],
                                "properties": {
                                    "TEAM_ID": {"type": ["string", "number"]},
                                    "TEAM_NAME": {"type": "string"},
                                    "GP": {"type": ["number", "null"]},
                                    "W": {"type": ["number", "null"]},
                                    "L": {"type": ["number", "null"]},
                                    "PTS": {"type": ["number", "null"]},
                                    "FG_PCT": {"type": ["number", "null"]},
                                    "FT_PCT": {"type": ["number", "null"]}
                                }
                            },
                            "data_type": {"type": "string", "enum": ["team_stats"]},
                            "season": {"type": "string"},
                            "season_type": {"type": "string"}
                        }
                    }
                }
            },
            'betting_odds': {
                "type": "object",
                "required": ["game_id", "data", "timestamp"],
                "properties": {
                    "game_id": {"type": "string", "minLength": 1},
                    "timestamp": {"type": "string"},
                    "data": {
                        "type": "object",
                        "required": ["game_info", "bookmaker", "market", "outcomes"],
                        "properties": {
                            "game_info": {
                                "type": "object",
                                "required": ["home_team", "away_team", "commence_time"],
                                "properties": {
                                    "home_team": {"type": "string"},
                                    "away_team": {"type": "string"},
                                    "commence_time": {"type": "string"},
                                    "sport_title": {"type": "string"}
                                }
                            },
                            "bookmaker": {"type": "string"},
                            "market": {"type": "string", "enum": ["h2h", "spreads", "totals"]},
                            "outcomes": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "required": ["name", "price"],
                                    "properties": {
                                        "name": {"type": "string"},
                                        "price": {"type": "number"},
                                        "point": {"type": ["number", "null"]}
                                    }
                                }
                            },
                            "data_type": {"type": "string"},
                            "last_update": {"type": ["string", "null"]}
                        }
                    }
                }
            },
            'injury_report': {
                "type": "object",
                "required": ["data", "timestamp"],
                "properties": {
                    "player_id": {"type": ["string", "null"]},
                    "team_id": {"type": ["string", "null"]},
                    "timestamp": {"type": "string"},
                    "data": {
                        "type": "object",
                        "required": ["player_name", "injury_status", "data_type"],
                        "properties": {
                            "player_name": {"type": "string"},
                            "team_name": {"type": ["string", "null"]},
                            "injury_status": {"type": "string"},
                            "injury_description": {"type": ["string", "null"]},
                            "parsed_injury": {
                                "type": "object",
                                "properties": {
                                    "status": {"type": "string"},
                                    "body_part": {"type": ["string", "null"]},
                                    "injury_type": {"type": ["string", "null"]},
                                    "severity_score": {"type": "number", "minimum": 0, "maximum": 4}
                                }
                            },
                            "source": {"type": "string"},
                            "data_type": {"type": "string", "enum": ["injury_report"]},
                            "impact_score": {"type": ["number", "null"], "minimum": 0, "maximum": 1}
                        }
                    }
                }
            }
        }
    
    def _get_schema_key(self, record: DataRecord) -> Optional[str]:
        """Determine which schema to use for validation based on record content."""
        data_type = record.data.get('data_type')
        source_type = record.source_type
        
        # Map data types to schema keys
        schema_mapping = {
            (DataSourceType.NBA_API, 'game_data'): 'nba_game_data',
            (DataSourceType.NBA_API, 'player_stats'): 'nba_player_stats',
            (DataSourceType.NBA_API, 'team_stats'): 'nba_team_stats',
            (DataSourceType.NBA_API, 'playoff_series'): 'nba_game_data',  # Use game_data schema
            (DataSourceType.BETTING_ODDS, 'live_odds'): 'betting_odds',
            (DataSourceType.BETTING_ODDS, 'market_analysis'): None,  # Skip schema validation for analysis
            (DataSourceType.INJURY_REPORTS, 'injury_report'): 'injury_report',
            (DataSourceType.INJURY_REPORTS, 'player_availability'): None,  # Skip for availability
            (DataSourceType.ROSTER_CHANGES, 'roster_change'): None  # Skip for roster changes
        }
        
        return schema_mapping.get((source_type, data_type))
    
    def validate(self, record: DataRecord) -> DataQuality:
        """Validate a data record against its schema."""
        try:
            schema_key = self._get_schema_key(record)
            
            if schema_key is None:
                # No schema validation required for this record type
                return DataQuality.MEDIUM
            
            if schema_key not in self.schemas:
                self.logger.warning(f"No schema found for {schema_key}")
                return DataQuality.LOW
            
            schema = self.schemas[schema_key]
            
            # Convert record to dict for validation
            record_dict = {
                'source_type': record.source_type.value,
                'timestamp': record.timestamp.isoformat(),
                'game_id': record.game_id,
                'team_id': record.team_id,
                'player_id': record.player_id,
                'data': record.data,
                'quality': record.quality.value,
                'metadata': record.metadata
            }
            
            # Validate against schema
            validate(instance=record_dict, schema=schema)
            
            # Additional validation checks
            quality_score = self._calculate_quality_score(record)
            
            if quality_score >= 0.9:
                return DataQuality.HIGH
            elif quality_score >= 0.7:
                return DataQuality.MEDIUM
            elif quality_score >= 0.5:
                return DataQuality.LOW
            else:
                return DataQuality.INVALID
                
        except ValidationError as e:
            self.logger.error(f"Schema validation failed: {e.message}")
            return DataQuality.INVALID
        except Exception as e:
            self.logger.error(f"Validation error: {e}")
            return DataQuality.LOW
    
    def _calculate_quality_score(self, record: DataRecord) -> float:
        """Calculate a quality score based on data completeness and validity."""
        score = 1.0
        
        # Check timestamp validity
        if not record.timestamp:
            score -= 0.2
        else:
            # Check if timestamp is too old (more than 24 hours)
            age = datetime.utcnow() - record.timestamp
            if age.total_seconds() > 86400:  # 24 hours
                score -= 0.1
        
        # Check data completeness
        if not record.data:
            score -= 0.3
        else:
            # Check for required fields based on data type
            data_type = record.data.get('data_type')
            if not data_type:
                score -= 0.1
            
            # Check for null/empty values in critical fields
            critical_fields = self._get_critical_fields(record.source_type, data_type)
            for field_path in critical_fields:
                if not self._get_nested_value(record.data, field_path):
                    score -= 0.1
        
        # Check metadata completeness
        if not record.metadata.get('ingestion_time'):
            score -= 0.05
        if not record.metadata.get('record_id'):
            score -= 0.05
        
        return max(0.0, score)
    
    def _get_critical_fields(self, source_type: DataSourceType, data_type: str) -> List[str]:
        """Get list of critical field paths for a given source and data type."""
        critical_fields_map = {
            (DataSourceType.NBA_API, 'game_data'): [
                'game_header.GAME_ID',
                'game_header.HOME_TEAM_ID',
                'game_header.VISITOR_TEAM_ID'
            ],
            (DataSourceType.NBA_API, 'player_stats'): [
                'player_stats.PLAYER_ID',
                'player_stats.PLAYER_NAME',
                'player_stats.TEAM_ID'
            ],
            (DataSourceType.NBA_API, 'team_stats'): [
                'team_stats.TEAM_ID',
                'team_stats.TEAM_NAME'
            ],
            (DataSourceType.BETTING_ODDS, 'live_odds'): [
                'game_info.home_team',
                'game_info.away_team',
                'bookmaker',
                'outcomes'
            ],
            (DataSourceType.INJURY_REPORTS, 'injury_report'): [
                'player_name',
                'injury_status'
            ]
        }
        
        return critical_fields_map.get((source_type, data_type), [])
    
    def _get_nested_value(self, data: Dict[str, Any], field_path: str) -> Any:
        """Get value from nested dictionary using dot notation."""
        keys = field_path.split('.')
        value = data
        
        try:
            for key in keys:
                value = value[key]
            return value
        except (KeyError, TypeError):
            return None
    
    def get_validation_rules(self) -> Dict[str, Any]:
        """Return validation rules for this validator."""
        return {
            'validator_type': 'schema',
            'schemas_count': len(self.schemas),
            'supported_data_types': list(self.schemas.keys()),
            'quality_thresholds': {
                'high': 0.9,
                'medium': 0.7,
                'low': 0.5
            }
        }

