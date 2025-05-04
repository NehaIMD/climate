
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, DownloadIcon, InfoIcon } from 'lucide-react'
import { Bar, BarChart, Line, LineChart, Pie, PieChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Cell } from "recharts"
import dynamic from 'next/dynamic'
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = () => {
  return (
    <div className="absolute inset-0 z-10 backdrop-blur-sm flex flex-col items-center justify-center bg-white/80">
      <Loader2 className="w-12 h-12 text-sky-600 animate-spin mb-4" />
      <p className="text-lg text-sky-800 animate-pulse">Generating map...</p>
      <p className="text-sm text-sky-600 mt-2">This may take a few moments...</p>
    </div>
  );
};


const Plot = dynamic(() => import('react-plotly.js'), { ssr: false })

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const weatherData = {
  rainfall: [
    { month: "Jan", value: 50 },
    { month: "Feb", value: 60 },
    { month: "Mar", value: 70 },
    { month: "Apr", value: 80 },
    { month: "May", value: 90 },
  ],
  sst: [
    { month: "Jan", value: 25 },
    { month: "Feb", value: 26 },
    { month: "Mar", value: 27 },
    { month: "Apr", value: 28 },
    { month: "May", value: 29 },
  ],
}


const MapLegend = ({ title, items }) => (
  <div className="absolute bottom-4 right-4 bg-white p-3 rounded shadow">
    <h3 className="font-semibold mb-2 text-lg">{title}</h3>
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          <div className="w-5 h-5 mr-3" style={{ backgroundColor: item.color }} />
          <span className="text-base">{item.label}</span>
        </div>
      ))}
    </div>
  </div>
)

