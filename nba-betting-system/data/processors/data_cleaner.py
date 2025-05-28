"""
Data Cleaner

Cleans and standardizes data records by handling missing values,
outliers, and data inconsistencies.
"""

from typing import Dict, List, Any, Optional, Union
import logging
from datetime import datetime
import numpy as np
import pandas as pd
from statistics import median, mean

from ..architecture import DataProcessor, DataRecord, DataQuality, DataSourceType


class DataCleaner(DataProcessor):
    """Processor for cleaning and standardizing data records."""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.logger = logging.getLogger("processor.cleaner")
        self.processing_stats = {
            'records_processed': 0,
            'records_cleaned': 0,
            'outliers_detected': 0,
            'missing_values_handled': 0,
            'duplicates_removed': 0
        }
        
    def process(self, records: List[DataRecord]) -> List[DataRecord]:
        """Clean and standardize data records."""
        cleaned_records = []
        
        for record in records:
            try:
                cleaned_record = self._clean_record(record)
                if cleaned_record:
                    cleaned_records.append(cleaned_record)
                    self.processing_stats['records_cleaned'] += 1
                
                self.processing_stats['records_processed'] += 1
                
            except Exception as e:
                self.logger.error(f"Failed to clean record {record.metadata.get('record_id')}: {e}")
        
        # Remove duplicates
        cleaned_records = self._remove_duplicates(cleaned_records)
        
        self.logger.info(f"Cleaned {len(cleaned_records)} records from {len(records)} input records")
        
        return cleaned_records
    
    def _clean_record(self, record: DataRecord) -> Optional[DataRecord]:
        """Clean an individual data record."""
        # Skip invalid records
        if record.quality == DataQuality.INVALID:
            return None
        
        # Clean based on source type
        if record.source_type == DataSourceType.NBA_API:
            return self._clean_nba_record(record)
        elif record.source_type == DataSourceType.BETTING_ODDS:
            return self._clean_betting_record(record)
        elif record.source_type == DataSourceType.INJURY_REPORTS:
            return self._clean_injury_record(record)
        else:
            return self._clean_generic_record(record)
    
    def _clean_nba_record(self, record: DataRecord) -> Optional[DataRecord]:
        """Clean NBA API data records."""
        data_type = record.data.get('data_type')
        
        if data_type == 'player_stats':
            return self._clean_player_stats(record)
        elif data_type == 'team_stats':
            return self._clean_team_stats(record)
        elif data_type == 'game_data':
            return self._clean_game_data(record)
        else:
            return self._clean_generic_record(record)
    
    def _clean_player_stats(self, record: DataRecord) -> Optional[DataRecord]:
        """Clean player statistics data."""
        player_stats = record.data.get('player_stats', {})\n        \n        # Handle missing values in numeric fields\n        numeric_fields = ['GP', 'MIN', 'PTS', 'REB', 'AST', 'STL', 'BLK', 'TOV', \n                         'FGM', 'FGA', 'FG_PCT', 'FG3M', 'FG3A', 'FG3_PCT', \n                         'FTM', 'FTA', 'FT_PCT', 'OREB', 'DREB']\n        \n        for field in numeric_fields:\n            if field in player_stats:\n                value = player_stats[field]\n                if value is None or value == '' or (isinstance(value, str) and value.strip() == ''):\n                    player_stats[field] = 0.0\n                else:\n                    try:\n                        player_stats[field] = float(value)\n                    except (ValueError, TypeError):\n                        player_stats[field] = 0.0\n                        self.processing_stats['missing_values_handled'] += 1\n        \n        # Validate and clean percentage fields\n        percentage_fields = ['FG_PCT', 'FG3_PCT', 'FT_PCT']\n        for field in percentage_fields:\n            if field in player_stats:\n                value = player_stats[field]\n                if isinstance(value, (int, float)):\n                    # Ensure percentages are between 0 and 1\n                    if value > 1.0:\n                        player_stats[field] = value / 100.0\n                    elif value < 0:\n                        player_stats[field] = 0.0\n        \n        # Detect outliers in key statistics\n        outlier_thresholds = {\n            'PTS': (0, 100),  # Points per game\n            'REB': (0, 30),   # Rebounds per game\n            'AST': (0, 20),   # Assists per game\n            'MIN': (0, 48),   # Minutes per game\n            'GP': (0, 82)     # Games played\n        }\n        \n        for field, (min_val, max_val) in outlier_thresholds.items():\n            if field in player_stats:\n                value = player_stats[field]\n                if isinstance(value, (int, float)):\n                    if value < min_val or value > max_val:\n                        self.logger.warning(f\"Outlier detected in {field}: {value} for player {player_stats.get('PLAYER_NAME')}\")\n                        self.processing_stats['outliers_detected'] += 1\n                        # Cap the value at the threshold\n                        player_stats[field] = max(min_val, min(value, max_val))\n        \n        # Update the record\n        record.data['player_stats'] = player_stats\n        \n        return record\n    \n    def _clean_team_stats(self, record: DataRecord) -> Optional[DataRecord]:\n        \"\"\"Clean team statistics data.\"\"\"\n        team_stats = record.data.get('team_stats', {})\n        \n        # Handle missing values in numeric fields\n        numeric_fields = ['GP', 'W', 'L', 'W_PCT', 'MIN', 'PTS', 'FGM', 'FGA', 'FG_PCT',\n                         'FG3M', 'FG3A', 'FG3_PCT', 'FTM', 'FTA', 'FT_PCT', 'OREB', 'DREB',\n                         'REB', 'AST', 'TOV', 'STL', 'BLK', 'BLKA', 'PF', 'PFD', 'PLUS_MINUS']\n        \n        for field in numeric_fields:\n            if field in team_stats:\n                value = team_stats[field]\n                if value is None or value == '' or (isinstance(value, str) and value.strip() == ''):\n                    team_stats[field] = 0.0\n                else:\n                    try:\n                        team_stats[field] = float(value)\n                    except (ValueError, TypeError):\n                        team_stats[field] = 0.0\n                        self.processing_stats['missing_values_handled'] += 1\n        \n        # Validate win percentage\n        if 'W_PCT' in team_stats and isinstance(team_stats['W_PCT'], (int, float)):\n            if team_stats['W_PCT'] > 1.0:\n                team_stats['W_PCT'] = team_stats['W_PCT'] / 100.0\n            elif team_stats['W_PCT'] < 0:\n                team_stats['W_PCT'] = 0.0\n        \n        # Calculate derived statistics if missing\n        if 'W' in team_stats and 'L' in team_stats and 'GP' in team_stats:\n            calculated_gp = team_stats['W'] + team_stats['L']\n            if team_stats['GP'] == 0 and calculated_gp > 0:\n                team_stats['GP'] = calculated_gp\n            \n            # Calculate win percentage if missing\n            if team_stats.get('W_PCT', 0) == 0 and team_stats['GP'] > 0:\n                team_stats['W_PCT'] = team_stats['W'] / team_stats['GP']\n        \n        # Update the record\n        record.data['team_stats'] = team_stats\n        \n        return record\n    \n    def _clean_game_data(self, record: DataRecord) -> Optional[DataRecord]:\n        \"\"\"Clean game data records.\"\"\"\n        game_header = record.data.get('game_header', {})\n        \n        # Ensure game IDs are strings\n        for id_field in ['GAME_ID', 'HOME_TEAM_ID', 'VISITOR_TEAM_ID']:\n            if id_field in game_header:\n                game_header[id_field] = str(game_header[id_field])\n        \n        # Clean game status\n        if 'GAME_STATUS_TEXT' in game_header:\n            status = game_header['GAME_STATUS_TEXT']\n            if isinstance(status, str):\n                game_header['GAME_STATUS_TEXT'] = status.strip().upper()\n        \n        # Validate game date\n        if 'GAME_DATE_EST' in game_header:\n            game_date = game_header['GAME_DATE_EST']\n            if isinstance(game_date, str):\n                try:\n                    # Try to parse and reformat the date\n                    parsed_date = datetime.strptime(game_date, '%Y-%m-%d')\n                    game_header['GAME_DATE_EST'] = parsed_date.strftime('%Y-%m-%d')\n                except ValueError:\n                    self.logger.warning(f\"Invalid game date format: {game_date}\")\n        \n        # Update the record\n        record.data['game_header'] = game_header\n        \n        return record\n    \n    def _clean_betting_record(self, record: DataRecord) -> Optional[DataRecord]:\n        \"\"\"Clean betting odds data records.\"\"\"\n        data = record.data\n        \n        # Clean outcomes data\n        if 'outcomes' in data and isinstance(data['outcomes'], list):\n            cleaned_outcomes = []\n            for outcome in data['outcomes']:\n                if isinstance(outcome, dict) and 'name' in outcome and 'price' in outcome:\n                    # Validate price\n                    try:\n                        price = float(outcome['price'])\n                        # American odds validation\n                        if abs(price) < 100 and price != 0:\n                            self.logger.warning(f\"Unusual odds value: {price}\")\n                        \n                        cleaned_outcome = {\n                            'name': str(outcome['name']).strip(),\n                            'price': price\n                        }\n                        \n                        # Handle point spreads\n                        if 'point' in outcome and outcome['point'] is not None:\n                            cleaned_outcome['point'] = float(outcome['point'])\n                        \n                        cleaned_outcomes.append(cleaned_outcome)\n                        \n                    except (ValueError, TypeError):\n                        self.logger.warning(f\"Invalid odds price: {outcome.get('price')}\")\n                        self.processing_stats['missing_values_handled'] += 1\n            \n            data['outcomes'] = cleaned_outcomes\n        \n        # Clean team names\n        if 'game_info' in data:\n            game_info = data['game_info']\n            for team_field in ['home_team', 'away_team']:\n                if team_field in game_info and isinstance(game_info[team_field], str):\n                    game_info[team_field] = game_info[team_field].strip()\n        \n        return record\n    \n    def _clean_injury_record(self, record: DataRecord) -> Optional[DataRecord]:\n        \"\"\"Clean injury report data records.\"\"\"\n        data = record.data\n        \n        # Standardize player and team names\n        if 'player_name' in data and isinstance(data['player_name'], str):\n            data['player_name'] = data['player_name'].strip()\n        \n        if 'team_name' in data and isinstance(data['team_name'], str):\n            data['team_name'] = data['team_name'].strip()\n        \n        # Standardize injury status\n        if 'injury_status' in data and isinstance(data['injury_status'], str):\n            status = data['injury_status'].lower().strip()\n            # Map common variations to standard terms\n            status_mapping = {\n                'out': 'out',\n                'o': 'out',\n                'doubtful': 'doubtful',\n                'd': 'doubtful',\n                'questionable': 'questionable',\n                'q': 'questionable',\n                'probable': 'probable',\n                'p': 'probable',\n                'gtd': 'game_time_decision',\n                'game time decision': 'game_time_decision',\n                'available': 'available',\n                'healthy': 'available'\n            }\n            data['injury_status'] = status_mapping.get(status, status)\n        \n        # Validate impact score\n        if 'impact_score' in data:\n            try:\n                impact_score = float(data['impact_score'])\n                data['impact_score'] = max(0.0, min(1.0, impact_score))\n            except (ValueError, TypeError):\n                data['impact_score'] = 0.0\n                self.processing_stats['missing_values_handled'] += 1\n        \n        # Validate parsed injury data\n        if 'parsed_injury' in data and isinstance(data['parsed_injury'], dict):\n            parsed = data['parsed_injury']\n            \n            # Validate severity score\n            if 'severity_score' in parsed:\n                try:\n                    severity = int(parsed['severity_score'])\n                    parsed['severity_score'] = max(0, min(4, severity))\n                except (ValueError, TypeError):\n                    parsed['severity_score'] = 0\n        \n        return record\n    \n    def _clean_generic_record(self, record: DataRecord) -> Optional[DataRecord]:\n        \"\"\"Clean generic data records.\"\"\"\n        # Basic cleaning for unknown record types\n        \n        # Ensure timestamp is valid\n        if not record.timestamp:\n            record.timestamp = datetime.utcnow()\n        \n        # Ensure metadata exists\n        if not record.metadata:\n            record.metadata = {}\n        \n        if 'ingestion_time' not in record.metadata:\n            record.metadata['ingestion_time'] = datetime.utcnow()\n        \n        if 'record_id' not in record.metadata:\n            record.metadata['record_id'] = f\"{record.source_type.value}_{record.timestamp.isoformat()}\"\n        \n        return record\n    \n    def _remove_duplicates(self, records: List[DataRecord]) -> List[DataRecord]:\n        \"\"\"Remove duplicate records based on record ID and content hash.\"\"\"\n        seen_records = set()\n        unique_records = []\n        \n        for record in records:\n            # Create a unique identifier for the record\n            record_id = record.metadata.get('record_id')\n            content_hash = self._calculate_content_hash(record)\n            \n            unique_key = f\"{record_id}_{content_hash}\"\n            \n            if unique_key not in seen_records:\n                seen_records.add(unique_key)\n                unique_records.append(record)\n            else:\n                self.processing_stats['duplicates_removed'] += 1\n        \n        return unique_records\n    \n    def _calculate_content_hash(self, record: DataRecord) -> str:\n        \"\"\"Calculate a hash of the record content for duplicate detection.\"\"\"\n        import hashlib\n        import json\n        \n        # Create a simplified representation for hashing\n        content = {\n            'source_type': record.source_type.value,\n            'game_id': record.game_id,\n            'team_id': record.team_id,\n            'player_id': record.player_id,\n            'data_type': record.data.get('data_type'),\n            'timestamp_hour': record.timestamp.replace(minute=0, second=0, microsecond=0).isoformat()\n        }\n        \n        content_str = json.dumps(content, sort_keys=True)\n        return hashlib.md5(content_str.encode()).hexdigest()[:8]\n    \n    def get_processing_stats(self) -> Dict[str, Any]:\n        \"\"\"Return processing statistics.\"\"\"\n        return {\n            'processor_type': 'data_cleaner',\n            'stats': self.processing_stats.copy(),\n            'success_rate': (\n                self.processing_stats['records_cleaned'] / \n                max(1, self.processing_stats['records_processed'])\n            )\n        }"

