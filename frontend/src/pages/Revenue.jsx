import React, { useState, useEffect } from 'react';
import { revenueService } from '../services/revenueService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { Loader2, TrendingUp, Calendar, ChevronDown, Check, LayoutGrid, Wallet } from 'lucide-react';

const Revenue = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('7days');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

  const timeframes = {
    '7days': 'Last 7 Days',
    '30days': 'Last 30 Days',
    'year': 'This Year'
  };

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        setLoading(true);
        const dashboardData = await revenueService.getRevenueDashboard(timeframe, selectedDate);
        setData(dashboardData || {
          monthly: 0,
          daily: 0,
          weekly: 0,
          trends: [],
          sources: []
        });
        setError(null);
      } catch (err) {
        setError("Unable to load revenue data.");
      } finally {
        setLoading(false);
      }
    };

    fetchRevenue();
  }, [timeframe, selectedDate]);

  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 size={32} className="animate-spin text-[#B3122A]" />
        </div>
      ) : error ? (
        <div className="bg-[#FDEBEC] text-[#B3122A] p-4 rounded-xl text-center mt-6 text-[14px]">
          {error}
        </div>
      ) : (
        <>
          {/* Monthly Revenue Banner */}
          <div className="rounded-[22px] p-6 mb-4 text-white mt-5" style={{ background: '#B3122A' }}>
            <h3 className="text-[12.5px] font-bold tracking-wider uppercase opacity-85 mb-1">Monthly Revenue</h3>
            <h2 className="font-display text-[36px] font-extrabold leading-tight mb-4 tracking-tight">₹{(data?.monthly || 0).toLocaleString()}</h2>

            <div className="inline-flex items-center gap-2 bg-black/[0.18] rounded-full px-4 py-[9px]">
              <TrendingUp size={14} strokeWidth={2.5} />
              <span className="text-[13.5px] font-bold">+0.0% from last month</span>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-[14px] mb-5">
            <div className="bg-[#FFFFFF] rounded-[18px] border border-[#EFEBE8] p-[18px] flex flex-col">
              <div className="flex justify-between items-start mb-2.5">
                <Calendar size={18} className="text-[#B3122A]" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="text-[9px] font-bold text-[#6B6B70] bg-[#FAF9F7] border border-[#EFEBE8] rounded px-1 py-0.5 outline-none cursor-pointer"
                />
              </div>
              <span className="text-[13.5px] text-[#6B6B70] font-bold mb-1.5">Day Revenue</span>
              <span className="text-[24px] font-extrabold text-[#1B1B1F] leading-tight mb-0.5">₹{(data?.daily || 0).toLocaleString()}</span>
              <span className="text-[12.5px] text-[#8A8A8E] font-medium">{data?.dailyBookings || 0} Bookings</span>
            </div>
            <div className="bg-[#FFFFFF] rounded-[18px] border border-[#EFEBE8] p-[18px] flex flex-col">
              <Calendar size={18} className="text-[#B3122A] mb-2.5" />
              <span className="text-[13.5px] text-[#6B6B70] font-bold mb-1.5">Weekly</span>
              <span className="text-[24px] font-extrabold text-[#1B1B1F] leading-tight mb-0.5">₹{(data?.weekly || 0).toLocaleString()}</span>
              <span className="text-[12.5px] text-[#8A8A8E] font-medium">{data?.weeklyBookings || 0} Bookings</span>
            </div>
          </div>

          {/* Revenue Trends */}
          <div className="bg-[#FFFFFF] rounded-[20px] border border-[#EFEBE8] p-5 mb-6">
            <div className="flex justify-between items-center mb-5 relative">
              <h3 className="font-display text-[19px] font-extrabold text-[#1B1B1F]">Revenue Trends</h3>
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="bg-[#FAF9F7] border border-[#EFEBE8] text-[#1B1B1F] rounded-full pl-3.5 pr-2.5 py-2 flex items-center gap-1.5 active:scale-95 transition-transform"
                >
                  <span className="text-[13px] font-bold">{timeframes[timeframe]}</span>
                  <ChevronDown size={14} className="text-[#6B6B70]" />
                </button>

                {/* Custom Dropdown Menu */}
                {dropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setDropdownOpen(false)}
                    ></div>
                    <div className="absolute right-0 top-[110%] w-[140px] bg-white border border-[#EFEBE8] rounded-[14px] shadow-[0_10px_25px_rgba(0,0,0,0.1)] z-50 overflow-hidden flex flex-col">
                      {Object.entries(timeframes).map(([key, label]) => (
                        <button
                          key={key}
                          onClick={() => {
                            setTimeframe(key);
                            setDropdownOpen(false);
                          }}
                          className="text-left px-4 py-2.5 text-[12px] font-bold transition-colors flex items-center justify-between"
                          style={timeframe === key ? { background: '#FDEBEC', color: '#B3122A' } : { color: '#1B1B1F' }}
                        >
                          {label}
                          {timeframe === key && <Check size={14} />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Chart Area */}
            <div className="w-full h-[150px] mt-4">
              {data?.trends && data.trends.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.trends}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#8A8A8E' }} dy={10} />
                    <Tooltip cursor={{ fill: '#FAF9F7' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="revenue" fill="#B3122A" radius={[6, 6, 0, 0]} maxBarSize={26}>
                      <LabelList
                        dataKey="revenue"
                        position="top"
                        style={{ fontSize: '10px', fill: '#1B1B1F', fontWeight: 'bold' }}
                        formatter={(val) => val > 0 ? `₹${val.toLocaleString()}` : ''}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#B0ACA8] text-[12px]">
                  No trend data available
                </div>
              )}
            </div>
          </div>

          {/* Revenue Sources */}
          <div className="mb-3 flex justify-between items-center">
            <h3 className="font-display text-[19px] font-extrabold text-[#1B1B1F]">Revenue Sources</h3>
            <button className="text-[#B3122A] font-bold text-[14px]">View All</button>
          </div>

          <div className="flex flex-col gap-2.5 pb-24">
            {data?.sources?.length > 0 ? (
              data.sources.map((source, index) => (
                <div key={index} className="bg-[#FFFFFF] border border-[#EFEBE8] rounded-[16px] p-[14px_16px] flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-[42px] h-[42px] rounded-full flex items-center justify-center" style={{ background: '#FDEBEC' }}>
                      <LayoutGrid size={20} className="text-[#B3122A]" />
                    </div>
                    <div className="flex flex-col pt-0.5">
                      <span className="font-extrabold text-[#1B1B1F] text-[14.5px] leading-tight">{source.name}</span>
                      <span className="text-[12.5px] text-[#6B6B70] font-medium mt-0.5">{source.percentage}% of total revenue</span>
                    </div>
                  </div>
                  <span className="font-extrabold text-[#1B1B1F] text-[15px]">₹{source.amount.toLocaleString()}</span>
                </div>
              ))
            ) : (
              <div className="py-10 flex flex-col items-center justify-center text-[#6B6B70] bg-[#FFFFFF] border border-[#EFEBE8] rounded-[18px]">
                <Wallet size={32} strokeWidth={1.5} className="opacity-30 mb-2.5 text-[#6B6B70]" />
                <p className="text-[13px]">No revenue sources found.</p>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default Revenue;
