"""
Time Series Storage

Handles storage of time-series data for real-time analytics and historical analysis.
Optimized for high-frequency data ingestion and fast querying.
"""

from typing import Dict, List, Any, Optional
import logging
from datetime import datetime, timedelta
import asyncio
import json
from abc import ABC, abstractmethod

from ..architecture import DataRecord, DataSourceType


class TimeSeriesStorageInterface(ABC):
    """Abstract interface for time series storage implementations."""
    
    @abstractmethod
    async def store_records(self, records: List[DataRecord]) -> bool:
        """Store multiple data records."""
        pass
    
    @abstractmethod
    async def query_records(self, 
                          source_type: Optional[DataSourceType] = None,
                          start_time: Optional[datetime] = None,
                          end_time: Optional[datetime] = None,
                          filters: Optional[Dict[str, Any]] = None) -> List[DataRecord]:
        """Query records with time range and filters."""
        pass
    
    @abstractmethod
    async def get_latest_records(self, 
                               source_type: DataSourceType,
                               limit: int = 100) -> List[DataRecord]:
        """Get the most recent records for a source type."""
        pass


class TimeSeriesStorage(TimeSeriesStorageInterface):
    """
    Time series storage implementation using InfluxDB-like structure.
    
    This implementation provides a file-based storage system that can be
    easily replaced with actual time-series databases like InfluxDB,
    TimescaleDB, or AWS Timestream.
    """
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.logger = logging.getLogger("storage.timeseries")
        self.storage_path = config.get('storage_path', './data/timeseries')
        self.retention_days = config.get('retention_days', 90)
        self.batch_size = config.get('batch_size', 1000)
        
        # In-memory buffer for batching writes
        self.write_buffer: List[DataRecord] = []
        self.buffer_lock = asyncio.Lock()
        
        # Initialize storage
        self._initialize_storage()
    
    def _initialize_storage(self):
        """Initialize storage directories and configuration."""
        import os
        os.makedirs(self.storage_path, exist_ok=True)
        
        # Create subdirectories for each data source type
        for source_type in DataSourceType:
            source_path = os.path.join(self.storage_path, source_type.value)
            os.makedirs(source_path, exist_ok=True)
    
    async def store_records(self, records: List[DataRecord]) -> bool:
        """Store multiple data records with batching."""
        try:
            async with self.buffer_lock:
                self.write_buffer.extend(records)
                
                # Flush buffer if it's full
                if len(self.write_buffer) >= self.batch_size:
                    await self._flush_buffer()
            
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to store records: {e}")
            return False
    
    async def _flush_buffer(self):
        """Flush the write buffer to storage."""
        if not self.write_buffer:
            return
        
        try:
            # Group records by source type and date
            grouped_records = self._group_records_by_source_and_date(self.write_buffer)
            
            # Write each group to appropriate file
            for (source_type, date_str), group_records in grouped_records.items():
                await self._write_records_to_file(source_type, date_str, group_records)
            
            # Clear buffer
            self.write_buffer.clear()
            
            self.logger.info(f"Flushed {sum(len(group) for group in grouped_records.values())} records to storage")
            
        except Exception as e:
            self.logger.error(f"Failed to flush buffer: {e}")
    
    def _group_records_by_source_and_date(self, records: List[DataRecord]) -> Dict[tuple, List[DataRecord]]:
        """Group records by source type and date for efficient storage."""
        grouped = {}
        
        for record in records:
            source_type = record.source_type
            date_str = record.timestamp.strftime('%Y-%m-%d')
            key = (source_type, date_str)
            
            if key not in grouped:
                grouped[key] = []
            grouped[key].append(record)
        
        return grouped
    
    async def _write_records_to_file(self, source_type: DataSourceType, date_str: str, records: List[DataRecord]):
        """Write records to a date-partitioned file."""
        import os
        import aiofiles
        
        file_path = os.path.join(
            self.storage_path, 
            source_type.value, 
            f"{date_str}.jsonl"
        )\n        \n        # Convert records to JSON lines format\n        json_lines = []\n        for record in records:\n            record_dict = {\n                'timestamp': record.timestamp.isoformat(),\n                'source_type': record.source_type.value,\n                'game_id': record.game_id,\n                'team_id': record.team_id,\n                'player_id': record.player_id,\n                'data': record.data,\n                'quality': record.quality.value,\n                'metadata': record.metadata\n            }\n            json_lines.append(json.dumps(record_dict))\n        \n        # Append to file\n        try:\n            async with aiofiles.open(file_path, 'a', encoding='utf-8') as f:\n                await f.write('\\n'.join(json_lines) + '\\n')\n        except Exception as e:\n            self.logger.error(f\"Failed to write to file {file_path}: {e}\")\n    \n    async def query_records(self, \n                          source_type: Optional[DataSourceType] = None,\n                          start_time: Optional[datetime] = None,\n                          end_time: Optional[datetime] = None,\n                          filters: Optional[Dict[str, Any]] = None) -> List[DataRecord]:\n        \"\"\"Query records with time range and filters.\"\"\"\n        records = []\n        \n        try:\n            # Determine date range for file scanning\n            if start_time is None:\n                start_time = datetime.utcnow() - timedelta(days=7)\n            if end_time is None:\n                end_time = datetime.utcnow()\n            \n            # Determine source types to scan\n            source_types = [source_type] if source_type else list(DataSourceType)\n            \n            # Scan files for each source type and date\n            for src_type in source_types:\n                current_date = start_time.date()\n                end_date = end_time.date()\n                \n                while current_date <= end_date:\n                    date_str = current_date.strftime('%Y-%m-%d')\n                    file_records = await self._read_records_from_file(src_type, date_str)\n                    \n                    # Filter records by time range and additional filters\n                    filtered_records = self._filter_records(\n                        file_records, start_time, end_time, filters\n                    )\n                    records.extend(filtered_records)\n                    \n                    current_date += timedelta(days=1)\n            \n            self.logger.info(f\"Queried {len(records)} records\")\n            return records\n            \n        except Exception as e:\n            self.logger.error(f\"Failed to query records: {e}\")\n            return []\n    \n    async def _read_records_from_file(self, source_type: DataSourceType, date_str: str) -> List[DataRecord]:\n        \"\"\"Read records from a date-partitioned file.\"\"\"\n        import os\n        import aiofiles\n        from ..architecture import DataQuality\n        \n        file_path = os.path.join(\n            self.storage_path,\n            source_type.value,\n            f\"{date_str}.jsonl\"\n        )\n        \n        if not os.path.exists(file_path):\n            return []\n        \n        records = []\n        try:\n            async with aiofiles.open(file_path, 'r', encoding='utf-8') as f:\n                async for line in f:\n                    line = line.strip()\n                    if line:\n                        try:\n                            record_dict = json.loads(line)\n                            \n                            # Reconstruct DataRecord\n                            record = DataRecord(\n                                source_type=DataSourceType(record_dict['source_type']),\n                                timestamp=datetime.fromisoformat(record_dict['timestamp']),\n                                game_id=record_dict.get('game_id'),\n                                team_id=record_dict.get('team_id'),\n                                player_id=record_dict.get('player_id'),\n                                data=record_dict.get('data', {}),\n                                quality=DataQuality(record_dict.get('quality', 'medium')),\n                                metadata=record_dict.get('metadata', {})\n                            )\n                            records.append(record)\n                            \n                        except (json.JSONDecodeError, ValueError, KeyError) as e:\n                            self.logger.warning(f\"Failed to parse record from {file_path}: {e}\")\n                            \n        except Exception as e:\n            self.logger.error(f\"Failed to read file {file_path}: {e}\")\n        \n        return records\n    \n    def _filter_records(self, \n                       records: List[DataRecord],\n                       start_time: datetime,\n                       end_time: datetime,\n                       filters: Optional[Dict[str, Any]]) -> List[DataRecord]:\n        \"\"\"Filter records by time range and additional criteria.\"\"\"\n        filtered = []\n        \n        for record in records:\n            # Time range filter\n            if record.timestamp < start_time or record.timestamp > end_time:\n                continue\n            \n            # Additional filters\n            if filters:\n                if not self._record_matches_filters(record, filters):\n                    continue\n            \n            filtered.append(record)\n        \n        return filtered\n    \n    def _record_matches_filters(self, record: DataRecord, filters: Dict[str, Any]) -> bool:\n        \"\"\"Check if a record matches the given filters.\"\"\"\n        for key, value in filters.items():\n            if key == 'game_id' and record.game_id != value:\n                return False\n            elif key == 'team_id' and record.team_id != value:\n                return False\n            elif key == 'player_id' and record.player_id != value:\n                return False\n            elif key == 'data_type' and record.data.get('data_type') != value:\n                return False\n            elif key == 'quality' and record.quality.value != value:\n                return False\n        \n        return True\n    \n    async def get_latest_records(self, \n                               source_type: DataSourceType,\n                               limit: int = 100) -> List[DataRecord]:\n        \"\"\"Get the most recent records for a source type.\"\"\"\n        # Query recent records and sort by timestamp\n        end_time = datetime.utcnow()\n        start_time = end_time - timedelta(days=1)  # Look back 1 day\n        \n        records = await self.query_records(\n            source_type=source_type,\n            start_time=start_time,\n            end_time=end_time\n        )\n        \n        # Sort by timestamp (newest first) and limit\n        records.sort(key=lambda r: r.timestamp, reverse=True)\n        return records[:limit]\n    \n    async def cleanup_old_data(self):\n        \"\"\"Clean up data older than retention period.\"\"\"\n        import os\n        \n        cutoff_date = datetime.utcnow() - timedelta(days=self.retention_days)\n        deleted_files = 0\n        \n        try:\n            for source_type in DataSourceType:\n                source_path = os.path.join(self.storage_path, source_type.value)\n                \n                if os.path.exists(source_path):\n                    for filename in os.listdir(source_path):\n                        if filename.endswith('.jsonl'):\n                            # Extract date from filename\n                            date_str = filename.replace('.jsonl', '')\n                            try:\n                                file_date = datetime.strptime(date_str, '%Y-%m-%d')\n                                if file_date < cutoff_date:\n                                    file_path = os.path.join(source_path, filename)\n                                    os.remove(file_path)\n                                    deleted_files += 1\n                            except ValueError:\n                                # Skip files with invalid date format\n                                continue\n            \n            self.logger.info(f\"Cleaned up {deleted_files} old data files\")\n            \n        except Exception as e:\n            self.logger.error(f\"Failed to cleanup old data: {e}\")\n    \n    async def get_storage_stats(self) -> Dict[str, Any]:\n        \"\"\"Get storage statistics.\"\"\"\n        import os\n        \n        stats = {\n            'total_files': 0,\n            'total_size_bytes': 0,\n            'records_in_buffer': len(self.write_buffer),\n            'source_stats': {}\n        }\n        \n        try:\n            for source_type in DataSourceType:\n                source_path = os.path.join(self.storage_path, source_type.value)\n                source_stats = {\n                    'files': 0,\n                    'size_bytes': 0\n                }\n                \n                if os.path.exists(source_path):\n                    for filename in os.listdir(source_path):\n                        file_path = os.path.join(source_path, filename)\n                        if os.path.isfile(file_path):\n                            file_size = os.path.getsize(file_path)\n                            source_stats['files'] += 1\n                            source_stats['size_bytes'] += file_size\n                \n                stats['source_stats'][source_type.value] = source_stats\n                stats['total_files'] += source_stats['files']\n                stats['total_size_bytes'] += source_stats['size_bytes']\n        \n        except Exception as e:\n            self.logger.error(f\"Failed to get storage stats: {e}\")\n        \n        return stats\n    \n    async def force_flush(self):\n        \"\"\"Force flush the write buffer.\"\"\"\n        async with self.buffer_lock:\n            await self._flush_buffer()"

