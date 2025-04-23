import numpy as np
import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns
import plotly.express as px
from matplotlib import style
from datetime import datetime
import plotly.graph_objects as go

data = pd.read_csv("data/Monthly Oceanic Nino Index (ONI) - Long.csv")
data2 = pd.read_csv("data/Monthly DMI values from 1950.csv")
# data = data.drop(columns=['PeriodTxt'])
print(data.columns)

current_date = datetime.now()

def DMI_vs_ONI_bar_plot(year, month):
    month = int(month) if month else int(current_date.month)
    year = int(year) if year else int(current_date.year)
    last_12_months_monthtxt = []
    last_12_months_ONI_values = []
    last_12_months_DMI_values = []
    for i in range(len(data)):
        row_year = data2.loc[i, 'Year']
        row_month = data2.loc[i, 'MonthNum']
        month_diff = (year - row_year) * 12 + (month - row_month)
        if 0 <= month_diff < 12:
            last_12_months_monthtxt.append(data2.loc[i, 'PeriodNum'])
            last_12_months_ONI_values.append(data2.loc[i, 'Value'])
            last_12_months_DMI_values.append(data.loc[i, 'Value'])
    months = last_12_months_monthtxt
    comparison_df = pd.DataFrame({
        'Months': last_12_months_monthtxt,
        'ONI': last_12_months_ONI_values,
        'DMI': last_12_months_DMI_values
    })
    fig = px.line(
        comparison_df,
        x='Months',
        y=['ONI', 'DMI'],  # Plot both ONI and DMI
        template='presentation',
        labels={'value': 'Index Value', 'variable': 'Index Type'},  # Add legend and axis labels
        title="Comparison of running 3-month mean of ONI and DMI values over the Last 12 Months"
    )
    fig.update_layout(
        yaxis=dict(range=[-3, 3]),
        xaxis_title="Months",
        yaxis_title="Index Value",
        legend_title="Index Type"
    )
    fig.write_html('static/ONIvsDMIbarplot.html',full_html=False,include_plotlyjs='cdn')
    fig.write_image("images/ONIvsDMIbarplot.jpeg")
    return 'http://127.0.0.1:5000/static/ONIvsDMIbarplot.html'

def ONIvsDMItimeSeries():
    # yearly_means = data2.groupby('Year')['Value'].mean().to_dict()
    months = data2['PeriodNum'].tolist()
    ONIvalues = data['Value'].tolist()
    DMIvalues = data2['Value'].tolist()
    ym = pd.DataFrame({'Months': months, 'ONIValues': ONIvalues, 'DMIValues': DMIvalues})
    # ym = pd.DataFrame(list(yearly_means.items()), columns=["Year", "MeanValue"])
    fig = px.line(ym, x='Months', 
                  y=['ONIValues', 'DMIValues'], 
                  template='presentation', 
                  labels={'value': 'Index Value', 'variable': 'Index Type'},  # Add legend and axis labels
                  title='Variation of running 3-month mean of ONI and DMI values over time')
    # fig = px.line(ym, x='Year', 
    #               y='MeanValue', 
    #               template='presentation', 
    #               title='Variation of DMI values over time')
    fig.update_layout(
        yaxis=dict(range=[-3, 3])
    )
    fig.write_html('static/ONIvsDMItimeSeries.html',full_html=False,include_plotlyjs='cdn')
    fig.write_image("images/ONIvsDMItimeSeries.jpeg")
    return 'http://127.0.0.1:5000/static/ONIvsDMItimeSeries.html'

def ONI_vs_DMI_seasonal(year, month):
    #Returns a barplot showing how ONI values have varied for the past 12 months
    month = int(month) if month else int(current_date.month)
    year = int(year) if year else int(current_date.year)
    last_12_months_monthtxt = []
    last_12_months_ONI_values = []
    last_12_months_DMI_values = []
    for i in range(len(data)):
        row_year = data2.loc[i, 'Year']
        row_month = data2.loc[i, 'MonthNum']
        month_diff = (year - row_year) * 12 + (month - row_month)
        if 0 <= month_diff < 12:
            last_12_months_monthtxt.append(data2.loc[i, 'PeriodTxt'])
            last_12_months_ONI_values.append(data2.loc[i, 'Value'])
            last_12_months_DMI_values.append(data.loc[i, 'Value'])
    months = last_12_months_monthtxt
    oni_mean_values = []
    dmi_mean_values = []
    middle_months = []
    for i in range(0, len(last_12_months_ONI_values), 3):
        chunk = last_12_months_ONI_values[i:i+3]
        if len(chunk) == 3:
            mean = np.mean(chunk)
            oni_mean_values.append(mean)
            middle_month = months[i + 1]  # The second element is the middle one
            middle_months.append(middle_month)
    for i in range(0, len(last_12_months_DMI_values), 3):
        chunk = last_12_months_DMI_values[i:i+3]
        if len(chunk) == 3:
            mean = np.mean(chunk)
            dmi_mean_values.append(mean)
    comparison_df = pd.DataFrame({
        'Months': middle_months,
        'ONI': oni_mean_values,
        'DMI': dmi_mean_values
    })
    comparison_df_melted = comparison_df.melt(
        id_vars='Months',
        value_vars=['ONI', 'DMI'],
        var_name='Index Type',
        value_name='Mean Value'
    )
    fig = px.bar(
        comparison_df_melted,
        x='Months',
        y='Mean Value',
        color='Index Type',
        barmode='group',
        text='Mean Value',
        template='presentation',
        title="Variation of running 3-month mean of ONI and DMI values over time"
    )
    fig.update_layout(
        yaxis=dict(range=[-3, 3]),
        xaxis_title="Months",
        yaxis_title="Index Value",
        legend_title="Index Type"
    )
    fig.write_html('static/ONIvsDMI_seasonal_barplot.html',full_html=False,include_plotlyjs='cdn')
    fig.write_image("images/ONIvsDMI_seasonal_barplot.jpeg")
    return 'http://127.0.0.1:5000/static/ONIvsDMI_seasonal_barplot.html'
