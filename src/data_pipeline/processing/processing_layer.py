"""
Data Processing Layer

This module provides a flexible framework for processing data in batch and streaming modes.
"""

import abc
import logging
import time
from typing import Any, Dict, List, Optional, Union, Callable
import datetime
import threading
import queue
import pandas as pd

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class DataProcessor(abc.ABC):
    """Abstract base class for all data processors."""
    
    def __init__(self, name: str, config: Dict[str, Any] = None):
        """
        Initialize a data processor.
        
        Args:
            name: Unique identifier for the processor
            config: Configuration parameters for the processor
        """
        self.name = name
        self.config = config or {}
        self.last_process_time = None
        self.is_running = False
        logger.info(f"Initialized data processor: {name}")
    
    @abc.abstractmethod
    def process(self, data: Any, **kwargs) -> Any:
        """
        Process the data.
        
        Args:
            data: Data to process
            
        Returns:
            Processed data
        """
        pass
    
    def get_metadata(self) -> Dict[str, Any]:
        """
        Get metadata about the processor.
        
        Returns:
            Dictionary containing metadata about the processor
        """
        return {
            "name": self.name,
            "type": self.__class__.__name__,
            "last_process_time": self.last_process_time,
            "is_running": self.is_running,
            "config": self.config
        }


class BatchProcessor(DataProcessor):
    """Processor for batch data processing."""
    
    def process(self, data: Any, **kwargs) -> Any:
        """
        Process the data in batch mode.
        
        Args:
            data: Data to process
            
        Returns:
            Processed data
        """
        try:
            self.is_running = True
            
            # Get batch size from config or kwargs
            batch_size = kwargs.get("batch_size") or self.config.get("batch_size", 1000)
            
            # Convert data to DataFrame if it's not already
            if not isinstance(data, pd.DataFrame):
                try:
                    df = pd.DataFrame(data)
                except Exception as e:
                    logger.error(f"Error converting data to DataFrame: {str(e)}")
                    raise ValueError(f"Could not convert data to DataFrame: {str(e)}")
            else:
                df = data.copy()
            
            # Process the data in batches
            result = []
            for i in range(0, len(df), batch_size):
                batch = df.iloc[i:i+batch_size]
                processed_batch = self._process_batch(batch, **kwargs)
                result.append(processed_batch)
            
            # Combine the results
            if all(isinstance(r, pd.DataFrame) for r in result):
                result = pd.concat(result, ignore_index=True)
            
            self.last_process_time = datetime.datetime.now()
            
            return result
        except Exception as e:
            logger.error(f"Error in batch processor {self.name}: {str(e)}")
            raise
        finally:
            self.is_running = False
    
    def _process_batch(self, batch: pd.DataFrame, **kwargs) -> pd.DataFrame:
        """
        Process a batch of data.
        
        Args:
            batch: Batch of data to process
            
        Returns:
            Processed batch
        """
        # Default implementation just returns the batch
        # Subclasses should override this method
        return batch


