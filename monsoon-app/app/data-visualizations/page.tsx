
'use client'

import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import LoadingSpinner from '@/components/loading-spinner'
import dynamic from 'next/dynamic'
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false })

const MapDisplay = ({ mapType }) => {
  const [loading, setLoading] = useState(false);
  const [plot, setPlot] = useState(null);
  const [error, setError] = useState("");
  const [startYear, setStartYear] = useState("2020");
  const [startMonth, setStartMonth] = useState("1");
  const [endYear, setEndYear] = useState("2020");
  const [endMonth, setEndMonth] = useState("12");

  const yearOptions = Array.from({ length: 2024 - 1980 + 1 }, (_, i) => 1980 + i);
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);

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
          {loading ? "Generating Plot..." : "Generate SST Plot"}
        </Button>
      </div>

      <div className="h-[500px] w-full relative rounded-lg overflow-hidden">
        <PlotDisplay loading={loading} plot={plot} error={error} />
      </div>
    </div>
  );
};

const PlotDisplay = ({ loading, plot, error }) => {
  if (loading) {
    return (
      <LoadingSpinner
        text="Generating visualization..."
        subText="Processing climate data..."
      />
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center text-red-500 text-lg">
        {error}
      </div>
    );
  }

  if (!plot) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-500 text-lg">
        Select parameters and click Generate Plot
      </div>
    );
  }

  return (
    <Plot
      data={plot.data}
      layout={{
        ...plot.layout,
        autosize: true,
        margin: { l: 50, r: 50, t: 50, b: 50 },
        height: 500,
        width: null,
      }}
      useResizeHandler={true}
      style={{ width: '100%', height: '100%' }}
      config={{ responsive: true }}
    />
  );
};

interface PlotUrlsState {
  oni_barPlot: string;
  oni_seasonal: string;
  oni_heatMap: string;
  oni_past_10_years: string;
  oni_timeSeries: string;
  dmi_barPlot: string;
  dmi_seasonal: string;
  dmi_heatMap: string;
  dmi_past_10_years: string;
  dmi_timeSeries: string;
  oni_vs_dmi_barPlot: string;
  oni_vs_dmi_timeSeries: string;
  oni_vs_dmi_seasonal: string;
}

const monthMapping: { [key: string]: number } = {
  'January': 1,
  'February': 2,
  'March': 3,
  'April': 4,
  'May': 5,
  'June': 6,
  'July': 7,
  'August': 8,
  'September': 9,
  'October': 10,
  'November': 11,
  'December': 12,
};

const URL = "http://127.0.0.1:5000/get_plot"

