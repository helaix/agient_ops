"""
Data Visualization Layer

This module provides a flexible framework for creating data visualizations and dashboards.
"""

import abc
import logging
import os
from typing import Any, Dict, List, Optional, Union, Tuple
import datetime
import pandas as pd
import numpy as np
import json

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class Visualization(abc.ABC):
    """Abstract base class for all visualizations."""
    
    def __init__(self, name: str, config: Dict[str, Any] = None):
        """
        Initialize a visualization.
        
        Args:
            name: Unique identifier for the visualization
            config: Configuration parameters for the visualization
        """
        self.name = name
        self.config = config or {}
        self.last_update_time = None
        logger.info(f"Initialized visualization: {name}")
    
    @abc.abstractmethod
    def render(self, data: Any, **kwargs) -> Dict[str, Any]:
        """
        Render the visualization.
        
        Args:
            data: Data to visualize
            
        Returns:
            Dictionary containing the visualization specification
        """
        pass
    
    def get_metadata(self) -> Dict[str, Any]:
        """
        Get metadata about the visualization.
        
        Returns:
            Dictionary containing metadata about the visualization
        """
        return {
            "name": self.name,
            "type": self.__class__.__name__,
            "last_update_time": self.last_update_time,
            "config": self.config
        }
    
    def to_json(self, indent: int = 2) -> str:
        """
        Convert the visualization specification to a JSON string.
        
        Args:
            indent: Number of spaces for indentation
            
        Returns:
            JSON string representation of the visualization specification
        """
        return json.dumps(self.get_metadata(), indent=indent)


class Chart(Visualization):
    """Base class for chart visualizations."""
    
    def render(self, data: Any, **kwargs) -> Dict[str, Any]:
        """
        Render the chart.
        
        Args:
            data: Data to visualize
            
        Returns:
            Dictionary containing the chart specification
        """
        try:
            # Convert data to DataFrame if it's not already
            if not isinstance(data, pd.DataFrame):
                try:
                    df = pd.DataFrame(data)
                except Exception as e:
                    logger.error(f"Error converting data to DataFrame: {str(e)}")
                    raise ValueError(f"Could not convert data to DataFrame: {str(e)}")
            else:
                df = data.copy()
            
            # Render the chart
            chart_spec = self._render_chart(df, **kwargs)
            
            self.last_update_time = datetime.datetime.now()
            
            return chart_spec
        except Exception as e:
            logger.error(f"Error rendering chart {self.name}: {str(e)}")
            raise
    
    @abc.abstractmethod
    def _render_chart(self, df: pd.DataFrame, **kwargs) -> Dict[str, Any]:
        """
        Render the chart.
        
        Args:
            df: DataFrame to visualize
            
        Returns:
            Dictionary containing the chart specification
        """
        pass


class LineChart(Chart):
    """Line chart visualization."""
    
    def _render_chart(self, df: pd.DataFrame, **kwargs) -> Dict[str, Any]:
        """
        Render a line chart.
        
        Args:
            df: DataFrame to visualize
            
        Returns:
            Dictionary containing the line chart specification
        """
        # Get chart parameters from config or kwargs
        x = kwargs.get("x") or self.config.get("x")
        y = kwargs.get("y") or self.config.get("y")
        title = kwargs.get("title") or self.config.get("title", f"Line Chart: {y} by {x}")
        color = kwargs.get("color") or self.config.get("color")
        
        if not x or not y:
            raise ValueError("x and y parameters are required for line chart")
        
        # Check if the columns exist
        if x not in df.columns:
            raise ValueError(f"Column {x} not found in DataFrame")
        if y not in df.columns:
            raise ValueError(f"Column {y} not found in DataFrame")
        
        # Create the chart specification
        chart_spec = {
            "type": "line",
            "data": {
                "x": df[x].tolist(),
                "y": df[y].tolist(),
            },
            "layout": {
                "title": title,
                "xaxis": {"title": x},
                "yaxis": {"title": y},
            },
        }
        
        # Add color if specified
        if color:
            if color in df.columns:
                chart_spec["data"]["color"] = df[color].tolist()
            else:
                chart_spec["data"]["color"] = color
        
        return chart_spec


