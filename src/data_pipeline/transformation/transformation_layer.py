"""
Data Transformation and Cleaning Layer

This module provides a flexible framework for transforming and cleaning data
from various sources.
"""

import abc
import logging
from typing import Any, Dict, List, Optional, Union, Callable
import datetime
import pandas as pd
import numpy as np

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class Transformer(abc.ABC):
    """Abstract base class for all data transformers."""
    
    def __init__(self, name: str, config: Dict[str, Any] = None):
        """
        Initialize a transformer.
        
        Args:
            name: Unique identifier for the transformer
            config: Configuration parameters for the transformer
        """
        self.name = name
        self.config = config or {}
        self.last_transform_time = None
        logger.info(f"Initialized transformer: {name}")
    
    @abc.abstractmethod
    def transform(self, data: Any, **kwargs) -> Any:
        """
        Transform the data.
        
        Args:
            data: Data to transform
            
        Returns:
            Transformed data
        """
        pass
    
    def get_metadata(self) -> Dict[str, Any]:
        """
        Get metadata about the transformer.
        
        Returns:
            Dictionary containing metadata about the transformer
        """
        return {
            "name": self.name,
            "type": self.__class__.__name__,
            "last_transform_time": self.last_transform_time,
            "config": self.config
        }


class DataFrameTransformer(Transformer):
    """Base class for transformers that operate on pandas DataFrames."""
    
    def transform(self, data: Union[pd.DataFrame, Dict, List], **kwargs) -> pd.DataFrame:
        """
        Transform the data.
        
        Args:
            data: Data to transform, can be a DataFrame, dictionary, or list
            
        Returns:
            Transformed DataFrame
        """
        # Convert data to DataFrame if it's not already
        if not isinstance(data, pd.DataFrame):
            try:
                df = pd.DataFrame(data)
            except Exception as e:
                logger.error(f"Error converting data to DataFrame: {str(e)}")
                raise ValueError(f"Could not convert data to DataFrame: {str(e)}")
        else:
            df = data.copy()
        
        # Apply the transformation
        try:
            result = self._transform_dataframe(df, **kwargs)
            self.last_transform_time = datetime.datetime.now()
            return result
        except Exception as e:
            logger.error(f"Error in transformer {self.name}: {str(e)}")
            raise
    
    @abc.abstractmethod
    def _transform_dataframe(self, df: pd.DataFrame, **kwargs) -> pd.DataFrame:
        """
        Transform the DataFrame.
        
        Args:
            df: DataFrame to transform
            
        Returns:
            Transformed DataFrame
        """
        pass


class MissingValueHandler(DataFrameTransformer):
    """Transformer for handling missing values in a DataFrame."""
    
    def _transform_dataframe(self, df: pd.DataFrame, **kwargs) -> pd.DataFrame:
        """
        Handle missing values in the DataFrame.
        
        Args:
            df: DataFrame to transform
            
        Returns:
            DataFrame with missing values handled
        """
        strategy = self.config.get("strategy", "drop")
        columns = self.config.get("columns", df.columns)
        
        if isinstance(columns, str):
            columns = [columns]
        
        if strategy == "drop":
            # Drop rows with missing values
            subset = columns if columns else None
            df = df.dropna(subset=subset)
            logger.info(f"Dropped rows with missing values in columns: {columns}")
        
        elif strategy == "fill":
            # Fill missing values
            fill_value = self.config.get("fill_value")
            method = self.config.get("method")
            
            for col in columns:
                if col in df.columns:
                    if method:
                        # Use method like ffill or bfill
                        df[col] = df[col].fillna(method=method)
                        logger.info(f"Filled missing values in column {col} using method: {method}")
                    elif fill_value is not None:
                        # Use specified fill value
                        df[col] = df[col].fillna(fill_value)
                        logger.info(f"Filled missing values in column {col} with value: {fill_value}")
                    else:
                        # Use column mean, median, or mode based on data type
                        if np.issubdtype(df[col].dtype, np.number):
                            fill = df[col].mean()
                            df[col] = df[col].fillna(fill)
                            logger.info(f"Filled missing values in column {col} with mean: {fill}")
                        else:
                            fill = df[col].mode()[0] if not df[col].mode().empty else None
                            if fill is not None:
                                df[col] = df[col].fillna(fill)
                                logger.info(f"Filled missing values in column {col} with mode: {fill}")
        
        elif strategy == "interpolate":
            # Interpolate missing values
            method = self.config.get("method", "linear")
            for col in columns:
                if col in df.columns and np.issubdtype(df[col].dtype, np.number):
                    df[col] = df[col].interpolate(method=method)
                    logger.info(f"Interpolated missing values in column {col} using method: {method}")
        
        return df