export default function DataVisualizations() {

  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [dateRange, setDateRange] = useState('This Month')
  const [region, setRegion] = useState('All')
  const [allUrls, setAllUrls] = useState<PlotUrlsState[]>([]);
  const [attribute, setAttribute] = useState('Rainfall')
  const [selectedMedium, setSelectedMedium] = useState('anomaly')
  const [selectedPlot, setSelectedPlot] = useState('ONI_Plots')
  const [sstPlotData, setSstPlotData] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);


  const handleSubmit = async () => {
    const monthInt = month ? monthMapping[month] : null;
    const yearInt = year ? parseInt(year) : null;

    if (!monthInt || !yearInt) {
      alert("Please select both month and year");
      return;
    }

    const jsonData = {
      month: monthInt,
      year: yearInt,
    };

    try {
      // Show loading state
      setAllUrls([]);

      const response = await fetch("http://127.0.0.1:5000/get_plot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add any additional headers your backend expects
        },
        body: JSON.stringify(jsonData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const urls = await response.json();
      console.log("Received URLs:", urls);

      if (!urls || typeof urls !== 'object') {
        throw new Error("Invalid response format from server");
      }

      const allUrls = [
        urls.oni_barPlot,
        urls.oni_seasonal,
        urls.oni_heatMap,
        urls.oni_past_10_years,
        urls.oni_timeSeries,
        urls.dmi_barPlot,
        urls.dmi_seasonal,
        urls.dmi_heatMap,
        urls.dmi_past_10_years,
        urls.dmi_timeSeries,
        urls.oni_vs_dmi_barPlot,
        urls.oni_vs_dmi_timeSeries,
        urls.oni_vs_dmi_seasonal
      ].filter(url => url); // Filter out any null/undefined URLs

      setAllUrls(allUrls);

    } catch (error) {
      console.error("Error fetching data:", error);
      alert(`Failed to fetch data: ${error.message}`);
    }
  };

  const handleDownloadReport = async () => {
    try {
      setIsDownloading(true);
      
      // Get all iframe URLs that are currently displayed
      const iframeUrls = [];
      const currentTab = selectedPlot;
      
      if (sstPlotData) {
        iframeUrls.push(sstPlotData);
      }
      
      if (currentTab === 'ONI_Plots') {
        iframeUrls.push(...allUrls.slice(0, 5)
          .filter(Boolean)
          .map(url => url.startsWith('http') ? url : `http://127.0.0.1:5000${url}`));
      } else if (currentTab === 'DMI_Plots') {
        iframeUrls.push(...allUrls.slice(5, 10)
          .filter(Boolean)
          .map(url => url.startsWith('http') ? url : `http://127.0.0.1:5000${url}`));
      } else if (currentTab === 'ONI_vs_DMI_Plots') {
        iframeUrls.push(...allUrls.slice(10, 13)
          .filter(Boolean)
          .map(url => url.startsWith('http') ? url : `http://127.0.0.1:5000${url}`));
      }
  
      if (iframeUrls.length === 0) {
        alert('Please generate plots before downloading the report');
        setIsDownloading(false);
        return;
      }
  
      const response = await fetch('http://127.0.0.1:5000/generate_report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          urls: iframeUrls,
          month: month,
          year: year,
          sstPlot: sstPlotData ? sstPlotData : null,
          plotTitles: {
            sst: "Sea Surface Temperature Analysis",
            oni: [
              "ONI Bar Plot",
              "ONI Heatmap",
              "ONI Past 10 Years Values",
              "ONI Time Series",
              "ONI Seasonal Analysis"
            ],
            dmi: [
              "DMI Bar Plot",
              "DMI Heatmap",
              "DMI Past 10 Years Values",
              "DMI Time Series",
              "DMI Seasonal Analysis"
            ],
            combined: [
              "ONI vs DMI Bar Plot",
              "ONI vs DMI Time Series",
              "ONI vs DMI Seasonal Analysis"
            ]
          }
        })
      });
  
      if (!response.ok) {
        throw new Error('Failed to generate report');
      }
  
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `climate_report_${year}_${month}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
  
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download report. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-sky-200 py-12">
      <div className="container mx-auto px-4">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Explore Climate Data Like Never Before</h1>
          <p className="text-xl text-gray-600">Uncover insights through interactive visualizations of climate patterns</p>
        </header>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold mb-4">Sea Surface Temperature Analysis</h2>
          <MapDisplay mapType="sst" />
        </div>

        {/* Month and Year Selector */}
        <div className="mb-8 text-center">
          <div className="flex justify-center space-x-4">
            <div className="w-40">
              <label htmlFor="year" className="block text-lg text-gray-600 mb-2"></label>
              <select
                id="year"
                className="w-full p-2 border border-gray-300 rounded"
                onChange={(e) => setYear(e.target.value)}
              >
                <option value="">Select Year</option>
                {["1950", "1951", "1952", "1953", "1954",
                  "1955", "1956", "1957", "1958", "1959",
                  "1960", "1961", "1962", "1963", "1964",
                  "1965", "1966", "1967", "1968", "1969",
                  "1970", "1971", "1972", "1973", "1974",
                  "1975", "1976", "1977", "1978", "1979",
                  "1980", "1981", "1982", "1983", "1984",
                  "1985", "1986", "1987", "1988", "1989",
                  "1990", "1991", "1992", "1993", "1994",
                  "1995", "1996", "1997", "1998", "1999",
                  "2000", "2001", "2002", "2003", "2004",
                  "2005", "2006", "2007", "2008", "2009",
                  "2010", "2011", "2012", "2013", "2014",
                  "2015", "2016", "2017", "2018", "2019",
                  "2020", "2021", "2022", "2023", "2024"]
                  .map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
              </select>
            </div>
            <div className="w-40">
              <label htmlFor="month" className="block text-lg text-gray-600 mb-2"></label>
              <select
                id="month"
                className="w-full p-2 border border-gray-300 rounded"
                onChange={(e) => setMonth(e.target.value)}
              >
                <option value="">Select Month</option>
                {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((month, index) => (
                  <option key={index} value={month}>{month}</option>
                ))}
              </select>
            </div>
            <div className="w-40">
              <label htmlFor="submit" className="block text-lg text-gray-600 mb-2"></label>
              <Button id="submit" onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 w-full p-2 border border-gray-300 rounded">
                Submit
              </Button>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <Tabs defaultValue="ONI_Plots" className="w-full" onValueChange={setSelectedPlot}>
            <TabsList className="grid w-full grid-cols-3 lg:max-w-[550px] mx-auto">
              <TabsTrigger value="ONI_Plots" className="text-lg">ONI Plots</TabsTrigger>
              <TabsTrigger value="DMI_Plots" className="text-lg">DMI Plots</TabsTrigger>
              <TabsTrigger value="ONI_vs_DMI_Plots" className="text-lg">ONI vs DMI Plots</TabsTrigger>
            </TabsList>
            <TabsContent value="ONI_Plots" className="mt-4">
              {allUrls.slice(0, 5).map((url, index) => (
                <div key={index} className="p-4 bg-white shadow rounded-lg">
                  <div className="relative h-[800px]">
                    <iframe
                      src={`${url}`}
                      title={`Plot ${index + 1}`}
                      className="w-[90%] my-[10px] mx-auto h-[800px] border-2 border-gray-300 rounded-lg shadow-lg"
                    />
                  </div>
                </div>
              ))}
            </TabsContent>
            <TabsContent value="DMI_Plots" className="mt-4">
              {allUrls.slice(5, 10).map((url, index) => (
                <div key={index} className="p-4 bg-white shadow rounded-lg">
                  <div className="relative h-[800px]">
                    <iframe
                      src={`${url}`}
                      title={`Plot ${index + 1}`}
                      className="w-[90%] my-[10px] mx-auto h-[800px] border-2 border-gray-300 rounded-lg shadow-lg"
                    />
                  </div>
                </div>
              ))}
            </TabsContent>
            <TabsContent value="ONI_vs_DMI_Plots" className="mt-4">
              {allUrls.slice(10, 13).map((url, index) => (
                <div key={index} className="p-4 bg-white shadow rounded-lg">
                  <div className="relative h-[800px]">
                    <iframe
                      src={`${url}`}
                      title={`Plot ${index + 1}`}
                      className="w-[90%] my-[10px] mx-auto h-[800px] border-2 border-gray-300 rounded-lg shadow-lg"
                    />
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <section className="text-center">
        <Button
          onClick={handleDownloadReport}
          className="bg-blue-600 hover:bg-blue-700"
          disabled={allUrls.length === 0 || isDownloading}
        >
          {isDownloading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Downloading...
            </div>
          ) : (
            'Download Report'
          )}
        </Button>
      </section>

    </div>

  )
}