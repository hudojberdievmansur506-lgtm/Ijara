import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { Student } from '../types';
import { Icons } from './Icons';

interface StatsChartProps {
  students: Student[];
}

type TabType = 'region' | 'faculty' | 'street';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'];

export const StatsChart: React.FC<StatsChartProps> = ({ students }) => {
  const [activeTab, setActiveTab] = useState<TabType>('region');

  const data = useMemo(() => {
    // 1. Regions (Cities/Districts)
    const regionStats: Record<string, number> = {};
    students.forEach(s => {
      regionStats[s.city] = (regionStats[s.city] || 0) + 1;
    });
    const regionData = Object.keys(regionStats).map(key => ({
      name: key,
      value: regionStats[key]
    })).sort((a, b) => b.value - a.value);

    // 2. Faculties
    const facultyStats: Record<string, number> = {};
    students.forEach(s => {
      facultyStats[s.faculty] = (facultyStats[s.faculty] || 0) + 1;
    });
    const facultyData = Object.keys(facultyStats).map(key => ({
      name: key,
      count: facultyStats[key]
    })).sort((a, b) => b.count - a.count);

    // 3. Streets (Top 10)
    const streetStats: Record<string, number> = {};
    students.forEach(s => {
      const streetName = s.street.trim();
      streetStats[streetName] = (streetStats[streetName] || 0) + 1;
    });
    const streetData = Object.keys(streetStats)
      .map(key => ({
        name: key,
        count: streetStats[key]
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Only Top 10

    return { regionData, facultyData, streetData };
  }, [students]);

  if (students.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[450px] flex flex-col relative overflow-hidden">
      {/* Decorative background blob */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 relative z-10">
        <div>
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
             <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
               <Icons.PieChart className="w-5 h-5" />
             </div>
             Statistika tahlili
          </h3>
          <p className="text-sm text-gray-400 mt-1 pl-11">Ma'lumotlarning grafik ko'rinishi</p>
        </div>
        
        <div className="flex p-1.5 bg-gray-100/80 backdrop-blur-sm rounded-xl self-start sm:self-auto border border-gray-200">
          <button
            onClick={() => setActiveTab('region')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
              activeTab === 'region' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
            }`}
          >
            Hududlar
          </button>
          <button
            onClick={() => setActiveTab('faculty')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
              activeTab === 'faculty' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
            }`}
          >
            Fakultetlar
          </button>
          <button
            onClick={() => setActiveTab('street')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
              activeTab === 'street' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
            }`}
          >
            Ko'chalar
          </button>
        </div>
      </div>

      {/* Charts Content */}
      <div className="flex-grow relative z-10">
        <ResponsiveContainer width="100%" height={320}>
          {activeTab === 'region' ? (
            <PieChart>
              <Pie
                data={data.regionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                innerRadius={60}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {data.regionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} 
                itemStyle={{ color: '#374151', fontWeight: 600 }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          ) : activeTab === 'faculty' ? (
            <BarChart data={data.facultyData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={180} 
                tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
                interval={0}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
              />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={20}>
                {data.facultyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          ) : (
             <BarChart data={data.streetData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 10, fill: '#64748b' }} 
                interval={0}
                angle={-45}
                textAnchor="end"
                height={60}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                cursor={{ fill: '#f8fafc' }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={36} name="Talabalar soni">
                 {data.streetData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};