class BarChart(Chart):
    """Bar chart visualization."""
    
    def _render_chart(self, df: pd.DataFrame, **kwargs) -> Dict[str, Any]:
        """
        Render a bar chart.
        
        Args:
            df: DataFrame to visualize
            
        Returns:
            Dictionary containing the bar chart specification
        """
        # Get chart parameters from config or kwargs
        x = kwargs.get("x") or self.config.get("x")
        y = kwargs.get("y") or self.config.get("y")
        title = kwargs.get("title") or self.config.get("title", f"Bar Chart: {y} by {x}")
        color = kwargs.get("color") or self.config.get("color")
        orientation = kwargs.get("orientation") or self.config.get("orientation", "v")
        
        if not x or not y:
            raise ValueError("x and y parameters are required for bar chart")
        
        # Check if the columns exist
        if x not in df.columns:
            raise ValueError(f"Column {x} not found in DataFrame")
        if y not in df.columns:
            raise ValueError(f"Column {y} not found in DataFrame")
        
        # Create the chart specification
        chart_spec = {
            "type": "bar",
            "data": {
                "x": df[x].tolist(),
                "y": df[y].tolist(),
                "orientation": orientation,
            },
            "layout": {
                "title": title,
                "xaxis": {"title": x},
                "yaxis": {"title": y},
            },
        }
        
        # Add color if specified
        if color:
            if color in df.columns:
                chart_spec["data"]["color"] = df[color].tolist()
            else:
                chart_spec["data"]["color"] = color
        
        return chart_spec


class ScatterPlot(Chart):
    """Scatter plot visualization."""
    
    def _render_chart(self, df: pd.DataFrame, **kwargs) -> Dict[str, Any]:
        """
        Render a scatter plot.
        
        Args:
            df: DataFrame to visualize
            
        Returns:
            Dictionary containing the scatter plot specification
        """
        # Get chart parameters from config or kwargs
        x = kwargs.get("x") or self.config.get("x")
        y = kwargs.get("y") or self.config.get("y")
        title = kwargs.get("title") or self.config.get("title", f"Scatter Plot: {y} vs {x}")
        color = kwargs.get("color") or self.config.get("color")
        size = kwargs.get("size") or self.config.get("size")
        
        if not x or not y:
            raise ValueError("x and y parameters are required for scatter plot")
        
        # Check if the columns exist
        if x not in df.columns:
            raise ValueError(f"Column {x} not found in DataFrame")
        if y not in df.columns:
            raise ValueError(f"Column {y} not found in DataFrame")
        
        # Create the chart specification
        chart_spec = {
            "type": "scatter",
            "data": {
                "x": df[x].tolist(),
                "y": df[y].tolist(),
            },
            "layout": {
                "title": title,
                "xaxis": {"title": x},
                "yaxis": {"title": y},
            },
        }
        
        # Add color if specified
        if color:
            if color in df.columns:
                chart_spec["data"]["color"] = df[color].tolist()
            else:
                chart_spec["data"]["color"] = color
        
        # Add size if specified
        if size:
            if size in df.columns:
                chart_spec["data"]["size"] = df[size].tolist()
            else:
                try:
                    size_value = float(size)
                    chart_spec["data"]["size"] = size_value
                except:
                    pass
        
        return chart_spec