class StreamProcessor(DataProcessor):
    """Processor for streaming data processing."""
    
    def __init__(self, name: str, config: Dict[str, Any] = None):
        """
        Initialize a stream processor.
        
        Args:
            name: Unique identifier for the processor
            config: Configuration parameters for the processor
        """
        super().__init__(name, config)
        self.input_queue = queue.Queue()
        self.output_queue = queue.Queue()
        self.processing_thread = None
        self.stop_event = threading.Event()
    
    def process(self, data: Any, **kwargs) -> Any:
        """
        Process the data in streaming mode.
        
        Args:
            data: Data to process
            
        Returns:
            Processed data
        """
        try:
            # Add data to the input queue
            self.input_queue.put(data)
            
            # If the processor is not running, start it
            if not self.is_running:
                self.start()
            
            # Get the result from the output queue if wait_for_result is True
            wait_for_result = kwargs.get("wait_for_result", False)
            if wait_for_result:
                timeout = kwargs.get("timeout", 10)
                try:
                    result = self.output_queue.get(timeout=timeout)
                    return result
                except queue.Empty:
                    logger.warning(f"Timeout waiting for result from stream processor {self.name}")
                    return None
            
            return None
        except Exception as e:
            logger.error(f"Error in stream processor {self.name}: {str(e)}")
            raise
    
    def start(self) -> None:
        """Start the stream processor."""
        if self.is_running:
            logger.warning(f"Stream processor {self.name} is already running")
            return
        
        self.stop_event.clear()
        self.processing_thread = threading.Thread(target=self._process_stream)
        self.processing_thread.daemon = True
        self.processing_thread.start()
        self.is_running = True
        logger.info(f"Started stream processor {self.name}")
    
    def stop(self) -> None:
        """Stop the stream processor."""
        if not self.is_running:
            logger.warning(f"Stream processor {self.name} is not running")
            return
        
        self.stop_event.set()
        if self.processing_thread:
            self.processing_thread.join(timeout=5)
        self.is_running = False
        logger.info(f"Stopped stream processor {self.name}")
    
    def _process_stream(self) -> None:
        """Process the data stream."""
        while not self.stop_event.is_set():
            try:
                # Get data from the input queue with a timeout
                try:
                    data = self.input_queue.get(timeout=0.1)
                except queue.Empty:
                    continue
                
                # Process the data
                result = self._process_item(data)
                
                # Put the result in the output queue
                self.output_queue.put(result)
                
                # Update the last process time
                self.last_process_time = datetime.datetime.now()
                
                # Mark the task as done
                self.input_queue.task_done()
            except Exception as e:
                logger.error(f"Error in stream processor {self.name}: {str(e)}")
    
    def _process_item(self, item: Any) -> Any:
        """
        Process a single item from the stream.
        
        Args:
            item: Item to process
            
        Returns:
            Processed item
        """
        # Default implementation just returns the item
        # Subclasses should override this method
        return item


class DataAggregator(BatchProcessor):
    """Processor for aggregating data."""
    
    def _process_batch(self, batch: pd.DataFrame, **kwargs) -> pd.DataFrame:
        """
        Aggregate a batch of data.
        
        Args:
            batch: Batch of data to aggregate
            
        Returns:
            Aggregated batch
        """
        # Get aggregation parameters from config or kwargs
        group_by = kwargs.get("group_by") or self.config.get("group_by", [])
        aggregations = kwargs.get("aggregations") or self.config.get("aggregations", {})
        
        if not group_by or not aggregations:
            logger.warning("No group_by or aggregations specified, returning original batch")
            return batch
        
        # Perform the aggregation
        try:
            result = batch.groupby(group_by).agg(aggregations).reset_index()
            logger.info(f"Aggregated data by {group_by} with aggregations {aggregations}")
            return result
        except Exception as e:
            logger.error(f"Error aggregating data: {str(e)}")
            return batch


class DataFilter(BatchProcessor):
    """Processor for filtering data."""
    
    def _process_batch(self, batch: pd.DataFrame, **kwargs) -> pd.DataFrame:
        """
        Filter a batch of data.
        
        Args:
            batch: Batch of data to filter
            
        Returns:
            Filtered batch
        """
        # Get filter parameters from config or kwargs
        filter_expr = kwargs.get("filter_expr") or self.config.get("filter_expr")
        
        if not filter_expr:
            logger.warning("No filter expression specified, returning original batch")
            return batch
        
        # Perform the filtering
        try:
            result = batch.query(filter_expr)
            logger.info(f"Filtered data with expression: {filter_expr}")
            return result
        except Exception as e:
            logger.error(f"Error filtering data: {str(e)}")
            return batch


