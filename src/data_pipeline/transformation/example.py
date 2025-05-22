"""
Example usage of the data transformation layer.

This module demonstrates how to use the data transformation layer to transform
and clean data from various sources.
"""

import pandas as pd
import numpy as np
from transformation_layer import (
    TransformationManager,
    MissingValueHandler,
    OutlierHandler,
    DataTypeConverter,
    ColumnRenamer,
    ColumnSelector,
    CustomTransformer,
)
from config import EXAMPLE_CONFIGS, EXAMPLE_PIPELINE_CONFIGS

def create_sample_data():
    """Create sample data for demonstration."""
    # Create a sample DataFrame with various issues
    np.random.seed(42)
    
    # Create 100 rows of data
    n = 100
    
    # Create a DataFrame with mixed data types and issues
    data = {
        "ID": np.arange(1, n + 1),
        "First Name": np.random.choice(["John", "Jane", "Bob", "Alice", None], n),
        "Last Name": np.random.choice(["Smith", "Doe", "Johnson", "Brown", None], n),
        "Age": np.random.randint(18, 80, n),
        "Income": np.random.normal(50000, 15000, n),
        "Education": np.random.choice(["High School", "Bachelor", "Master", "PhD", None], n),
        "SignUp Date": pd.date_range(start="2020-01-01", periods=n, freq="D"),
        "Last Login": pd.date_range(start="2021-01-01", periods=n, freq="D"),
        "Is Active": np.random.choice([True, False], n),
    }
    
    # Create a DataFrame
    df = pd.DataFrame(data)
    
    # Introduce missing values
    for col in ["Age", "Income", "Education"]:
        mask = np.random.choice([True, False], n, p=[0.1, 0.9])
        df.loc[mask, col] = np.nan
    
    # Introduce outliers
    df.loc[np.random.choice(n, 5), "Age"] = np.random.randint(100, 120, 5)
    df.loc[np.random.choice(n, 5), "Income"] = np.random.normal(200000, 50000, 5)
    
    return df

def custom_transform_function(df, **kwargs):
    """Custom transformation function for demonstration."""
    # Calculate a new column
    df["Income Per Year of Age"] = df["Income"] / df["Age"]
    
    # Create a categorical column
    df["Income Category"] = pd.cut(
        df["Income"],
        bins=[0, 30000, 60000, 90000, float("inf")],
        labels=["Low", "Medium", "High", "Very High"]
    )
    
    return df

def main():
    """Example usage of the data transformation layer."""
    
    # Create sample data
    df = create_sample_data()
    print("Original data:")
    print(df.head())
    print("\nData info:")
    print(df.info())
    print("\nMissing values:")
    print(df.isna().sum())
    
    # Initialize the transformation manager
    manager = TransformationManager()
    
    # Create a pipeline for customer data
    pipeline = manager.create_pipeline("customer_data_pipeline")
    
    # Add transformers to the pipeline
    
    # 1. Rename columns
    rename_config = EXAMPLE_CONFIGS["column_renamer"]["standardize_column_names"]
    pipeline.add_transformer(ColumnRenamer(name="standardize_column_names", config=rename_config))
    
    # 2. Convert data types
    type_config = {
        "conversions": {
            "age": "int",
            "income": "float",
            "is_active": "bool",
        }
    }
    pipeline.add_transformer(DataTypeConverter(name="convert_types", config=type_config))
    
    # 3. Handle missing values
    missing_config = {
        "strategy": "fill",
        "columns": ["age", "income", "education"],
    }
    pipeline.add_transformer(MissingValueHandler(name="handle_missing_values", config=missing_config))
    
    # 4. Handle outliers
    outlier_config = {
        "strategy": "clip",
        "columns": ["age", "income"],
        "lower_quantile": 0.01,
        "upper_quantile": 0.99,
    }
    pipeline.add_transformer(OutlierHandler(name="handle_outliers", config=outlier_config))
    
    # 5. Select columns
    select_config = {
        "columns": ["first_name", "last_name", "age", "income", "education", "is_active"],
    }
    pipeline.add_transformer(ColumnSelector(name="select_columns", config=select_config))
    
    # 6. Add custom transformer
    custom_config = {
        "transform_fn": custom_transform_function,
    }
    pipeline.add_transformer(CustomTransformer(name="custom_transformer", config=custom_config))
    
    # Transform the data
    transformed_df = manager.transform(df, "customer_data_pipeline")
    
    print("\nTransformed data:")
    print(transformed_df.head())
    print("\nTransformed data info:")
    print(transformed_df.info())
    print("\nMissing values after transformation:")
    print(transformed_df.isna().sum())
    
    # Create another pipeline from a configuration
    sensor_pipeline_config = EXAMPLE_PIPELINE_CONFIGS["sensor_data_pipeline"]
    sensor_pipeline = manager.create_pipeline("sensor_data_pipeline")
    
    # Add transformers from configuration
    for transformer_config in sensor_pipeline_config:
        transformer_type = transformer_config["type"]
        transformer_name = transformer_config["name"]
        transformer_config = transformer_config["config"]
        
        if transformer_type == "ColumnSelector":
            transformer = ColumnSelector(name=transformer_name, config=transformer_config)
        elif transformer_type == "DataTypeConverter":
            transformer = DataTypeConverter(name=transformer_name, config=transformer_config)
        elif transformer_type == "MissingValueHandler":
            transformer = MissingValueHandler(name=transformer_name, config=transformer_config)
        elif transformer_type == "OutlierHandler":
            transformer = OutlierHandler(name=transformer_name, config=transformer_config)
        elif transformer_type == "ColumnRenamer":
            transformer = ColumnRenamer(name=transformer_name, config=transformer_config)
        elif transformer_type == "CustomTransformer":
            transformer = CustomTransformer(name=transformer_name, config=transformer_config)
        else:
            raise ValueError(f"Unknown transformer type: {transformer_type}")
        
        sensor_pipeline.add_transformer(transformer)
    
    print("\nAvailable pipelines:")
    print(manager.list_pipelines())
    
    print("\nTransformers in customer_data_pipeline:")
    print(pipeline.list_transformers())
    
    print("\nTransformers in sensor_data_pipeline:")
    print(sensor_pipeline.list_transformers())

if __name__ == "__main__":
    main()