class PieChart(Chart):
    """Pie chart visualization."""
    
    def _render_chart(self, df: pd.DataFrame, **kwargs) -> Dict[str, Any]:
        """
        Render a pie chart.
        
        Args:
            df: DataFrame to visualize
            
        Returns:
            Dictionary containing the pie chart specification
        """
        # Get chart parameters from config or kwargs
        labels = kwargs.get("labels") or self.config.get("labels")
        values = kwargs.get("values") or self.config.get("values")
        title = kwargs.get("title") or self.config.get("title", "Pie Chart")
        
        if not labels or not values:
            raise ValueError("labels and values parameters are required for pie chart")
        
        # Check if the columns exist
        if labels not in df.columns:
            raise ValueError(f"Column {labels} not found in DataFrame")
        if values not in df.columns:
            raise ValueError(f"Column {values} not found in DataFrame")
        
        # Create the chart specification
        chart_spec = {
            "type": "pie",
            "data": {
                "labels": df[labels].tolist(),
                "values": df[values].tolist(),
            },
            "layout": {
                "title": title,
            },
        }
        
        return chart_spec


class Heatmap(Chart):
    """Heatmap visualization."""
    
    def _render_chart(self, df: pd.DataFrame, **kwargs) -> Dict[str, Any]:
        """
        Render a heatmap.
        
        Args:
            df: DataFrame to visualize
            
        Returns:
            Dictionary containing the heatmap specification
        """
        # Get chart parameters from config or kwargs
        x = kwargs.get("x") or self.config.get("x")
        y = kwargs.get("y") or self.config.get("y")
        z = kwargs.get("z") or self.config.get("z")
        title = kwargs.get("title") or self.config.get("title", "Heatmap")
        
        if not x or not y or not z:
            raise ValueError("x, y, and z parameters are required for heatmap")
        
        # Check if the columns exist
        if x not in df.columns:
            raise ValueError(f"Column {x} not found in DataFrame")
        if y not in df.columns:
            raise ValueError(f"Column {y} not found in DataFrame")
        if z not in df.columns:
            raise ValueError(f"Column {z} not found in DataFrame")
        
        # Pivot the data to create a matrix
        try:
            pivot_df = df.pivot(index=y, columns=x, values=z)
            
            # Create the chart specification
            chart_spec = {
                "type": "heatmap",
                "data": {
                    "x": pivot_df.columns.tolist(),
                    "y": pivot_df.index.tolist(),
                    "z": pivot_df.values.tolist(),
                },
                "layout": {
                    "title": title,
                    "xaxis": {"title": x},
                    "yaxis": {"title": y},
                },
            }
            
            return chart_spec
        except Exception as e:
            logger.error(f"Error creating heatmap: {str(e)}")
            raise ValueError(f"Error creating heatmap: {str(e)}")


class Table(Visualization):
    """Table visualization."""
    
    def render(self, data: Any, **kwargs) -> Dict[str, Any]:
        """
        Render a table.
        
        Args:
            data: Data to visualize
            
        Returns:
            Dictionary containing the table specification
        """
        try:
            # Convert data to DataFrame if it's not already
            if not isinstance(data, pd.DataFrame):
                try:
                    df = pd.DataFrame(data)
                except Exception as e:
                    logger.error(f"Error converting data to DataFrame: {str(e)}")
                    raise ValueError(f"Could not convert data to DataFrame: {str(e)}")
            else:
                df = data.copy()
            
            # Get table parameters from config or kwargs
            columns = kwargs.get("columns") or self.config.get("columns")
            title = kwargs.get("title") or self.config.get("title", "Table")
            
            # Select columns if specified
            if columns:
                # Check if all specified columns exist
                missing_columns = [col for col in columns if col not in df.columns]
                if missing_columns:
                    logger.warning(f"Columns not found in DataFrame: {missing_columns}")
                
                # Select only existing columns
                existing_columns = [col for col in columns if col in df.columns]
                if not existing_columns:
                    logger.warning("None of the specified columns exist in the DataFrame")
                else:
                    df = df[existing_columns]
            
            # Create the table specification
            table_spec = {
                "type": "table",
                "data": {
                    "headers": df.columns.tolist(),
                    "rows": df.values.tolist(),
                },
                "layout": {
                    "title": title,
                },
            }
            
            self.last_update_time = datetime.datetime.now()
            
            return table_spec
        except Exception as e:
            logger.error(f"Error rendering table {self.name}: {str(e)}")
            raise