class DataJoiner(BatchProcessor):
    """Processor for joining data."""
    
    def _process_batch(self, batch: pd.DataFrame, **kwargs) -> pd.DataFrame:
        """
        Join a batch of data with another DataFrame.
        
        Args:
            batch: Batch of data to join
            
        Returns:
            Joined batch
        """
        # Get join parameters from config or kwargs
        right = kwargs.get("right") or self.config.get("right")
        how = kwargs.get("how") or self.config.get("how", "inner")
        on = kwargs.get("on") or self.config.get("on")
        left_on = kwargs.get("left_on") or self.config.get("left_on")
        right_on = kwargs.get("right_on") or self.config.get("right_on")
        
        if right is None:
            logger.warning("No right DataFrame specified for join, returning original batch")
            return batch
        
        # Convert right to DataFrame if it's not already
        if not isinstance(right, pd.DataFrame):
            try:
                right = pd.DataFrame(right)
            except Exception as e:
                logger.error(f"Error converting right to DataFrame: {str(e)}")
                return batch
        
        # Perform the join
        try:
            if on is not None:
                result = batch.merge(right, on=on, how=how)
                logger.info(f"Joined data on {on} with {how} join")
            elif left_on is not None and right_on is not None:
                result = batch.merge(right, left_on=left_on, right_on=right_on, how=how)
                logger.info(f"Joined data with left_on={left_on}, right_on={right_on}, how={how}")
            else:
                logger.warning("No join keys specified, returning original batch")
                return batch
            
            return result
        except Exception as e:
            logger.error(f"Error joining data: {str(e)}")
            return batch


class DataEnricher(BatchProcessor):
    """Processor for enriching data with additional information."""
    
    def _process_batch(self, batch: pd.DataFrame, **kwargs) -> pd.DataFrame:
        """
        Enrich a batch of data.
        
        Args:
            batch: Batch of data to enrich
            
        Returns:
            Enriched batch
        """
        # Get enrichment parameters from config or kwargs
        enrichment_fn = kwargs.get("enrichment_fn") or self.config.get("enrichment_fn")
        
        if enrichment_fn is None:
            logger.warning("No enrichment function specified, returning original batch")
            return batch
        
        if not callable(enrichment_fn):
            logger.error("Specified enrichment_fn is not callable")
            return batch
        
        # Perform the enrichment
        try:
            result = enrichment_fn(batch)
            logger.info("Enriched data with custom function")
            return result
        except Exception as e:
            logger.error(f"Error enriching data: {str(e)}")
            return batch


class WindowedAggregator(StreamProcessor):
    """Processor for windowed aggregation of streaming data."""
    
    def __init__(self, name: str, config: Dict[str, Any] = None):
        """
        Initialize a windowed aggregator.
        
        Args:
            name: Unique identifier for the processor
            config: Configuration parameters for the processor
        """
        super().__init__(name, config)
        self.window_size = self.config.get("window_size", 60)  # Window size in seconds
        self.slide_interval = self.config.get("slide_interval", 10)  # Slide interval in seconds
        self.group_by = self.config.get("group_by", [])
        self.aggregations = self.config.get("aggregations", {})
        self.window_data = []
        self.last_window_time = time.time()
    
    def _process_item(self, item: Any) -> Any:
        """
        Process a single item from the stream.
        
        Args:
            item: Item to process
            
        Returns:
            Processed item
        """
        # Add the item to the window
        self.window_data.append(item)
        
        # Check if it's time to process the window
        current_time = time.time()
        if current_time - self.last_window_time >= self.slide_interval:
            # Process the window
            result = self._process_window()
            
            # Update the last window time
            self.last_window_time = current_time
            
            # Remove old data from the window
            self._prune_window()
            
            return result
        
        return None
    
    def _process_window(self) -> pd.DataFrame:
        """
        Process the current window of data.
        
        Returns:
            Aggregated window data
        """
        if not self.window_data:
            return pd.DataFrame()
        
        # Convert window data to DataFrame
        try:
            df = pd.DataFrame(self.window_data)
        except Exception as e:
            logger.error(f"Error converting window data to DataFrame: {str(e)}")
            return pd.DataFrame()
        
        # Perform the aggregation
        if not self.group_by or not self.aggregations:
            return df
        
        try:
            result = df.groupby(self.group_by).agg(self.aggregations).reset_index()
            logger.info(f"Aggregated window data by {self.group_by} with aggregations {self.aggregations}")
            return result
        except Exception as e:
            logger.error(f"Error aggregating window data: {str(e)}")
            return df
    
    def _prune_window(self) -> None:
        """Remove old data from the window."""
        if not self.window_data:
            return
        
        # Keep only data within the window size
        current_time = time.time()
        
        # If the data has a timestamp field, use it for pruning
        timestamp_field = self.config.get("timestamp_field")
        if timestamp_field:
            try:
                self.window_data = [
                    item for item in self.window_data
                    if current_time - item.get(timestamp_field, 0) <= self.window_size
                ]
            except Exception as e:
                logger.error(f"Error pruning window data by timestamp: {str(e)}")
                # Fall back to keeping all data
        else:
            # If no timestamp field is specified, just keep the last window_size seconds of data
            # This is a simplification and assumes data arrives in order
            self.window_data = self.window_data[-self.config.get("max_window_items", 1000):]