class OutlierHandler(DataFrameTransformer):
    """Transformer for handling outliers in a DataFrame."""
    
    def _transform_dataframe(self, df: pd.DataFrame, **kwargs) -> pd.DataFrame:
        """
        Handle outliers in the DataFrame.
        
        Args:
            df: DataFrame to transform
            
        Returns:
            DataFrame with outliers handled
        """
        strategy = self.config.get("strategy", "clip")
        columns = self.config.get("columns", [col for col in df.columns if np.issubdtype(df[col].dtype, np.number)])
        
        if isinstance(columns, str):
            columns = [columns]
        
        for col in columns:
            if col in df.columns and np.issubdtype(df[col].dtype, np.number):
                if strategy == "clip":
                    # Clip values outside of specified range
                    lower = self.config.get("lower_quantile", 0.01)
                    upper = self.config.get("upper_quantile", 0.99)
                    
                    lower_bound = df[col].quantile(lower)
                    upper_bound = df[col].quantile(upper)
                    
                    df[col] = df[col].clip(lower_bound, upper_bound)
                    logger.info(f"Clipped outliers in column {col} to range [{lower_bound}, {upper_bound}]")
                
                elif strategy == "remove":
                    # Remove rows with outliers
                    lower = self.config.get("lower_quantile", 0.01)
                    upper = self.config.get("upper_quantile", 0.99)
                    
                    lower_bound = df[col].quantile(lower)
                    upper_bound = df[col].quantile(upper)
                    
                    mask = (df[col] >= lower_bound) & (df[col] <= upper_bound)
                    df = df[mask]
                    logger.info(f"Removed outliers in column {col} outside range [{lower_bound}, {upper_bound}]")
                
                elif strategy == "winsorize":
                    # Replace outliers with the nearest non-outlier value
                    lower = self.config.get("lower_quantile", 0.01)
                    upper = self.config.get("upper_quantile", 0.99)
                    
                    lower_bound = df[col].quantile(lower)
                    upper_bound = df[col].quantile(upper)
                    
                    df.loc[df[col] < lower_bound, col] = lower_bound
                    df.loc[df[col] > upper_bound, col] = upper_bound
                    logger.info(f"Winsorized outliers in column {col} to range [{lower_bound}, {upper_bound}]")
                
                elif strategy == "iqr":
                    # Use IQR method to identify and handle outliers
                    q1 = df[col].quantile(0.25)
                    q3 = df[col].quantile(0.75)
                    iqr = q3 - q1
                    
                    lower_bound = q1 - 1.5 * iqr
                    upper_bound = q3 + 1.5 * iqr
                    
                    if self.config.get("remove", False):
                        mask = (df[col] >= lower_bound) & (df[col] <= upper_bound)
                        df = df[mask]
                        logger.info(f"Removed IQR outliers in column {col} outside range [{lower_bound}, {upper_bound}]")
                    else:
                        df[col] = df[col].clip(lower_bound, upper_bound)
                        logger.info(f"Clipped IQR outliers in column {col} to range [{lower_bound}, {upper_bound}]")
        
        return df


class DataTypeConverter(DataFrameTransformer):
    """Transformer for converting data types in a DataFrame."""
    
    def _transform_dataframe(self, df: pd.DataFrame, **kwargs) -> pd.DataFrame:
        """
        Convert data types in the DataFrame.
        
        Args:
            df: DataFrame to transform
            
        Returns:
            DataFrame with converted data types
        """
        conversions = self.config.get("conversions", {})
        
        for col, dtype in conversions.items():
            if col in df.columns:
                try:
                    df[col] = df[col].astype(dtype)
                    logger.info(f"Converted column {col} to type {dtype}")
                except Exception as e:
                    logger.error(f"Error converting column {col} to type {dtype}: {str(e)}")
        
        return df


class ColumnRenamer(DataFrameTransformer):
    """Transformer for renaming columns in a DataFrame."""
    
    def _transform_dataframe(self, df: pd.DataFrame, **kwargs) -> pd.DataFrame:
        """
        Rename columns in the DataFrame.
        
        Args:
            df: DataFrame to transform
            
        Returns:
            DataFrame with renamed columns
        """
        rename_map = self.config.get("rename_map", {})
        
        try:
            df = df.rename(columns=rename_map)
            logger.info(f"Renamed columns: {rename_map}")
        except Exception as e:
            logger.error(f"Error renaming columns: {str(e)}")
        
        return df


class ColumnSelector(DataFrameTransformer):
    """Transformer for selecting columns in a DataFrame."""
    
    def _transform_dataframe(self, df: pd.DataFrame, **kwargs) -> pd.DataFrame:
        """
        Select columns in the DataFrame.
        
        Args:
            df: DataFrame to transform
            
        Returns:
            DataFrame with selected columns
        """
        columns = self.config.get("columns", [])
        
        if not columns:
            logger.warning("No columns specified for selection, returning original DataFrame")
            return df
        
        # Check if all specified columns exist
        missing_columns = [col for col in columns if col not in df.columns]
        if missing_columns:
            logger.warning(f"Columns not found in DataFrame: {missing_columns}")
        
        # Select only existing columns
        existing_columns = [col for col in columns if col in df.columns]
        if not existing_columns:
            logger.warning("None of the specified columns exist in the DataFrame, returning original DataFrame")
            return df
        
        df = df[existing_columns]
        logger.info(f"Selected columns: {existing_columns}")
        
        return df


