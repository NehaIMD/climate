import numpy as np
import xarray as xr
import pandas as pd
import geopandas as gpd
import plotly.graph_objects as go
import plotly.express as px
from scipy.interpolate import griddata
from flask import Flask, jsonify, request, render_template, send_file
from flask_cors import CORS, cross_origin
import json
import cartopy.crs as ccrs
import cartopy.feature as cf
import matplotlib.pyplot as plt
from netCDF4 import Dataset
from cartopy.mpl.ticker import LongitudeFormatter, LatitudeFormatter
import seaborn as sns
from matplotlib import style
import os
import shutil
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.utils import ImageReader
from oni_vs_dmi import DMI_vs_ONI_bar_plot, ONIvsDMItimeSeries, ONI_vs_DMI_seasonal
from oni import ONI_bar_plot, ONIheatmap, ONItimeSeries, past10YearsONIValues, ONI_seasonal
from dmi import DMI_bar_plot, DMIheatmap, DMItimeSeries, past10YearsDMIValues, DMI_seasonal
from PIL import Image
import requests
from io import BytesIO
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image as RLImage
# Add this to your Flask app:
from flask import send_from_directory
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import base64
import time

app = Flask(__name__)

CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],  # Add your Next.js frontend URL
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "Access-Control-Allow-Origin"]
    }
})


@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory('static', filename)

# Load precipitation dataset
precip_file_path = "precip.mon.mean.nc"
precip_ds = xr.open_dataset(precip_file_path)
dp = precip_ds

# Load SST dataset
sst_file_path = "sst.mnmean.nc"
sst_ds = xr.open_dataset(sst_file_path)
lons = sst_ds['lon'][:]
lats = sst_ds['lat'][:]
sst = sst_ds['sst'].sel(time=slice('1981-1-01', '2020-12-01'))
sst_clim = sst.groupby('time.month').mean(dim='time')
sst_anom = sst.groupby('time.month') - sst_clim

# Constants
IMAGES_FOLDER = "images"
STATIC_FOLDER = os.path.join(os.getcwd(), 'static')