class ProcessingPipeline:
    """Pipeline for applying multiple processors in sequence."""
    
    def __init__(self, name: str, mode: str = "batch"):
        """
        Initialize a processing pipeline.
        
        Args:
            name: Unique identifier for the pipeline
            mode: Processing mode (batch or stream)
        """
        self.name = name
        self.mode = mode
        self.processors = []
        logger.info(f"Initialized {mode} processing pipeline: {name}")
    
    def add_processor(self, processor: DataProcessor, position: int = None) -> None:
        """
        Add a processor to the pipeline.
        
        Args:
            processor: Processor to add
            position: Position to insert the processor (None to append)
        """
        if position is None:
            self.processors.append(processor)
            logger.info(f"Added processor {processor.name} to pipeline {self.name}")
        else:
            self.processors.insert(position, processor)
            logger.info(f"Inserted processor {processor.name} at position {position} in pipeline {self.name}")
    
    def remove_processor(self, name: str) -> bool:
        """
        Remove a processor from the pipeline.
        
        Args:
            name: Name of the processor to remove
            
        Returns:
            True if the processor was removed, False otherwise
        """
        for i, processor in enumerate(self.processors):
            if processor.name == name:
                del self.processors[i]
                logger.info(f"Removed processor {name} from pipeline {self.name}")
                return True
        
        logger.warning(f"Processor {name} not found in pipeline {self.name}")
        return False
    
    def process(self, data: Any, **kwargs) -> Any:
        """
        Apply all processors in the pipeline.
        
        Args:
            data: Data to process
            
        Returns:
            Processed data
        """
        result = data
        
        for processor in self.processors:
            try:
                logger.info(f"Applying processor {processor.name} in pipeline {self.name}")
                result = processor.process(result, **kwargs)
            except Exception as e:
                logger.error(f"Error in processor {processor.name}: {str(e)}")
                if kwargs.get("fail_fast", True):
                    raise
        
        return result
    
    def start(self) -> None:
        """Start the pipeline (for streaming mode)."""
        if self.mode != "stream":
            logger.warning(f"Cannot start pipeline {self.name} in {self.mode} mode")
            return
        
        for processor in self.processors:
            if isinstance(processor, StreamProcessor):
                processor.start()
        
        logger.info(f"Started stream processing pipeline {self.name}")
    
    def stop(self) -> None:
        """Stop the pipeline (for streaming mode)."""
        if self.mode != "stream":
            logger.warning(f"Cannot stop pipeline {self.name} in {self.mode} mode")
            return
        
        for processor in self.processors:
            if isinstance(processor, StreamProcessor):
                processor.stop()
        
        logger.info(f"Stopped stream processing pipeline {self.name}")
    
    def get_processor(self, name: str) -> Optional[DataProcessor]:
        """
        Get a processor by name.
        
        Args:
            name: Name of the processor
            
        Returns:
            Processor if found, None otherwise
        """
        for processor in self.processors:
            if processor.name == name:
                return processor
        
        return None
    
    def list_processors(self) -> List[str]:
        """
        List all processors in the pipeline.
        
        Returns:
            List of processor names
        """
        return [processor.name for processor in self.processors]
    
    @property
    def config(self) -> Dict[str, Any]:
        """
        Get the pipeline configuration.
        
        Returns:
            Dictionary containing the pipeline configuration
        """
        return {
            "name": self.name,
            "mode": self.mode,
            "processors": [processor.get_metadata() for processor in self.processors],
        }


