import numpy as np
import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns
import plotly.express as px
from datetime import datetime
from matplotlib import style
import plotly.graph_objects as go

data2 = pd.read_csv("data/Monthly DMI values from 1950.csv")
# data2= data2.drop(columns=['PeriodTxt'])
print(data2.columns)

current_date = datetime.now()

def DMI_bar_plot(year, month):
    #Returns a barplot showing how ONI values have varied for the past 12 months
    month = int(month) if month else int(current_date.month)
    year = int(year) if year else int(current_date.year)
    last_12_months_monthtxt = []
    last_12_months_values = []
    for i in range(len(data2)):
        row_year = data2.loc[i, 'Year']
        row_month = data2.loc[i, 'MonthNum']
        month_diff = (year - row_year) * 12 + (month - row_month)
        if 0 <= month_diff < 12:
            last_12_months_monthtxt.append(data2.loc[i, 'PeriodNum'])
            last_12_months_values.append(data2.loc[i, 'Value'])
    months = last_12_months_monthtxt
    values = last_12_months_values
    graph = pd.DataFrame({'Months': months, 'Values': values})
    fig = px.bar(graph, x='Months',
                 y='Values', 
                 template='presentation', 
                 title="DMI Values for the past 12 months")
    fig.update_layout(
        yaxis=dict(range=[-3, 3])
    )
    fig.write_html('static/DMIbarplot.html',full_html=False,include_plotlyjs='cdn')
    fig.write_image("images/DMIbarplot.jpeg")    
    return 'http://127.0.0.1:5000/static/DMIbarplot.html'

def DMI_seasonal(year, month):
    #Returns a barplot showing how ONI values have varied for the past 12 months
    month = int(month) if month else int(current_date.month)
    year = int(year) if year else int(current_date.year)
    last_12_months_monthtxt = []
    last_12_months_values = []
    for i in range(len(data2)):
        row_year = data2.loc[i, 'Year']
        row_month = data2.loc[i, 'MonthNum']
        month_diff = (year - row_year) * 12 + (month - row_month)
        if 0 <= month_diff < 12:
            last_12_months_monthtxt.append(data2.loc[i, 'PeriodTxt'])
            last_12_months_values.append(data2.loc[i, 'Value'])
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
                 title="Seasonal DMI Value variation for the past 12 months")
    fig.update_layout(
        yaxis=dict(range=[-3, 3])
    )
    fig.write_html('static/DMI_Seasonal_Barplot.html',full_html=False,include_plotlyjs='cdn')
    fig.write_image("images/DMI_Seasonal_Barplot.jpeg")
    return 'http://127.0.0.1:5000/static/DMI_Seasonal_Barplot.html'


def past10YearsDMIValues(year):
    # Returns an html file containing plot comparing DMI values for each month for the past 10 years    
    end_year = int(year) if year else int(current_date.year)
    start_year = (int(year) - 10) if year else (int(current_date.year) - 10)
    filtered_data_DMI = data2[(data2["Year"] >= start_year) & (data2["Year"] <= end_year)]
    global_mean_DMI = data2['Value'].mean()
    
    fig = px.line(
        filtered_data_DMI, 
        x='MonthNum', 
        y='Value', 
        color='Year', 
        title="Variation of DMI Values for last 10 years"
    )
    fig.add_hline(
        y=global_mean_DMI, 
        line=dict(color='black', dash='dash'), 
        annotation_text='Global Mean DMI value', 
        annotation_position='top left'
    )
    fig.update_layout(
        xaxis_title="Month",
        yaxis_title="Value",
        yaxis=dict(range=[-3, 3]),
        xaxis=dict(tickmode='array', tickvals=list(range(1, 13)), ticktext=['January', 'February', 'FMA', 'MAM', 'AMJ', 'MJJ', 'JJA', 'JAS', 'ASO', 'SON', 'OND', 'NDJ'])
    )
    fig.write_html('static/allYearsDMIPlot.html',full_html=False,include_plotlyjs='cdn')
    fig.write_image("images/allYearsDMIPlot.jpeg")
    return 'http://127.0.0.1:5000/static/allYearsDMIPlot.html'


def DMItimeSeries():
    # Returns a time series plot showing how DMI values have varied over time
    months = data2['PeriodNum'].tolist()
    values = data2['Value'].tolist()
    ym = pd.DataFrame({'Months': months, 'Values': values})
    # ym = pd.DataFrame(list(yearly_means.items()), columns=["Year", "MeanValue"])
    fig = px.line(ym, x='Months', 
                  y='Values', 
                  template='presentation', 
                  title='Variation of DMI values over time')
    # fig = px.line(ym, x='Year', 
    #               y='MeanValue', 
    #               template='presentation', 
    #               title='Variation of DMI values over time')
    fig.update_layout(
        yaxis=dict(range=[-3, 3])
    )
    fig.write_html('static/DMItimeSeries.html',full_html=False,include_plotlyjs='cdn')    
    fig.write_image("images/DMItimeSeries.jpeg")
    return 'http://127.0.0.1:5000/static/DMItimeSeries.html'


def DMIheatmap():
    # Returns a heatmap showing how ONI values have varied over time
    heatmap_data = data2.pivot(index="MonthNum", columns="Year", values="Value")
    fig2 = px.imshow(heatmap_data, 
                    labels={'x': 'Year', 'y': 'Month', 'color': 'Value'}, 
                    title="Variation of DMI values Across Years represented using Heatmap",
                    color_continuous_scale="RdBu"
                    )
    fig2.write_html('static/DMIheatmap.html',full_html=False,include_plotlyjs='cdn')
    fig2.write_image("images/DMIheatmap.jpeg")
    return 'http://127.0.0.1:5000/static/DMIheatmap.html'