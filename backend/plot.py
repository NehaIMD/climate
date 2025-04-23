import numpy as np
import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns
import plotly.express as px
from matplotlib import style
from flask import Flask, jsonify, render_template, send_file
from flask import request
import plotly.graph_objects as go
from flask_cors import CORS
import os
import shutil
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.utils import ImageReader
from oni_vs_dmi import DMI_vs_ONI_bar_plot, ONIvsDMItimeSeries, ONI_vs_DMI_seasonal
from oni import ONI_bar_plot, ONIheatmap, ONItimeSeries, past10YearsONIValues, ONI_seasonal
from dmi import DMI_bar_plot, DMIheatmap, DMItimeSeries, past10YearsDMIValues, DMI_seasonal
app = Flask(__name__)

CORS(app)

@app.route('/')
def function():
    return render_template('index.html')

IMAGES_FOLDER = "images"  # Directory where images are stored
STATIC_FOLDER = os.path.join(os.getcwd(), 'static')

def clear_static_folder():
    """Clears all files and subdirectories in the static folder."""
    if os.path.exists(STATIC_FOLDER):
        for item in os.listdir(STATIC_FOLDER):
            item_path = os.path.join(STATIC_FOLDER, item)
            if os.path.isfile(item_path):
                os.remove(item_path)  # Remove file
            elif os.path.isdir(item_path):
                shutil.rmtree(item_path)  # Remove directory


@app.route('/get_plot', methods = ['GET', 'POST'])
def get_plot():
    if request.method =="POST":
        clear_static_folder()
        formInput = request.get_json()
        year = formInput['year']
        month = formInput['month']
        print(year, month)
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
    #     return render_template('index.html', plot_url1 = url1, plot_url2 = url2, 
    #                            plot_url3 = url3, plot_url4 = url4, plot_url5 = url5, 
    #                            plot_url6 = url6, plot_url7 = url7, plot_url8 = url8, 
    #                            plot_url9 = url9, plot_url10 = url10)
    # else:
    #     return render_template('index.html')
        return jsonify({
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
        })
    else:
        return jsonify({'message': 'Please send a POST request with year and month.'})

@app.route('/get_images', methods = ['GET', 'POST'])
def get_images():
    if request.method =="POST":
        formInput = request.get_json()
        year = formInput['year']
        month = formInput['month']
        print(f"Received request for Year: {year}, Month: {month}")
        
        image_files = sorted([os.path.join(IMAGES_FOLDER, f) for f in os.listdir(IMAGES_FOLDER) if f.endswith((".png", ".jpg", ".jpeg"))])
        if not image_files:
            return jsonify({'error': 'No images found in the directory'}), 404

        pdf_path = "static/generated_report.pdf"
        c = canvas.Canvas(pdf_path, pagesize=letter)

        y_position = 750  # Start position from top
        for img in image_files:
            if os.path.exists(img):  # Ensure image exists before adding
                c.drawImage(ImageReader(img), 50, y_position, width=500, height=300, preserveAspectRatio=True, mask='auto')
                y_position -= 320  # Move down for the next image
                if y_position < 50:  # If page is full, create a new page
                    c.showPage()
                    y_position = 750

        c.save()

        return send_file(pdf_path, as_attachment=True, download_name="climate_report.pdf", mimetype="application/pdf")
    else:
        return jsonify({'message': 'Please send a POST request with year and month.'})

app.secret_key = 'm2n2s'

if __name__ == '__main__':
    app.run('127.0.0.1', 5000, debug=True)