class ProcessingManager:
    """Manager for data processing pipelines."""
    
    def __init__(self):
        """Initialize the processing manager."""
        self.pipelines = {}
        logger.info("Initialized processing manager")
    
    def create_pipeline(self, name: str, mode: str = "batch") -> ProcessingPipeline:
        """
        Create a new processing pipeline.
        
        Args:
            name: Unique identifier for the pipeline
            mode: Processing mode (batch or stream)
            
        Returns:
            New processing pipeline
        """
        if name in self.pipelines:
            logger.warning(f"Pipeline {name} already exists, returning existing pipeline")
            return self.pipelines[name]
        
        pipeline = ProcessingPipeline(name, mode)
        self.pipelines[name] = pipeline
        logger.info(f"Created {mode} processing pipeline: {name}")
        
        return pipeline
    
    def get_pipeline(self, name: str) -> Optional[ProcessingPipeline]:
        """
        Get a pipeline by name.
        
        Args:
            name: Name of the pipeline
            
        Returns:
            Pipeline if found, None otherwise
        """
        return self.pipelines.get(name)
    
    def list_pipelines(self) -> List[str]:
        """
        List all pipelines.
        
        Returns:
            List of pipeline names
        """
        return list(self.pipelines.keys())
    
    def process(self, data: Any, pipeline_name: str, **kwargs) -> Any:
        """
        Process data using a specific pipeline.
        
        Args:
            data: Data to process
            pipeline_name: Name of the pipeline to use
            
        Returns:
            Processed data
        """
        pipeline = self.get_pipeline(pipeline_name)
        
        if not pipeline:
            logger.error(f"Pipeline not found: {pipeline_name}")
            raise ValueError(f"Pipeline not found: {pipeline_name}")
        
        try:
            result = pipeline.process(data, **kwargs)
            logger.info(f"Successfully processed data using pipeline {pipeline_name}")
            return result
        except Exception as e:
            logger.error(f"Error processing data using pipeline {pipeline_name}: {str(e)}")
            raise
    
    def start_pipeline(self, pipeline_name: str) -> bool:
        """
        Start a streaming pipeline.
        
        Args:
            pipeline_name: Name of the pipeline to start
            
        Returns:
            True if the pipeline was started, False otherwise
        """
        pipeline = self.get_pipeline(pipeline_name)
        
        if not pipeline:
            logger.error(f"Pipeline not found: {pipeline_name}")
            return False
        
        if pipeline.mode != "stream":
            logger.warning(f"Cannot start pipeline {pipeline_name} in {pipeline.mode} mode")
            return False
        
        try:
            pipeline.start()
            logger.info(f"Started stream processing pipeline {pipeline_name}")
            return True
        except Exception as e:
            logger.error(f"Error starting pipeline {pipeline_name}: {str(e)}")
            return False
    
    def stop_pipeline(self, pipeline_name: str) -> bool:
        """
        Stop a streaming pipeline.
        
        Args:
            pipeline_name: Name of the pipeline to stop
            
        Returns:
            True if the pipeline was stopped, False otherwise
        """
        pipeline = self.get_pipeline(pipeline_name)
        
        if not pipeline:
            logger.error(f"Pipeline not found: {pipeline_name}")
            return False
        
        if pipeline.mode != "stream":
            logger.warning(f"Cannot stop pipeline {pipeline_name} in {pipeline.mode} mode")
            return False
        
        try:
            pipeline.stop()
            logger.info(f"Stopped stream processing pipeline {pipeline_name}")
            return True
        except Exception as e:
            logger.error(f"Error stopping pipeline {pipeline_name}: {str(e)}")
            return False