# Utility functions
def clean_json(obj):
    """Recursively replace NaN and Infinity values with None in JSON serializable objects."""
    if isinstance(obj, dict):
        return {k: clean_json(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [clean_json(v) for v in obj]
    elif isinstance(obj, (int, float, np.number)):
        return None if np.isnan(obj) or np.isinf(obj) else obj
    return obj

def clear_static_folder():
    """Clears all files and subdirectories in the static folder."""
    if os.path.exists(STATIC_FOLDER):
        for item in os.listdir(STATIC_FOLDER):
            item_path = os.path.join(STATIC_FOLDER, item)
            if os.path.isfile(item_path):
                os.remove(item_path)
            elif os.path.isdir(item_path):
                shutil.rmtree(item_path)

def plot_mean_sst_anomaly_plotly(start_year_month, end_year_month, sst_anom, lons, lats):
    start_year, start_month = map(int, start_year_month.split('-'))
    end_year, end_month = map(int, end_year_month.split('-'))
    time_filtered = sst_anom.sel(time=slice(f'{start_year}-{start_month:02d}', f'{end_year}-{end_month:02d}'))
    mean_anom = time_filtered.mean(dim='time')
    data = mean_anom.values

    # Create figure
    fig = go.Figure()

    # Add SST anomaly heatmap (ensuring no contour lines appear)
    fig.add_trace(go.Contour(
        z=data,
        x=lons,
        y=lats,
        contours=dict(
            start=-2,
            end=2,
            size=0.2,
            coloring='heatmap',
            showlines=False  # Remove contour lines
        ),
        colorscale='RdBu_r',
        zmin=-2,
        zmax=2,
        colorbar=dict(
            title='(°C)',
            thickness=15,
            len=1.1,
            y=0.5,
            yanchor='middle',
            ticks='outside'
        ),
        hovertemplate='Lon: %{x:.1f}°<br>Lat: %{y:.1f}°<br>SST Anomaly: %{z:.2f}°C<extra></extra>',
        connectgaps=True,  # Ensure smooth shading
        line=dict(width=0)  # Explicitly remove black lines
    ))

    # Add land mask with a solid fill
    land_mask = np.isnan(data)
    fig.add_trace(go.Contour(
        z=land_mask.astype(float),
        x=lons,
        y=lats,
        contours=dict(
            start=0.5,
            end=0.5,
            size=0,
            coloring='fill'  # Fill land without contour lines
        ),
        colorscale=[[0, 'rgba(0,0,0,0)'], [1, 'rgb(180,180,180)']],  # Transparent to grey
        showscale=False,
        hoverongaps=False,
        hoverinfo='skip'
    ))

    # Update layout
    fig.update_layout(
        title=dict(
            text=f'Mean SST Anomaly ({start_year}-{start_month:02d} to {end_year}-{end_month:02d})',
            x=0.5,
            y=0.95
        ),
        plot_bgcolor='white',
        paper_bgcolor='white',
        xaxis=dict(
            title='Longitude',
            ticktext=['60°E', '120°E', '180°', '120°W', '60°W'],
            tickvals=[60, 120, 180, 240, 300],
            range=[0, 360],
            showgrid=False,
            zeroline=False,
        ),
        yaxis=dict(
            title='Latitude',
            ticktext=['30°S', '15°S', '0°', '15°N', '30°N'],
            tickvals=[-30, -15, 0, 15, 30],
            range=[-40, 40],
            showgrid=False,
            zeroline=False,
        ),
        showlegend=False,
    )
    return pio.to_json(fig)


def plot_precip_anomaly_plotly(year, month, shapefile_path="Shape File/Homogeneous Region Shape File1.shp"):
    try:
        shapefile = gpd.read_file(shapefile_path)
        lat_range = [6.5, 38.5]
        lon_range = [66.5, 100.0]

        climatology = dp['precip'].groupby('time.month').mean('time')
        selected_time = dp['precip'].sel(time=f'{year}-{month:02d}')
        anomaly = selected_time - climatology.sel(month=month)
        anomaly = anomaly.sel(lat=slice(lat_range[0], lat_range[1]), lon=slice(lon_range[0], lon_range[1]))
        anomaly = anomaly.squeeze()

        new_lon = np.linspace(lon_range[0], lon_range[1], 200)
        new_lat = np.linspace(lat_range[0], lat_range[1], 200)
        lon_grid, lat_grid = np.meshgrid(new_lon, new_lat)

        lon_vals, lat_vals = np.meshgrid(anomaly.lon.values, anomaly.lat.values)
        points = np.column_stack((lon_vals.ravel(), lat_vals.ravel()))
        values = anomaly.values.ravel()

        anomaly_interp = griddata(points, values, (lon_grid, lat_grid), method='linear')
        anomaly_interp = np.nan_to_num(anomaly_interp, nan=0.0)

        fig = go.Figure()
        fig.add_trace(go.Heatmap(
            z=anomaly_interp.tolist(),
            x=new_lon.tolist(),
            y=new_lat.tolist(),
            colorscale='RdBu_r',
            zmin=-5,
            zmax=5,
            colorbar=dict(title='Precipitation Anomaly')
        ))

        for _, shape in shapefile.iterrows():
            geometry = shape.geometry
            if geometry.geom_type == "Polygon":
                x, y = geometry.exterior.xy
                fig.add_trace(go.Scatter(x=list(x), y=list(y), mode='lines', line=dict(color='black'), showlegend=False))
            elif geometry.geom_type == "MultiPolygon":
                for polygon in geometry.geoms:
                    x, y = polygon.exterior.xy
                    fig.add_trace(go.Scatter(x=list(x), y=list(y), mode='lines', line=dict(color='black'), showlegend=False))

        fig.update_layout(title=f'Precipitation Anomaly for {year}-{month:02d} in Indian Subcontinent',
                          xaxis_title='Longitude',
                          yaxis_title='Latitude',
                          width=700, height=700,
                          autosize=True)

        return clean_json(fig.to_dict())
    except Exception as e:
        print(f"Error: {str(e)}")
        return None


# def plot_moving_avg_sst(ds, start_year, end_year, window_size=30):
#     """
#     Plots the mean SST (Sea Surface Temperature) for the Niño 3.4 region with a moving average using Plotly.

#     Parameters:
#         ds (xarray.Dataset): Dataset containing SST data with 'time', 'lat', 'lon', and 'sst'.
#         start_year (int): Start year.
#         end_year (int): End year.
#         window_size (int): Size of moving average window (default: 30 days).
#     """

    

#     df = sst_ds.to_dataframe().reset_index()
    
#     # Ensure time is in datetime format
#     df['time'] = pd.to_datetime(df['time'])

#     # Convert start and end years to dates (first and last day of the year)
#     start_date = pd.to_datetime(f'{start_year}-01-01')
#     end_date = pd.to_datetime(f'{end_year}-12-31')

#     # Filter data for the specified time range
#     df_filtered = df[(df['time'] >= start_date) & (df['time'] <= end_date)].copy()  # Ensure a copy

#     # Define Niño 3.4 region bounds
#     lat_min, lat_max = -5, 5
#     lon_min, lon_max = -170, -120  # Western Hemisphere (convert if necessary)

#     # Adjust longitudes if dataset uses 0-360 instead of -180 to 180
#     if df_filtered['lon'].max() > 180:
#         df_filtered.loc[:, 'lon'] = df_filtered['lon'].apply(lambda x: x - 360 if x > 180 else x)

#     # Filter for Niño 3.4 region
#     df_nino34 = df_filtered[(df_filtered['lat'] >= lat_min) & (df_filtered['lat'] <= lat_max) &
#                             (df_filtered['lon'] >= lon_min) & (df_filtered['lon'] <= lon_max)]

#     # Compute Mean SST over the Niño 3.4 region per time step
#     mean_sst = df_nino34.groupby('time')['sst'].mean().reset_index()

#     # Compute Moving Average
#     mean_sst['SST_MA'] = mean_sst['sst'].rolling(window=window_size, min_periods=1).mean()

#     # Create interactive line plot
#     fig = px.line(mean_sst, x='time', y=['sst', 'SST_MA'],
#                   labels={'value': 'SST (°C)', 'variable': 'Legend'},
#                   title=f'Niño 3.4 Region Mean SST with Moving Average ({start_year} to {end_year})')

#     # Update layout for interactivity
#     fig.update_layout(
#         xaxis=dict(title='Time', showgrid=True),
#         yaxis=dict(title='SST (°C)', showgrid=True),
#         hovermode="x unified"
#     )

#     return fig.to_json()

def plot_moving_avg_sst(start_year, end_year, window_size=30):
    """
    Plots the mean SST (Sea Surface Temperature) for the Niño 3.4 region with a moving average using Plotly.

    Parameters:
        start_year (int): Start year.
        end_year (int): End year.
        window_size (int): Size of moving average window (default: 30 days).
    """
    df = sst_ds.to_dataframe().reset_index()
    
    # Ensure time is in datetime format
    df['time'] = pd.to_datetime(df['time'])

    # Convert start and end years to dates (first and last day of the year)
    start_date = pd.to_datetime(f'{start_year}-01-01')
    end_date = pd.to_datetime(f'{end_year}-12-31')

    # Filter data for the specified time range - corrected the filtering condition
    df_filtered = df[(df['time'] >= start_date) & (df['time'] <= end_date)].copy()

    # Define Niño 3.4 region bounds
    lat_min, lat_max = -5, 5
    lon_min, lon_max = -170, -120  # Western Hemisphere

    # Adjust longitudes if dataset uses 0-360 instead of -180 to 180
    if df_filtered['lon'].max() > 180:
        df_filtered.loc[:, 'lon'] = df_filtered['lon'].apply(lambda x: x - 360 if x > 180 else x)

    # Filter for Niño 3.4 region
    df_nino34 = df_filtered[(df_filtered['lat'] >= lat_min) & (df_filtered['lat'] <= lat_max) &
                           (df_filtered['lon'] >= lon_min) & (df_filtered['lon'] <= lon_max)]

    # Compute Mean SST over the Niño 3.4 region per time step
    mean_sst = df_nino34.groupby('time')['sst'].mean().reset_index()

    # Sort data chronologically before computing moving average
    mean_sst = mean_sst.sort_values('time')

    # Compute Moving Average
    mean_sst['SST_MA'] = mean_sst['sst'].rolling(window=window_size, min_periods=1).mean()

    # Create interactive line plot
    fig = px.line(mean_sst, x='time', y=['sst', 'SST_MA'],
                  labels={'value': 'SST (°C)', 'variable': 'Legend'},
                  title=f'Niño 3.4 Region Mean SST with Moving Average ({start_year} to {end_year})')

    # Update layout for interactivity
    fig.update_layout(
        xaxis=dict(title='Time', showgrid=True),
        yaxis=dict(title='SST (°C)', showgrid=True),
        hovermode="x unified"
    )

    return fig.to_json()

def precipitation_bar(start_year, end_year):
    """
    Plots the average monthly precipitation in India as a bar chart using Plotly.

    Parameters:
        start_year (int): Start year.
        end_year (int): End year.
    """
    # Define the latitude and longitude range for the Indian region
    lat_range = [6.5, 38.5]
    lon_range = [66.5, 100.0]

    # Select the data within the specified lat/lon range
    precip_data = dp['precip'].sel(lat=slice(lat_range[0], lat_range[1]), lon=slice(lon_range[0], lon_range[1]))

    # Filter the data for the selected years
    precip_data_year_range = precip_data.sel(time=slice(str(start_year), str(end_year)))

    # Calculate the average precipitation for each month across the selected years
    monthly_avg_precip = precip_data_year_range.groupby('time.month').mean(dim='time')

    # Sum the precipitation over lat and lon for each month
    monthly_precip_sum = monthly_avg_precip.sum(dim=['lat', 'lon'])

    # Plot the bar chart using Plotly
    fig = go.Figure()

    fig.add_trace(go.Bar(
        x=np.arange(1, 13),
        y=monthly_precip_sum.values,
        marker=dict(color='skyblue'),
        textposition='auto'
    ))

    # Update layout of the plot
    fig.update_layout(
        title=f"Average Monthly Precipitation in India ({start_year} - {end_year})",
        xaxis_title="Month",
        yaxis_title="Average Precipitation (mm)",
        xaxis=dict(tickmode='array', tickvals=np.arange(1, 13), ticktext=["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"])
    )

    return fig.to_json()


def precipitation_pie(start_year, end_year):
    """
    Plots the percentage of precipitation in different homogeneous regions of India as a pie chart using Plotly.

    Parameters:
        start_year (int): Start year.
        end_year (int): End year.
    """
    # Define the latitude and longitude range for the Indian region
    lat_range = [6.5, 38.5]
    lon_range = [66.5, 100.0]

    # Select the data within the specified lat/lon range
    precip_data = dp['precip'].sel(lat=slice(lat_range[0], lat_range[1]), lon=slice(lon_range[0], lon_range[1]))

    # Filter the data for the selected years
    precip_data_year_range = precip_data.sel(time=slice(str(start_year), str(end_year)))

    # Calculate the total precipitation for the selected years (across the whole region)
    total_precip = precip_data_year_range.sum(dim=['lat', 'lon', 'time']).values.item()

    # Define the homogeneous regions with their latitude and longitude ranges
    regions = {
        "North West India": {"lat_range": [25, 37], "lon_range": [69, 79]},
        "South India": {"lat_range": [8, 16], "lon_range": [75, 81]},  # SPIN region
        "North East India": {"lat_range": [25, 28], "lon_range": [88, 97]},
        "Central India": {"lat_range": [21, 24], "lon_range": [75, 81]},
    }

    # Calculate the precipitation for each region over the selected years
    region_precip = {}
    for region, bounds in regions.items():
        region_precip_data = precip_data_year_range.sel(lat=slice(bounds['lat_range'][0], bounds['lat_range'][1]),
                                                      lon=slice(bounds['lon_range'][0], bounds['lon_range'][1]))
        # Sum over the latitude, longitude, and time and store the value directly
        region_precip[region] = region_precip_data.sum(dim=['lat', 'lon', 'time']).values.item()

    # Calculate the percentage of precipitation in each region
    region_percentages = {region: (precip / total_precip) * 100 for region, precip in region_precip.items()}

    # Create the pie chart using Plotly
    fig = go.Figure()

    fig.add_trace(go.Pie(
        labels=list(region_percentages.keys()),
        values=list(region_percentages.values()),
        marker=dict(colors=['cyan', 'safetyorange', 'yellowgreen', 'magenta']),
        textinfo='percent+label',
    ))

    # Update layout of the plot
    fig.update_layout(
        title=f"Percentage of Precipitation in Different Homogeneous Regions of India ({start_year} - {end_year})",
    )

    return fig.to_json()
    
@app.route('/')
def function():
    return render_template('index.html')

@app.route('/plot_global_precip', methods=['POST', 'OPTIONS'])
@cross_origin()
def plot_global_precipitation():
    if request.method == 'OPTIONS':
        return '', 204
    try:
        data = request.get_json()
        year = int(data.get('year', 2020))
        month = int(data.get('month', 1))

        print(f"Processing request for year: {year}, month: {month}")

        # Convert dataset longitudes from [0, 360] to [-180, 180]
        dp_converted = dp.assign_coords(lon=(((dp.lon + 180) % 360) - 180)).sortby('lon')

        # Compute climatology with error checking
        try:
            climatology = dp_converted['precip'].groupby('time.month').mean('time')
            selected_time = dp_converted['precip'].sel(time=f'{year}-{month:02d}')
            if selected_time.isnull().all():
                return jsonify({"error": "No data available for selected time period"}), 404
                
            anomaly = selected_time - climatology.sel(month=month)
            anomaly = anomaly.sel(lat=slice(-90, 90), lon=slice(-180, 180)).squeeze()
        except Exception as e:
            print(f"Error in data processing: {str(e)}")
            return jsonify({"error": f"Error processing climate data: {str(e)}"}), 500

        # Create interpolation grid
        new_lon = np.linspace(-180, 180, 400).tolist()  # Convert to list
        new_lat = np.linspace(-90, 90, 200).tolist()    # Convert to list
        lon_grid, lat_grid = np.meshgrid(new_lon, new_lat)

        # Prepare and interpolate data with error checking
        try:
            lon_vals, lat_vals = np.meshgrid(anomaly.lon.values, anomaly.lat.values)
            points = np.column_stack((lon_vals.ravel(), lat_vals.ravel()))
            values = anomaly.values.ravel()
            
            # Check for NaN values
            if np.isnan(values).all():
                return jsonify({"error": "All values are NaN"}), 500
                
            anomaly_interp = griddata(points, values, (lon_grid, lat_grid), method='linear')
            # Convert interpolated data to list and handle NaN values
            anomaly_interp = np.nan_to_num(anomaly_interp, nan=0).tolist()
        except Exception as e:
            print(f"Error in interpolation: {str(e)}")
            return jsonify({"error": f"Error in data interpolation: {str(e)}"}), 500

        # Create figure
        fig = go.Figure()
        
        # Add heatmap with error checking
        try:
            fig.add_trace(go.Heatmap(
                z=anomaly_interp,
                x=new_lon,
                y=new_lat,
                colorscale='RdBu_r',
                zmin=-5,
                zmax=5,
                colorbar=dict(title='Precipitation Anomaly')
            ))
        except Exception as e:
            print(f"Error creating heatmap: {str(e)}")
            return jsonify({"error": f"Error creating visualization: {str(e)}"}), 500

        # Load world boundaries with error checking
        try:
            shapefile = gpd.read_file("Shape File World/world-administrative-boundaries.shp")
            if shapefile is None or shapefile.empty:
                print("Warning: Empty or missing shapefile")
        except Exception as e:
            print(f"Error loading shapefile: {str(e)}")
            pass
        else:
            for _, shape in shapefile.iterrows():
                if shape.geometry is not None:
                    try:
                        if shape.geometry.geom_type == "Polygon":
                            x, y = shape.geometry.exterior.xy
                            fig.add_trace(go.Scatter(
                                x=list(x), 
                                y=list(y), 
                                mode='lines', 
                                line=dict(color='black'), 
                                showlegend=False
                            ))
                        elif shape.geometry.geom_type == "MultiPolygon":
                            for polygon in shape.geometry.geoms:
                                x, y = polygon.exterior.xy
                                fig.add_trace(go.Scatter(
                                    x=list(x), 
                                    y=list(y), 
                                    mode='lines', 
                                    line=dict(color='black'), 
                                    showlegend=False
                                ))
                    except Exception as e:
                        print(f"Error processing boundary: {str(e)}")
                        continue

        # Update layout
        fig.update_layout(
            title=f'Global Precipitation Anomaly for {year}-{month:02d}',
            xaxis_title='Longitude',
            yaxis_title='Latitude',
            width=1200,
            height=600,
            hovermode='closest'
        )

        # Convert the figure to a JSON-serializable format
        fig_dict = fig.to_dict()
        return jsonify(clean_json(fig_dict))
    except Exception as e:
        print(f"Unhandled error: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/plot_sst', methods=['POST'])
def plot_sst_anomaly():
    data = request.get_json()
    start_year_month = data.get('start_year_month', '2020-01')
    end_year_month = data.get('end_year_month', '2020-12')
    plot_json = plot_mean_sst_anomaly_plotly(start_year_month, end_year_month, sst_anom, lons, lats)
    return jsonify({"plot": plot_json})

@app.route('/plot_precip', methods=['POST', 'OPTIONS'])
@cross_origin()
def plot_precipitation_anomaly():
    if request.method == 'OPTIONS':
        return '', 204
    try:
        data = request.get_json()
        year = int(data.get('year', 2020))
        month = int(data.get('month', 1))

        plot_data = plot_precip_anomaly_plotly(year, month)
        if plot_data is None:
            return jsonify({"error": "Failed to generate plot"}), 500

        return jsonify(plot_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# @app.route('/plot_moving_avg_sst', methods=['POST'])
# def plot_moving_avg_sst_route():
#     data = request.get_json()
#     start_year = int(data.get('start_year', 1981))
#     end_year = int(data.get('end_year', 2020))
#     window_size = int(data.get('window_size', 30))
#     plot_json = plot_moving_avg_sst(start_year, end_year, window_size)
#     return jsonify({"plot": plot_json})

@app.route('/plot_moving_avg_sst', methods=['POST'])
def plot_moving_avg_sst_route():
    data = request.get_json()
    start_year = int(data.get('start_year', 1981))
    end_year = int(data.get('end_year', 2020))
    window_size = int(data.get('window_size', 30))
    print(f"Plotting SST for period: {start_year}-{end_year}")  # Debug print
    plot_json = plot_moving_avg_sst(start_year, end_year, window_size)
    return jsonify({"plot": plot_json})

@app.route('/plot_precip_bar', methods=['POST'])
def plot_precip_bar_route():
    data = request.get_json()
    start_year = int(data.get('start_year', 1981))
    end_year = int(data.get('end_year', 2020))
    plot_json = precipitation_bar(start_year, end_year)
    return jsonify({"plot": plot_json})


@app.route('/plot_precip_pie', methods=['POST'])
def plot_precip_pie_route():
    data = request.get_json()
    start_year = int(data.get('start_year', 1981))
    end_year = int(data.get('end_year', 2020))
    plot_json = precipitation_pie(start_year, end_year)
    return jsonify({"plot": plot_json})


@app.route('/get_plot', methods=['GET', 'POST'])
def get_plot():
    try:
        if request.method == "POST":
            form_input = request.get_json()
            if not form_input:
                return jsonify({'error': 'No input data provided'}), 400
                
            year = form_input.get('year')
            month = form_input.get('month')
            
            if not year or not month:
                return jsonify({'error': 'Year and month are required'}), 400
                
            print(f"Processing request for year: {year}, month: {month}")
            
            # Generate all plots with error handling
            try:
                url1 = ONI_bar_plot(year, month)
                url2 = ONIheatmap()
                url3 = past10YearsONIValues(year)
                url4 = ONItimeSeries()
                url5 = DMI_bar_plot(year, month)
                url6 = DMIheatmap()
                url7 = past10YearsDMIValues(year) 
                url8 = DMItimeSeries()
                url9 = DMI_vs_ONI_bar_plot(year, month)
                url10 = ONIvsDMItimeSeries()
                url11 = ONI_seasonal(year, month)
                url12 = DMI_seasonal(year, month)
                url13 = ONI_vs_DMI_seasonal(year, month)
            except Exception as e:
                print(f"Error generating plots: {str(e)}")
                return jsonify({'error': f'Error generating plots: {str(e)}'}), 500
            
            response_data = {
                'oni_barPlot': url1,
                'oni_heatMap': url2,
                'oni_past_10_years': url3,
                'oni_timeSeries': url4,
                'dmi_barPlot': url5,
                'dmi_heatMap': url6,
                'dmi_past_10_years': url7,
                'dmi_timeSeries': url8,
                'oni_vs_dmi_barPlot': url9,
                'oni_vs_dmi_timeSeries': url10,
                'oni_seasonal': url11,
                'dmi_seasonal': url12,
                'oni_vs_dmi_seasonal': url13
            }
            
            return jsonify(response_data)
        else:
            return jsonify({'message': 'Please send a POST request with year and month.'}), 405
            
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return jsonify({'error': f'Server error: {str(e)}'}), 500


# @app.route('/get_images', methods=['GET', 'POST'])
# def get_images():
#     if request.method == "GET":
#         image_files = sorted([os.path.join(IMAGES_FOLDER, f) for f in os.listdir(IMAGES_FOLDER) 
#                             if f.endswith((".png", ".jpg", ".jpeg"))])
#         if not image_files:
#             return jsonify({'error': 'No images found in the directory'}), 404

#         pdf_path = "static/generated_report.pdf"
#         c = canvas.Canvas(pdf_path, pagesize=letter)

#         y_position = 750  # Start position from top
#         for img in image_files:
#             if os.path.exists(img):  # Ensure image exists before adding
#                 c.drawImage(ImageReader(img), 50, y_position, width=500, height=300, 
#                            preserveAspectRatio=True, mask='auto')
#                 y_position -= 320  # Move down for the next image
#                 if y_position < 50:  # If page is full, create a new page
#                     c.showPage()
#                     y_position = 750

#         c.save()

#         return send_file("static/generated_report.pdf", as_attachment=True, 
#                         download_name="climate_report.pdf", mimetype="application/pdf")
#     else:
#         return jsonify({'message': 'Please send a GET request with year and month.'})

# if __name__ == '__main__':
    # app.run(debug=True, host='0.0.0.0', port=5000)
# In your Flask app (app.py)

@app.route('/generate_report', methods=['POST'])
@cross_origin()
def generate_report():
    try:
        data = request.get_json()
        urls = data.get('urls', [])
        month = data.get('month', '')
        year = data.get('year', '')
        plot_titles = data.get('plotTitles', {})
        sst_plot = data.get('sstPlot', None)

        if not urls:
            return jsonify({'error': 'No URLs provided'}), 400

        # Setup Chrome options for headless browser
        chrome_options = Options()
        chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--window-size=1200,800')

        # Create PDF document
        pdf_buffer = BytesIO()
        doc = SimpleDocTemplate(
            pdf_buffer,
            pagesize=letter,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=72
        )

        # Create story for PDF
        story = []
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            spaceAfter=30
        )
        
        section_style = ParagraphStyle(
            'SectionTitle',
            parent=styles['Heading2'],
            fontSize=18,
            spaceAfter=20
        )

        # Add main title
        title = Paragraph(f"Climate Analysis Report for {month} {year}", title_style)
        story.append(title)
        story.append(Spacer(1, 12))

        # Initialize webdriver
        driver = webdriver.Chrome(options=chrome_options)

        try:
            # First handle SST plot if available
            if sst_plot:
                section_title = Paragraph("Sea Surface Temperature Analysis", section_style)
                story.append(section_title)
                story.append(Spacer(1, 6))
                
                # Process SST plot
                try:
                    driver.get(sst_plot)
                    time.sleep(2)
                    screenshot = driver.get_screenshot_as_png()
                    img = Image.open(BytesIO(screenshot))
                    
                    if img.mode != 'RGB':
                        img = img.convert('RGB')
                    
                    img_buffer = BytesIO()
                    img.save(img_buffer, format='JPEG', quality=85)
                    img_buffer.seek(0)
                    
                    img = RLImage(img_buffer, width=6*inch, height=4*inch)
                    story.append(img)
                    story.append(Spacer(1, 12))
                except Exception as e:
                    print(f"Error processing SST plot: {str(e)}")

            # Process other plots with correct titles
            current_section = ''
            for i, url in enumerate(urls):
                try:
                    # Determine plot section and title
                    if i < 5:
                        section = "ONI Analysis"
                        title = plot_titles['oni'][i]
                    elif i < 10:
                        section = "DMI Analysis"
                        title = plot_titles['dmi'][i-5]
                    else:
                        section = "Combined ONI and DMI Analysis"
                        title = plot_titles['combined'][i-10]
                    
                    # Add section header if changed
                    if section != current_section:
                        current_section = section
                        section_header = Paragraph(section, section_style)
                        story.append(section_header)
                        story.append(Spacer(1, 6))
                    
                    # Add plot title
                    plot_title = Paragraph(title, styles['Heading3'])
                    story.append(plot_title)
                    story.append(Spacer(1, 6))
                    
                    # Process plot
                    driver.get(url)
                    time.sleep(2)
                    screenshot = driver.get_screenshot_as_png()
                    img = Image.open(BytesIO(screenshot))
                    
                    if img.mode != 'RGB':
                        img = img.convert('RGB')
                    
                    img_buffer = BytesIO()
                    img.save(img_buffer, format='JPEG', quality=85)
                    img_buffer.seek(0)
                    
                    img = RLImage(img_buffer, width=6*inch, height=4*inch)
                    story.append(img)
                    story.append(Spacer(1, 12))
                    
                except Exception as e:
                    print(f"Error processing plot {i}: {str(e)}")
                    error_text = Paragraph(f"Error including plot: {str(e)}", styles['Normal'])
                    story.append(error_text)
                    story.append(Spacer(1, 12))
                    continue

        finally:
            driver.quit()

        # Build PDF
        doc.build(story)
        pdf_buffer.seek(0)
        
        return send_file(
            pdf_buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f'climate_report_{year}_{month}.pdf'
        )

    except Exception as e:
        print(f"Error generating report: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Update port to avoid conflicts
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)