class Dashboard:
    """Dashboard containing multiple visualizations."""
    
    def __init__(self, name: str, config: Dict[str, Any] = None):
        """
        Initialize a dashboard.
        
        Args:
            name: Unique identifier for the dashboard
            config: Configuration parameters for the dashboard
        """
        self.name = name
        self.config = config or {}
        self.visualizations = []
        self.last_update_time = None
        logger.info(f"Initialized dashboard: {name}")
    
    def add_visualization(self, visualization: Visualization, position: Tuple[int, int] = None, size: Tuple[int, int] = None) -> None:
        """
        Add a visualization to the dashboard.
        
        Args:
            visualization: Visualization to add
            position: Position (row, column) to place the visualization
            size: Size (rows, columns) of the visualization
        """
        viz_config = {
            "visualization": visualization,
            "position": position,
            "size": size,
        }
        
        self.visualizations.append(viz_config)
        logger.info(f"Added visualization {visualization.name} to dashboard {self.name}")
    
    def remove_visualization(self, name: str) -> bool:
        """
        Remove a visualization from the dashboard.
        
        Args:
            name: Name of the visualization to remove
            
        Returns:
            True if the visualization was removed, False otherwise
        """
        for i, viz_config in enumerate(self.visualizations):
            if viz_config["visualization"].name == name:
                del self.visualizations[i]
                logger.info(f"Removed visualization {name} from dashboard {self.name}")
                return True
        
        logger.warning(f"Visualization {name} not found in dashboard {self.name}")
        return False
    
    def render(self, data: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Render the dashboard.
        
        Args:
            data: Dictionary mapping visualization names to data
            
        Returns:
            Dictionary containing the dashboard specification
        """
        data = data or {}
        
        try:
            # Render each visualization
            rendered_visualizations = []
            
            for viz_config in self.visualizations:
                viz = viz_config["visualization"]
                position = viz_config["position"]
                size = viz_config["size"]
                
                # Get data for this visualization
                viz_data = data.get(viz.name)
                
                if viz_data is not None:
                    # Render the visualization
                    viz_spec = viz.render(viz_data)
                    
                    # Add position and size if specified
                    if position:
                        viz_spec["position"] = position
                    if size:
                        viz_spec["size"] = size
                    
                    rendered_visualizations.append(viz_spec)
                else:
                    logger.warning(f"No data provided for visualization {viz.name}")
            
            # Create the dashboard specification
            dashboard_spec = {
                "name": self.name,
                "layout": self.config.get("layout", "grid"),
                "visualizations": rendered_visualizations,
            }
            
            self.last_update_time = datetime.datetime.now()
            
            return dashboard_spec
        except Exception as e:
            logger.error(f"Error rendering dashboard {self.name}: {str(e)}")
            raise
    
    def to_json(self, data: Dict[str, Any] = None, indent: int = 2) -> str:
        """
        Convert the dashboard specification to a JSON string.
        
        Args:
            data: Dictionary mapping visualization names to data
            indent: Number of spaces for indentation
            
        Returns:
            JSON string representation of the dashboard specification
        """
        dashboard_spec = self.render(data)
        return json.dumps(dashboard_spec, indent=indent)
    
    def to_html(self, data: Dict[str, Any] = None) -> str:
        """
        Convert the dashboard to an HTML string.
        
        Args:
            data: Dictionary mapping visualization names to data
            
        Returns:
            HTML string representation of the dashboard
        """
        # This is a simplified implementation that would need to be expanded
        # with a proper HTML template and JavaScript libraries for rendering
        # the visualizations in a real-world scenario
        
        dashboard_spec = self.render(data)
        
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>{dashboard_spec['name']}</title>
            <style>
                .dashboard {{
                    display: grid;
                    grid-template-columns: repeat(12, 1fr);
                    grid-gap: 10px;
                    padding: 10px;
                }}
                .visualization {{
                    border: 1px solid #ddd;
                    padding: 10px;
                    border-radius: 5px;
                }}
            </style>
        </head>
        <body>
            <h1>{dashboard_spec['name']}</h1>
            <div class="dashboard">
        """
        
        for viz in dashboard_spec["visualizations"]:
            position = viz.get("position", (0, 0))
            size = viz.get("size", (1, 1))
            
            html += f"""
                <div class="visualization" style="grid-row: {position[0] + 1} / span {size[0]}; grid-column: {position[1] + 1} / span {size[1]};">
                    <h2>{viz.get('layout', {}).get('title', 'Visualization')}</h2>
                    <pre>{json.dumps(viz, indent=2)}</pre>
                </div>
            """
        
        html += """
            </div>
        </body>
        </html>
        """
        
        return html
    
    def save_html(self, file_path: str, data: Dict[str, Any] = None) -> None:
        """
        Save the dashboard as an HTML file.
        
        Args:
            file_path: Path to save the HTML file
            data: Dictionary mapping visualization names to data
        """
        html = self.to_html(data)
        
        try:
            # Create the directory if it doesn't exist
            directory = os.path.dirname(file_path)
            if directory and not os.path.exists(directory):
                os.makedirs(directory)
            
            # Write the HTML to the file
            with open(file_path, "w") as f:
                f.write(html)
            
            logger.info(f"Saved dashboard {self.name} to {file_path}")
        except Exception as e:
            logger.error(f"Error saving dashboard {self.name} to {file_path}: {str(e)}")
            raise


class DashboardManager:
    """Manager for dashboards."""
    
    def __init__(self):
        """Initialize the dashboard manager."""
        self.dashboards = {}
        logger.info("Initialized dashboard manager")
    
    def create_dashboard(self, name: str, config: Dict[str, Any] = None) -> Dashboard:
        """
        Create a new dashboard.
        
        Args:
            name: Unique identifier for the dashboard
            config: Configuration parameters for the dashboard
            
        Returns:
            New dashboard
        """
        if name in self.dashboards:
            logger.warning(f"Dashboard {name} already exists, returning existing dashboard")
            return self.dashboards[name]
        
        dashboard = Dashboard(name, config)
        self.dashboards[name] = dashboard
        logger.info(f"Created dashboard: {name}")
        
        return dashboard
    
    def get_dashboard(self, name: str) -> Optional[Dashboard]:
        """
        Get a dashboard by name.
        
        Args:
            name: Name of the dashboard
            
        Returns:
            Dashboard if found, None otherwise
        """
        return self.dashboards.get(name)
    
    def list_dashboards(self) -> List[str]:
        """
        List all dashboards.
        
        Returns:
            List of dashboard names
        """
        return list(self.dashboards.keys())
    
    def render_dashboard(self, name: str, data: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Render a dashboard.
        
        Args:
            name: Name of the dashboard
            data: Dictionary mapping visualization names to data
            
        Returns:
            Dictionary containing the dashboard specification
        """
        dashboard = self.get_dashboard(name)
        
        if not dashboard:
            logger.error(f"Dashboard not found: {name}")
            raise ValueError(f"Dashboard not found: {name}")
        
        try:
            result = dashboard.render(data)
            logger.info(f"Successfully rendered dashboard {name}")
            return result
        except Exception as e:
            logger.error(f"Error rendering dashboard {name}: {str(e)}")
            raise
    
    def save_dashboard_html(self, name: str, file_path: str, data: Dict[str, Any] = None) -> None:
        """
        Save a dashboard as an HTML file.
        
        Args:
            name: Name of the dashboard
            file_path: Path to save the HTML file
            data: Dictionary mapping visualization names to data
        """
        dashboard = self.get_dashboard(name)
        
        if not dashboard:
            logger.error(f"Dashboard not found: {name}")
            raise ValueError(f"Dashboard not found: {name}")
        
        try:
            dashboard.save_html(file_path, data)
            logger.info(f"Successfully saved dashboard {name} to {file_path}")
        except Exception as e:
            logger.error(f"Error saving dashboard {name} to {file_path}: {str(e)}")
            raise