const MapDisplay = ({ mapType, activeMapType }) => {
  const [loading, setLoading] = useState(false);
  const [plot, setPlot] = useState(null);
  const [error, setError] = useState("");
  const [year, setYear] = useState("2020");
  const [month, setMonth] = useState("1");
  const [startYear, setStartYear] = useState("2020");
  const [startMonth, setStartMonth] = useState("1");
  const [endYear, setEndYear] = useState("2020");
  const [endMonth, setEndMonth] = useState("12");

  useEffect(() => {
    setPlot(null);
  }, [activeMapType]);

  const yearOptions = Array.from({ length: 2024 - 1980 + 1 }, (_, i) => 1980 + i);
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);

  const fetchPrecipitationPlot = async () => {
    setLoading(true);
    setError("");
    try {
      const endpoint = activeMapType === 'regional' ? '/plot_precip' : '/plot_global_precip';
      const response = await fetch(`http://127.0.0.1:5000${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          year: parseInt(year),
          month: parseInt(month)
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${activeMapType} precipitation data`);
      }

      const data = await response.json();
      setPlot(data);
    } catch (err) {
      setError(`Failed to fetch ${activeMapType} precipitation data. Please try again.`);
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSSTPlot = async () => {
    setLoading(true);
    setError("");
    try {
      const startYearMonth = `${startYear}-${startMonth.padStart(2, "0")}`;
      const endYearMonth = `${endYear}-${endMonth.padStart(2, "0")}`;

      const response = await fetch("http://127.0.0.1:5000/plot_sst", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          start_year_month: startYearMonth,
          end_year_month: endYearMonth,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch SST plot");
      }

      const data = await response.json();
      setPlot(JSON.parse(data.plot));
    } catch (err) {
      setError("Failed to fetch SST data. Please try again.");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (mapType === "rainfall") {
    return (
      <div className="flex flex-col items-center">
        <div className="mb-4 flex gap-4">
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent className="max-h-[200px] overflow-y-auto">
              {yearOptions.map((y) => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Month" />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((m) => (
                <SelectItem key={m} value={m.toString()}>
                  {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={fetchPrecipitationPlot}
            disabled={loading}
            className="bg-sky-600 text-white hover:bg-sky-700"
          >
            {loading ? "Loading..." : "Generate Plot"}
          </Button>
        </div>

        <div className={activeMapType === "regional" ? "w-[700px] h-[700px]" : "w-full h-[500px]"}>
          <PlotDisplay
            loading={loading}
            plot={plot}
            error={error}
            type="rainfall"
            mapType={activeMapType}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <p className="font-medium">Start Date</p>
          <div className="flex gap-2">
            <Select value={startYear} onValueChange={setStartYear}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Start Year" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] overflow-y-auto">
                {yearOptions.map((y) => (
                  <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={startMonth} onValueChange={setStartMonth}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Start Month" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((m) => (
                  <SelectItem key={m} value={m.toString()}>
                    {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <p className="font-medium">End Date</p>
          <div className="flex gap-2">
            <Select value={endYear} onValueChange={setEndYear}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="End Year" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] overflow-y-auto">
                {yearOptions.map((y) => (
                  <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={endMonth} onValueChange={setEndMonth}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="End Month" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((m) => (
                  <SelectItem key={m} value={m.toString()}>
                    {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={fetchSSTPlot}
          disabled={loading}
          className="bg-sky-600 text-white hover:bg-sky-700 col-span-2"
        >
          {loading ? "Loading..." : "Generate SST Plot"}
        </Button>
      </div>

      <PlotDisplay loading={loading} plot={plot} error={error} type="sst" />
    </div>
  );
};

const PlotDisplay = ({ loading, plot, error, type, mapType }) => {
  const getPlotLayout = () => {
    const baseLayout = {
      ...plot?.layout,
      autosize: true,
      margin: { l: 50, r: 50, t: 50, b: 50 },
    };

    // For regional rainfall map, maintain square aspect ratio
    if (type === "rainfall" && mapType === "regional") {
      return {
        ...baseLayout,
        height: 500,
        width: 500,
      };
    }

    // For global rainfall and other maps, allow stretching
    return {
      ...baseLayout,
      height: 500,
      width: null, // Let it be responsive horizontally
    };
  };

  return (
    <div id={`${type}-plot`} className={`rounded-lg overflow-hidden relative bg-gray-100 ${type === "rainfall" && mapType === "regional"
      ? "h-[500px] w-[500px] mx-auto" // Center the regional map
      : "h-[500px] w-full" // Full width for other maps
      }`}>
      {loading ? (
        <LoadingSpinner
          text="Generating map..."
          subText="This may take a few moments..."
        />
      ) : error ? (
        <div className="w-full h-full flex items-center justify-center text-red-500 text-lg">
          {error}
        </div>
      ) : plot ? (
        <Plot
          data={plot.data}
          layout={getPlotLayout()}
          useResizeHandler={true}
          style={{ width: '100%', height: '100%' }}
          config={{ responsive: true }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-500 text-lg">
          Select parameters and click Generate Plot
        </div>
      )}
    </div>
  );
};

const ChartDisplay = ({ chartType, data, plotData, loading }) => {
  if (loading) {
    return (
      <div className="relative h-[400px] w-full">
        <LoadingSpinner
          text="Generating chart..."
          subText="Processing weather data..."
        />
      </div>
    );
  }

  if (plotData) {
    return (
      <div id="trend-chart" className="aspect-[7/3] rounded-lg overflow-hidden relative">
        <Plot
          data={plotData.data}
          layout={{
            ...plotData.layout,
            autosize: true,
            margin: { l: 50, r: 50, t: 50, b: 50 }
          }}
          useResizeHandler={true}
          style={{ width: '100%', height: '100%' }}
          config={{ responsive: true }}
        />
      </div>
    )
  }

  const ChartComponent = chartType === "line" ? LineChart : chartType === "bar" ? BarChart : PieChart;

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ChartComponent data={data}>
        {chartType !== "pie" && (
          <>
            <XAxis dataKey={chartType === "bar" ? "name" : "month"} tick={{ fontSize: 14 }} />
            <YAxis tick={{ fontSize: 14 }} />
            <Tooltip
              contentStyle={{ fontSize: 14 }}
              formatter={(value) => [`${value}`, chartType === "line" ? "Value" : "Impact"]}
            />
            <Legend wrapperStyle={{ fontSize: 14 }} />
          </>
        )}
        {chartType === "line" && (
          <Line
            type="monotone"
            dataKey="value"
            stroke="#0284c7"
            strokeWidth={2}
            dot={{ fill: "#0284c7" }}
            activeDot={{ r: 8 }}
          />
        )}
        {chartType === "bar" && (
          <Bar
            dataKey="impact"
            fill="#0284c7"
            radius={[4, 4, 0, 0]}
          />
        )}
        {chartType === "pie" && (
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={150}
            fill="#0284c7"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        )}
      </ChartComponent>
    </ResponsiveContainer>
  );
};

const CompareDisplay = () => {
  // State for Rainfall
  const [rainfallYear, setRainfallYear] = useState("2020");
  const [rainfallMonth, setRainfallMonth] = useState("1");
  const [rainfallLoading, setRainfallLoading] = useState(false);
  const [rainfallPlot, setRainfallPlot] = useState(null);
  const [rainfallError, setRainfallError] = useState("");

  // State for SST
  const [sstStartYear, setSSTStartYear] = useState("2020");
  const [sstStartMonth, setSSTStartMonth] = useState("1");
  const [sstEndYear, setSSTEndYear] = useState("2020");
  const [sstEndMonth, setSSTEndMonth] = useState("12");
  const [sstLoading, setSSTLoading] = useState(false);
  const [sstPlot, setSSTPlot] = useState(null);
  const [sstError, setSSTError] = useState("");

  const yearOptions = Array.from({ length: 2024 - 1980 + 1 }, (_, i) => 1980 + i);
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);

  const fetchRainfallPlot = async () => {
    setRainfallLoading(true);
    setRainfallError("");
    try {
      const response = await fetch("http://127.0.0.1:5000/plot_precip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          year: parseInt(rainfallYear),
          month: parseInt(rainfallMonth)
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch rainfall data");
      }

      const data = await response.json();
      setRainfallPlot(data);
    } catch (err) {
      setRainfallError("Failed to fetch rainfall data. Please try again.");
      console.error("Error:", err);
    } finally {
      setRainfallLoading(false);
    }
  };

  const fetchSSTPlot = async () => {
    setSSTLoading(true);
    setSSTError("");
    try {
      const startYearMonth = `${sstStartYear}-${sstStartMonth.padStart(2, "0")}`;
      const endYearMonth = `${sstEndYear}-${sstEndMonth.padStart(2, "0")}`;

      const response = await fetch("http://127.0.0.1:5000/plot_sst", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          start_year_month: startYearMonth,
          end_year_month: endYearMonth,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch SST plot");
      }

      const data = await response.json();
      setSSTPlot(JSON.parse(data.plot));
    } catch (err) {
      setSSTError("Failed to fetch SST data. Please try again.");
      console.error("Error:", err);
    } finally {
      setSSTLoading(false);
    }
  };


  return (
    <div className="flex flex-col space-y-12">
      {/* Rainfall Section */}
      <div className="w-full">
        <h3 className="text-xl font-semibold mb-4">Regional Rainfall</h3>
        <div className="mb-4 flex gap-4 justify-center">
          <Select value={rainfallYear} onValueChange={setRainfallYear}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent className="max-h-[200px] overflow-y-auto">
              {yearOptions.map((y) => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={rainfallMonth} onValueChange={setRainfallMonth}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Month" />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((m) => (
                <SelectItem key={m} value={m.toString()}>
                  {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={fetchRainfallPlot}
            disabled={rainfallLoading}
            className="w-[200px] bg-sky-600 text-white hover:bg-sky-700"
          >
            {rainfallLoading ? "Loading..." : "Generate Rainfall Plot"}
          </Button>
        </div>

        <div className="h-[600px] w-[800px] mx-auto">
          <PlotDisplay
            loading={rainfallLoading}
            plot={rainfallPlot}
            error={rainfallError}
            type="rainfall"
          />
        </div>
      </div>

      {/* SST Section */}
      <div className="w-full">
        <h3 className="text-xl font-semibold mb-4">Sea Surface Temperature</h3>
        <div className="mb-4 max-w-3xl mx-auto">
          <div className="flex justify-center gap-16 mb-2">
            <div>
              <p className="font-medium mb-2">Start Date</p>
              <div className="flex gap-2">
                <Select value={sstStartYear} onValueChange={setSSTStartYear}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="2020" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] overflow-y-auto">
                    {yearOptions.map((y) => (
                      <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sstStartMonth} onValueChange={setSSTStartMonth}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="January" />
                  </SelectTrigger>
                  <SelectContent>
                    {monthOptions.map((m) => (
                      <SelectItem key={m} value={m.toString()}>
                        {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <p className="font-medium mb-2">End Date</p>
              <div className="flex gap-2">
                <Select value={sstEndYear} onValueChange={setSSTEndYear}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="2020" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] overflow-y-auto">
                    {yearOptions.map((y) => (
                      <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sstEndMonth} onValueChange={setSSTEndMonth}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="December" />
                  </SelectTrigger>
                  <SelectContent>
                    {monthOptions.map((m) => (
                      <SelectItem key={m} value={m.toString()}>
                        {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Button
            onClick={fetchSSTPlot}
            disabled={sstLoading}
            className="w-full bg-sky-600 text-white hover:bg-sky-700 mt-4"
          >
            {sstLoading ? "Loading..." : "Generate SST Plot"}
          </Button>
        </div>

        <div className="h-[500px] w-full">
          <PlotDisplay
            loading={sstLoading}
            plot={sstPlot}
            error={sstError}
            type="sst"
          />
        </div>
      </div>

    </div>
  );
};


export function MonsoonMonitor() {
  const [selectedAttribute, setSelectedAttribute] = useState("rainfall");
  const [selectedDateRange, setSelectedDateRange] = useState("this-week");
  const [selectedChartType, setSelectedChartType] = useState("line");
  const [chartStartYear, setChartStartYear] = useState("1981");
  const [chartEndYear, setChartEndYear] = useState("2020");
  const [loading, setLoading] = useState(false);
  const [plotData, setPlotData] = useState(null);
  const [error, setError] = useState("");
  const [activeMapType, setActiveMapType] = useState("regional");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState('idle'); // new state for download status



  const months = [
    { value: "January", label: "January" },
    { value: "February", label: "February" },
    { value: "March", label: "March" },
    { value: "April", label: "April" },
    { value: "May", label: "May" },
    { value: "June", label: "June" },
    { value: "July", label: "July" },
    { value: "August", label: "August" },
    { value: "September", label: "September" },
    { value: "October", label: "October" },
    { value: "November", label: "November" },
    { value: "December", label: "December" }
  ];

  const years = [
    { value: "2020", label: "2020" },
    { value: "2021", label: "2021" },
    { value: "2022", label: "2022" },
    { value: "2023", label: "2023" },
    { value: "2024", label: "2024" }
  ];

  const yearOptions = Array.from({ length: 2024 - 1980 + 1 }, (_, i) => 1980 + i);

  const capturePlot = async (elementId, title) => {
    const element = document.getElementById(elementId);
    if (!element) return null;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true
      });

      return {
        title,
        dataUrl: canvas.toDataURL('image/png')
      };
    } catch (error) {
      console.error(`Error capturing ${title}:`, error);
      return null;
    }
  };

  
  const generateReport = async () => {
    setIsGeneratingReport(true);
    setDownloadStatus('downloading');

    try {
      const plotIds = [
        { id: 'rainfall-plot', title: 'Rainfall Map' },
        { id: 'sst-plot', title: 'Sea Surface Temperature Map' },
        { id: 'trend-chart', title: 'Weather Attribute Trends' }
      ];

      // Show processing message
      setDownloadStatus('processing');

      // Capture all plots
      const validPlots = (await Promise.all(
        plotIds.map(({ id, title }) => capturePlot(id, title))
      )).filter(plot => plot !== null);

      // Show generating PDF message
      setDownloadStatus('generating');

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const imageWidth = pageWidth - (2 * margin);

      // Add title
      pdf.setFontSize(20);
      pdf.text('Monsoon Monitor Report', pageWidth / 2, margin, { align: 'center' });

      // Add date
      pdf.setFontSize(12);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, margin + 10);

      let yPosition = margin + 20;

      // Add each plot to the PDF
      for (let i = 0; i < validPlots.length; i++) {
        const plot = validPlots[i];

        // Add new page if needed
        if (yPosition + 100 > pageHeight) {
          pdf.addPage();
          yPosition = margin;
        }

        // Add plot title
        pdf.setFontSize(14);
        pdf.text(plot.title, margin, yPosition);
        yPosition += 10;

        // Add plot image
        const imageHeight = (imageWidth * 0.6); // Maintain aspect ratio
        pdf.addImage(
          plot.dataUrl,
          'PNG',
          margin,
          yPosition,
          imageWidth,
          imageHeight
        );
        yPosition += imageHeight + 20;
      }

      // Add statistics section
      pdf.addPage();
      pdf.setFontSize(16);
      pdf.text('Weather Statistics', margin, margin);

      const stats = [
        { title: 'Rainfall', avg: '70 mm', max: '90 mm', min: '50 mm' },
        { title: 'SST', avg: '27°C', max: '29°C', min: '25°C' },
        ];

      let statsY = margin + 20;
      stats.forEach(stat => {
        pdf.setFontSize(14);
        pdf.text(stat.title, margin, statsY);
        pdf.setFontSize(12);
        pdf.text(`Average: ${stat.avg}`, margin + 10, statsY + 7);
        pdf.text(`Maximum: ${stat.max}`, margin + 10, statsY + 14);
        pdf.text(`Minimum: ${stat.min}`, margin + 10, statsY + 21);
        statsY += 35;
      });

      // Show downloading message
      setDownloadStatus('saving');
      
      // Save the PDF
      pdf.save('monsoon-monitor-report.pdf');
      
      // Reset status after short delay to show completion
      setTimeout(() => {
        setDownloadStatus('idle');
      }, 1000);

    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
      setDownloadStatus('error');
    } finally {
      setIsGeneratingReport(false);
    }
  };


  const getButtonText = () => {
    switch (downloadStatus) {
      case 'downloading':
        return 'Initializing Download...';
      case 'processing':
        return 'Processing Charts...';
      case 'generating':
        return 'Generating PDF...';
      case 'saving':
        return 'Saving Report...';
      case 'error':
        return 'Download Failed';
      default:
        return 'Download Report';
    }
  };

  
  const fetchChartData = async () => {
    setLoading(true);
    setError("");
    try {
      let endpoint = "";
      if (selectedChartType === "line") {
        endpoint = "/plot_moving_avg_sst";
      } else if (selectedChartType === "bar") {
        endpoint = "/plot_precip_bar";
      } else if (selectedChartType === "pie") {
        endpoint = "/plot_precip_pie";
      }

      const response = await fetch(`http://127.0.0.1:5000${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          start_year: parseInt(chartStartYear),
          end_year: parseInt(chartEndYear)
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch chart data");
      }

      const data = await response.json();
      setPlotData(JSON.parse(data.plot));
    } catch (err) {
      setError("Failed to fetch chart data. Please try again.");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-sky-50">
      <main className="flex-1 overflow-y-auto py-8 px-6 lg:px-8">
        <div className="container mx-auto grid gap-8 lg:grid-cols-2">
          {/* Map Card */}
          <Card className="col-span-2 bg-white shadow-lg relative">
            <CardHeader className="bg-sky-100">
              <CardTitle className="text-2xl">Monsoon Monitoring: Understanding India's Climate Patterns</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Tabs value={selectedAttribute} onValueChange={setSelectedAttribute}>
                <TabsList className="bg-sky-100 mb-6">
                  <TabsTrigger value="rainfall" className="data-[state=active]:bg-sky-500 data-[state=active]:text-white text-lg py-2 px-4">
                    Rainfall
                  </TabsTrigger>
                  <TabsTrigger value="sst" className="data-[state=active]:bg-sky-500 data-[state=active]:text-white text-lg py-2 px-4">
                    SST
                  </TabsTrigger>
                  <TabsTrigger value="compare" className="data-[state=active]:bg-sky-500 data-[state=active]:text-white text-lg py-2 px-4">
                    Compare
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="rainfall">
                  <div>
                    <Tabs value={activeMapType} onValueChange={setActiveMapType}>
                      <TabsList className="bg-sky-100 mb-6">

                        <TabsTrigger
                          value="global"
                          className="data-[state=active]:bg-sky-500 data-[state=active]:text-white text-lg py-2 px-4"
                        >
                          Global
                        </TabsTrigger>
                        <TabsTrigger
                          value="regional"
                          className="data-[state=active]:bg-sky-500 data-[state=active]:text-white text-lg py-2 px-4"
                        >
                          Regional
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                    <MapDisplay mapType="rainfall" activeMapType={activeMapType} />
                  </div>
                </TabsContent>

                {/* SST Tab Content */}
                <TabsContent value="sst">
                  <MapDisplay mapType="sst" />
                </TabsContent>

                {/* Compare Tab Content */}
                <TabsContent value="compare">
                  <CompareDisplay />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Charts Card */}
          <Card className="col-span-2 bg-white shadow-lg">
            <CardHeader className="bg-sky-100">
              <CardTitle className="text-2xl">Weather Attribute Trends</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-6 grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="font-medium">Start Year</p>
                  <Select value={chartStartYear} onValueChange={setChartStartYear}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Start Year" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px] overflow-y-auto">
                      {yearOptions.map((y) => (
                        <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <p className="font-medium">End Year</p>
                  <Select value={chartEndYear} onValueChange={setChartEndYear}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="End Year" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px] overflow-y-auto">
                      {yearOptions.map((y) => (
                        <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Tabs value={selectedChartType} onValueChange={setSelectedChartType}>
                <TabsList className="bg-sky-100 mb-6">
                  <TabsTrigger value="line" className="data-[state=active]:bg-sky-500 data-[state=active]:text-white text-lg py-2 px-4">
                    ENSO Trend
                  </TabsTrigger>
                  <TabsTrigger value="bar" className="data-[state=active]:bg-sky-500 data-[state=active]:text-white text-lg py-2 px-4">
                    Monthly Precipitation
                  </TabsTrigger>
                  <TabsTrigger value="pie" className="data-[state=active]:bg-sky-500 data-[state=active]:text-white text-lg py-2 px-4">
                    Regional Distribution
                  </TabsTrigger>
                </TabsList>

                <Button
                  onClick={fetchChartData}
                  disabled={loading}
                  className="w-full mb-6 bg-sky-600 text-white hover:bg-sky-700"
                >
                  {loading ? "Loading..." : "Generate Chart"}
                </Button>

                {error ? (
                  <div className="text-red-500 text-center p-4">{error}</div>
                ) : (
                  <TabsContent value={selectedChartType}>
                    <ChartDisplay
                      chartType={selectedChartType}
                      data={weatherData[selectedAttribute]}
                      plotData={plotData}
                      loading={loading}
                    />
                  </TabsContent>
                )}
              </Tabs>
            </CardContent>
          </Card>

          {/* Statistics Card */}
          <Card className="bg-white shadow-lg col-span-2 lg:col-span-1">
            <CardHeader className="bg-sky-100">
              <CardTitle className="text-2xl">Statistics</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-md">
                  <h3 className="font-semibold text-blue-800 text-xl mb-2">Rainfall</h3>
                  <p className="text-lg">Average: 70 mm</p>
                  <p className="text-lg">Maximum: 90 mm</p>
                  <p className="text-lg">Minimum: 50 mm</p>
                </div>
                <div className="bg-green-50 p-4 rounded-md">
                  <h3 className="font-semibold text-green-800 text-xl mb-2">SST</h3>
                  <p className="text-lg">Average: 27°C</p>
                  <p className="text-lg">Maximum: 29°C</p>
                  <p className="text-lg">Minimum: 25°C</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="py-6 px-6 lg:px-8 bg-sky-800 text-white">
        <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between">
          <div className="flex items-center space-x-4 mb-4 lg:mb-0">
            <InfoIcon className="text-sky-300 w-6 h-6" />
            <span className="text-lg">Data sourced from Indian Meteorological Department</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              className="bg-sky-700 text-white hover:bg-sky-600 text-lg py-2 px-4"
              onClick={() => alert('Export data functionality to be implemented')}
            >
              <DownloadIcon className="mr-2 h-5 w-5" />
              Export Data
            </Button>
            <Button
              variant="outline"
              className={`bg-sky-700 text-white hover:bg-sky-600 text-lg py-2 px-4 min-w-[200px] ${
                downloadStatus !== 'idle' ? 'animate-pulse' : ''
              }`}
              onClick={generateReport}
              disabled={downloadStatus !== 'idle'}
            >
              {downloadStatus !== 'idle' && (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              )}
              {downloadStatus === 'idle' && (
                <DownloadIcon className="mr-2 h-5 w-5" />
              )}
              {getButtonText()}
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}