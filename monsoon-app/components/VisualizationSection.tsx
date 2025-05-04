"use client"

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const rainfallData = [
  { month: 'Jan', rainfall: 50 },
  { month: 'Feb', rainfall: 40 },
  { month: 'Mar', rainfall: 60 },
  { month: 'Apr', rainfall: 80 },
  { month: 'May', rainfall: 100 },
  { month: 'Jun', rainfall: 120 },
]

const temperatureData = [
  { month: 'Jan', temperature: 20 },
  { month: 'Feb', temperature: 22 },
  { month: 'Mar', temperature: 25 },
  { month: 'Apr', temperature: 28 },
  { month: 'May', temperature: 30 },
  { month: 'Jun', temperature: 32 },
]

export default function VisualizationSection() {
  const [activeTab, setActiveTab] = useState('rainfall')

  return (
    <Card className="p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="rainfall">Rainfall</TabsTrigger>
          <TabsTrigger value="temperature">Temperature</TabsTrigger>
        </TabsList>
        <TabsContent value="rainfall">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={rainfallData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="rainfall" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </TabsContent>
        <TabsContent value="temperature">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={temperatureData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="temperature" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </TabsContent>
      </Tabs>
    </Card>
  )
}

