import numpy as np
import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns
import plotly.express as px
from matplotlib import style
import plotly.graph_objects as go
from datetime import datetime

data = pd.read_csv("data/Monthly Oceanic Nino Index (ONI) - Long.csv")
# data = data.drop(columns=['PeriodTxt'])
print(data.columns)

current_date = datetime.now()

def ONI_bar_plot(year, month):
    #Returns a barplot showing how ONI values have varied for the past 12 months
    month = int(month) if month else int(current_date.month)
    year = int(year) if year else int(current_date.year)
    last_12_months_monthtxt = []
    last_12_months_values = []
    for i in range(len(data)):
        row_year = data.loc[i, 'Year']
        row_month = data.loc[i, 'MonthNum']
        month_diff = (year - row_year) * 12 + (month - row_month)
        if 0 <= month_diff < 12:
            last_12_months_monthtxt.append(data.loc[i, 'PeriodNum'])
            last_12_months_values.append(data.loc[i, 'Value'])
    months = last_12_months_monthtxt
    values = last_12_months_values
    graph = pd.DataFrame({'Months': months, 'Values': values})
    fig = px.bar(graph, x='Months', 
                 y='Values', 
                 template='presentation', 
                 title="Running 3-month average of ONI Values for the past 12 months")
    fig.update_layout(
        yaxis=dict(range=[-3, 3])
    )
    fig.write_html('static/ONIbarplot.html',full_html=False,include_plotlyjs='cdn')
    fig.write_image("images/ONIbarplot.jpeg")
    return 'http://127.0.0.1:5000/static/ONIbarplot.html'

def ONI_seasonal(year, month):
    #Returns a barplot showing how ONI values have varied for the past 12 months
    month = int(month) if month else int(current_date.month)
    year = int(year) if year else int(current_date.year)
    last_12_months_monthtxt = []
    last_12_months_values = []
    for i in range(len(data)):
        row_year = data.loc[i, 'Year']
        row_month = data.loc[i, 'MonthNum']
        month_diff = (year - row_year) * 12 + (month - row_month)
        if 0 <= month_diff < 12:
            last_12_months_monthtxt.append(data.loc[i, 'PeriodTxt'])
            last_12_months_values.append(data.loc[i, 'Value'])
    months = last_12_months_monthtxt
    values = last_12_months_values
    mean_values = []
    middle_months = []
    for i in range(0, len(values), 3):
        chunk = values[i:i+3]
        if len(chunk) == 3:
            mean = np.mean(chunk)
            mean_values.append(mean)
            middle_month = months[i + 1]  # The second element is the middle one
            middle_months.append(middle_month)
    graph = pd.DataFrame({'Months': middle_months, 'Values': mean_values})
    fig = px.bar(graph, x='Months', 
                 y='Values', 
                 template='presentation', 
                 title="Seasonal ONI Value variation for the past 12 months")
    fig.update_layout(
        yaxis=dict(range=[-3, 3])
    )
    fig.write_html('static/ONI_Seasonal_Barplot.html',full_html=False,include_plotlyjs='cdn')
    fig.write_image("images/ONI_Seasonal_Barplot.jpeg")
    return 'http://127.0.0.1:5000/static/ONI_Seasonal_Barplot.html'


def past10YearsONIValues(year):
    # Returns an html file containing plot comparing ONI values for each month for the past 10 years        
    end_year = int(year) if year else int(current_date.year)
    start_year = (int(year) - 10) if year else (int(current_date.year) - 10)
    global_mean = data['Value'].mean()
    filtered_data = data[(data["Year"] >= start_year) & (data["Year"] <= end_year)]

    fig = px.line(
        filtered_data, 
        x='MonthNum', 
        y='Value', 
        color='Year', 
        title="Variation of ONI Values for last 10 years"
    )
    fig.add_hline(
        y=global_mean, 
        line=dict(color='black', dash='dash'), 
        annotation_text='Global Mean OMI value', 
        annotation_position='top left'
    )
    fig.update_layout(
        xaxis_title="Month",
        yaxis_title="Value",
        xaxis=dict(tickmode='array', tickvals=list(range(1, 13)), ticktext=['DJF', 'JFM', 'FMA', 'MAM', 'AMJ', 'MJJ', 'JJA', 'JAS', 'ASO', 'SON', 'OND', 'NDJ'])
    )
    fig.write_html('static/allYearsONIPlot.html',full_html=False,include_plotlyjs='cdn')
    fig.write_image("images/allYearsONIPlot.jpeg")
    return 'http://127.0.0.1:5000/static/allYearsONIPlot.html'


def ONItimeSeries():
    # Returns a time series plot showing how DMI values have varied over time
    months = data['PeriodNum'].tolist()
    values = data['Value'].tolist()
    ym = pd.DataFrame({'Months': months, 'Values': values})
    # ym = pd.DataFrame(list(yearly_means.items()), columns=["Year", "MeanValue"])
    fig = px.line(ym, x='Months', 
                  y='Values', 
                  template='presentation', 
                  title='Variation of ONI values over time')
    # fig = px.line(ym, x='Year', 
    #               y='MeanValue', 
    #               template='presentation', 
    #               title='Variation of ONI values over time')
    fig.update_layout(
        yaxis=dict(range=[-3, 3])
    )
    fig.write_html('static/ONItimeSeries.html',full_html=False,include_plotlyjs='cdn')    
    fig.write_image("images/ONItimeSeries.jpeg")
    return 'http://127.0.0.1:5000/static/ONItimeSeries.html'


def ONIheatmap():
    # Returns a heatmap showing how ONI values have varied over time
    heatmap_data = data.pivot(index="MonthNum", columns="Year", values="Value")
    fig2 = px.imshow(heatmap_data, 
                    labels={'x': 'Year', 'y': 'Month', 'color': 'Value'}, 
                    title="Variation of ONI values Across Years represented using Heatmap",
                    color_continuous_scale="RdBu"
                    )
    fig2.write_html('static/ONIheatmap.html',full_html=False,include_plotlyjs='cdn')
    fig2.write_image("images/ONIheatmap.jpeg")
    return 'http://127.0.0.1:5000/static/ONIheatmap.html'