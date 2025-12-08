import React from 'react';
import { Icons } from './Icons';
import { Student } from '../types';

interface StatisticsCardsProps {
  students: Student[];
}

export const StatisticsCards: React.FC<StatisticsCardsProps> = ({ students }) => {
  const total = students.length;
  const boys = students.filter(s => s.gender === 'Erkak').length;
  const girls = students.filter(s => s.gender === 'Ayol').length;

  // Most popular city
  const cityCounts = students.reduce((acc, s) => {
    acc[s.city] = (acc[s.city] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topCity = Object.entries(cityCounts).sort((a, b) => (b[1] as number) - (a[1] as number))[0];

  // Most popular faculty
  const facultyCounts = students.reduce((acc, s) => {
    acc[s.faculty] = (acc[s.faculty] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topFaculty = Object.entries(facultyCounts).sort((a, b) => (b[1] as number) - (a[1] as number))[0];

  if (students.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8 animate-fade-in-down">
      {/* Jami Talabalar */}
      <div className="group bg-white p-5 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100/50">
        <div className="flex items-center justify-between mb-3">
          <div className="bg-blue-50 group-hover:bg-blue-600 transition-colors p-3 rounded-xl text-blue-600 group-hover:text-white">
            <Icons.Users className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold px-2 py-1 bg-gray-50 rounded-lg text-gray-500">Jami</span>
        </div>
        <div>
          <p className="text-3xl font-extrabold text-gray-800">{total}</p>
          <p className="text-sm font-medium text-gray-400 mt-1">Ro'yxatga olingan talabalar</p>
        </div>
      </div>

      {/* Gender */}
      <div className="group bg-white p-5 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100/50">
        <div className="flex items-center justify-between mb-3">
          <div className="bg-purple-50 group-hover:bg-purple-600 transition-colors p-3 rounded-xl text-purple-600 group-hover:text-white">
            <Icons.PieChart className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold px-2 py-1 bg-gray-50 rounded-lg text-gray-500">Jinsi</span>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Erkak</span>
            <span className="text-sm font-bold text-gray-800">{boys} <span className="text-xs text-gray-400 font-normal">({total ? Math.round(boys/total*100) : 0}%)</span></span>
          </div>
           <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${total ? (boys/total)*100 : 0}%` }}></div>
          </div>
          <div className="flex justify-between items-center pt-1">
            <span className="text-sm text-gray-600">Ayol</span>
            <span className="text-sm font-bold text-gray-800">{girls} <span className="text-xs text-gray-400 font-normal">({total ? Math.round(girls/total*100) : 0}%)</span></span>
          </div>
        </div>
      </div>

      {/* Top Location */}
      <div className="group bg-white p-5 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100/50">
        <div className="flex items-center justify-between mb-3">
          <div className="bg-emerald-50 group-hover:bg-emerald-600 transition-colors p-3 rounded-xl text-emerald-600 group-hover:text-white">
            <Icons.MapPin className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold px-2 py-1 bg-gray-50 rounded-lg text-gray-500">Hudud</span>
        </div>
        <div>
          <p className="text-lg font-bold text-gray-800 truncate" title={topCity?.[0]}>
            {topCity ? topCity[0] : "—"}
          </p>
          <p className="text-sm font-medium text-emerald-600 mt-1 flex items-center gap-1">
            {topCity ? `${topCity[1]} talaba` : "Ma'lumot yo'q"}
          </p>
        </div>
      </div>

      {/* Top Faculty */}
      <div className="group bg-white p-5 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100/50">
         <div className="flex items-center justify-between mb-3">
          <div className="bg-amber-50 group-hover:bg-amber-500 transition-colors p-3 rounded-xl text-amber-600 group-hover:text-white">
            <Icons.School className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold px-2 py-1 bg-gray-50 rounded-lg text-gray-500">Fakultet</span>
        </div>
        <div>
           <p className="text-sm font-bold text-gray-800 line-clamp-2 leading-tight min-h-[2.5em]" title={topFaculty?.[0]}>
            {topFaculty ? topFaculty[0] : "—"}
          </p>
          <p className="text-xs font-medium text-amber-600 mt-1">
             {topFaculty ? `${topFaculty[1]} talaba` : "Ma'lumot yo'q"}
          </p>
        </div>
      </div>
    </div>
  );
};