class CustomTransformer(DataFrameTransformer):
    """Transformer for applying custom functions to a DataFrame."""
    
    def _transform_dataframe(self, df: pd.DataFrame, **kwargs) -> pd.DataFrame:
        """
        Apply custom functions to the DataFrame.
        
        Args:
            df: DataFrame to transform
            
        Returns:
            Transformed DataFrame
        """
        transform_fn = self.config.get("transform_fn")
        
        if transform_fn is None:
            logger.warning("No transform function specified, returning original DataFrame")
            return df
        
        if not callable(transform_fn):
            logger.error("Specified transform_fn is not callable")
            return df
        
        try:
            result = transform_fn(df, **kwargs)
            if not isinstance(result, pd.DataFrame):
                logger.error("Transform function did not return a DataFrame")
                return df
            
            logger.info("Applied custom transformation function")
            return result
        except Exception as e:
            logger.error(f"Error applying custom transformation: {str(e)}")
            return df


class TransformationPipeline:
    """Pipeline for applying multiple transformations in sequence."""
    
    def __init__(self, name: str):
        """
        Initialize a transformation pipeline.
        
        Args:
            name: Unique identifier for the pipeline
        """
        self.name = name
        self.transformers = []
        logger.info(f"Initialized transformation pipeline: {name}")
    
    def add_transformer(self, transformer: Transformer, position: int = None) -> None:
        """
        Add a transformer to the pipeline.
        
        Args:
            transformer: Transformer to add
            position: Position to insert the transformer (None to append)
        """
        if position is None:
            self.transformers.append(transformer)
            logger.info(f"Added transformer {transformer.name} to pipeline {self.name}")
        else:
            self.transformers.insert(position, transformer)
            logger.info(f"Inserted transformer {transformer.name} at position {position} in pipeline {self.name}")
    
    def remove_transformer(self, name: str) -> bool:
        """
        Remove a transformer from the pipeline.
        
        Args:
            name: Name of the transformer to remove
            
        Returns:
            True if the transformer was removed, False otherwise
        """
        for i, transformer in enumerate(self.transformers):
            if transformer.name == name:
                del self.transformers[i]
                logger.info(f"Removed transformer {name} from pipeline {self.name}")
                return True
        
        logger.warning(f"Transformer {name} not found in pipeline {self.name}")
        return False
    
    def transform(self, data: Any, **kwargs) -> Any:
        """
        Apply all transformations in the pipeline.
        
        Args:
            data: Data to transform
            
        Returns:
            Transformed data
        """
        result = data
        
        for transformer in self.transformers:
            try:
                logger.info(f"Applying transformer {transformer.name} in pipeline {self.name}")
                result = transformer.transform(result, **kwargs)
            except Exception as e:
                logger.error(f"Error in transformer {transformer.name}: {str(e)}")
                if self.config.get("fail_fast", True):
                    raise
        
        return result
    
    def get_transformer(self, name: str) -> Optional[Transformer]:
        """
        Get a transformer by name.
        
        Args:
            name: Name of the transformer
            
        Returns:
            Transformer if found, None otherwise
        """
        for transformer in self.transformers:
            if transformer.name == name:
                return transformer
        
        return None
    
    def list_transformers(self) -> List[str]:
        """
        List all transformers in the pipeline.
        
        Returns:
            List of transformer names
        """
        return [transformer.name for transformer in self.transformers]
    
    @property
    def config(self) -> Dict[str, Any]:
        """
        Get the pipeline configuration.
        
        Returns:
            Dictionary containing the pipeline configuration
        """
        return {
            "name": self.name,
            "transformers": [transformer.get_metadata() for transformer in self.transformers],
            "fail_fast": True
        }


class TransformationManager:
    """Manager for data transformation pipelines."""
    
    def __init__(self):
        """Initialize the transformation manager."""
        self.pipelines = {}
        logger.info("Initialized transformation manager")
    
    def create_pipeline(self, name: str) -> TransformationPipeline:
        """
        Create a new transformation pipeline.
        
        Args:
            name: Unique identifier for the pipeline
            
        Returns:
            New transformation pipeline
        """
        if name in self.pipelines:
            logger.warning(f"Pipeline {name} already exists, returning existing pipeline")
            return self.pipelines[name]
        
        pipeline = TransformationPipeline(name)
        self.pipelines[name] = pipeline
        logger.info(f"Created transformation pipeline: {name}")
        
        return pipeline
    
    def get_pipeline(self, name: str) -> Optional[TransformationPipeline]:
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
    
    def transform(self, data: Any, pipeline_name: str, **kwargs) -> Any:
        """
        Transform data using a specific pipeline.
        
        Args:
            data: Data to transform
            pipeline_name: Name of the pipeline to use
            
        Returns:
            Transformed data
        """
        pipeline = self.get_pipeline(pipeline_name)
        
        if not pipeline:
            logger.error(f"Pipeline not found: {pipeline_name}")
            raise ValueError(f"Pipeline not found: {pipeline_name}")
        
        try:
            result = pipeline.transform(data, **kwargs)
            logger.info(f"Successfully transformed data using pipeline {pipeline_name}")
            return result
        except Exception as e:
            logger.error(f"Error transforming data using pipeline {pipeline_name}: {str(e)}")
            raise

