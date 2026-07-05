import React, { useState, useEffect } from 'react';
import { revenueService } from '../services/revenueService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from 'recharts';

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
          <span className="material-symbols-outlined animate-spin text-[32px] text-primary" data-icon="progress_activity">progress_activity</span>
        </div>
      ) : error ? (
        <div className="bg-error-container text-on-error-container p-4 rounded-xl text-center mt-6 text-[14px]">
          {error}
        </div>
      ) : (
        <>
          {/* Monthly Revenue Banner */}
          <div className="bg-[#0F766E] rounded-xl p-5 mb-4 shadow-sm text-white mt-4">
            <h3 className="text-[10px] font-bold tracking-wider uppercase opacity-90 mb-1">Monthly Revenue</h3>
            <h2 className="text-[36px] font-black leading-tight mb-4 tracking-tight">₹{(data?.monthly || 0).toLocaleString()}</h2>

            <div className="inline-flex items-center gap-1.5 bg-black/20 rounded-full px-3 py-1.5">
              <span className="material-symbols-outlined text-[14px] text-white" data-icon="trending_up">trending_up</span>
              <span className="text-[11px] font-bold text-white">+0.0% from last month</span>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-[#FFFFFF] rounded-[12px] border border-[#E5E7EB] p-4 shadow-sm flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <span className="material-symbols-outlined text-[#14B8A6] text-[20px]" data-icon="calendar_today">calendar_today</span>
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="text-[9px] font-bold text-[#6B7280] bg-[#F8FAFC] border border-[#E5E7EB] rounded px-1 py-0.5 outline-none cursor-pointer"
                />
              </div>
              <span className="text-[12px] text-[#6B7280] font-bold mb-2">Day Revenue</span>
              <span className="text-[20px] font-black text-[#0F766E] leading-tight mb-0.5">₹{(data?.daily || 0).toLocaleString()}</span>
              <span className="text-[11px] text-[#6B7280] font-medium">{data?.dailyBookings || 0} Bookings</span>
            </div>
            <div className="bg-[#FFFFFF] rounded-[12px] border border-[#E5E7EB] p-4 shadow-sm flex flex-col">
              <span className="material-symbols-outlined text-[#14B8A6] text-[20px] mb-2" data-icon="calendar_today">calendar_today</span>
              <span className="text-[12px] text-[#6B7280] font-bold mb-2">Weekly</span>
              <span className="text-[20px] font-black text-[#0F766E] leading-tight mb-0.5">₹{(data?.weekly || 0).toLocaleString()}</span>
              <span className="text-[11px] text-[#6B7280] font-medium">{data?.weeklyBookings || 0} Bookings</span>
            </div>
          </div>

          {/* Revenue Trends */}
          <div className="bg-[#FFFFFF] rounded-[12px] border border-[#E5E7EB] p-4 shadow-sm mb-6">
            <div className="flex justify-between items-center mb-4 relative">
              <h3 className="text-[18px] font-semibold leading-[28px] text-[#1F2937]">Revenue Trends</h3>
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="bg-[#F8FAFC] border border-[#E5E7EB] text-[#1F2937] rounded-full pl-3 pr-2 py-1.5 flex items-center gap-1 active:scale-95 transition-transform"
                >
                  <span className="text-[11px] font-bold">{timeframes[timeframe]}</span>
                  <span className="material-symbols-outlined text-[16px] text-[#1F2937]" data-icon="keyboard_arrow_down">keyboard_arrow_down</span>
                </button>

                {/* Custom Dropdown Menu */}
                {dropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setDropdownOpen(false)}
                    ></div>
                    <div className="absolute right-0 top-[110%] w-[140px] bg-white border border-[#E5E7EB] rounded-[12px] shadow-[0_10px_25px_rgba(0,0,0,0.1)] z-50 overflow-hidden flex flex-col">
                      {Object.entries(timeframes).map(([key, label]) => (
                        <button
                          key={key}
                          onClick={() => {
                            setTimeframe(key);
                            setDropdownOpen(false);
                          }}
                          className={`text-left px-4 py-2.5 text-[12px] font-semibold transition-colors flex items-center justify-between ${timeframe === key ? 'bg-[#F0FDFA] text-[#0F766E]' : 'text-[#1F2937] hover:bg-[#F8FAFC]'}`}
                        >
                          {label}
                          {timeframe === key && (
                            <span className="material-symbols-outlined text-[14px]" data-icon="check">check</span>
                          )}
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
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} dy={10} />
                    <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="revenue" fill="#14B8A6" radius={[4, 4, 0, 0]} maxBarSize={30}>
                      <LabelList
                        dataKey="revenue"
                        position="top"
                        style={{ fontSize: '10px', fill: '#1F2937', fontWeight: 'bold' }}
                        formatter={(val) => val > 0 ? `₹${val.toLocaleString()}` : ''}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#9CA3AF] text-[12px]">
                  No trend data available
                </div>
              )}
            </div>
          </div>

          {/* Revenue Sources */}
          <div className="mb-4 flex justify-between items-center">
            <h3 className="text-[18px] font-semibold leading-[28px] text-[#1F2937]">Revenue Sources</h3>
            <button className="text-[#0F766E] font-bold text-[12px]">View All</button>
          </div>

          <div className="flex flex-col gap-3 pb-24">
            {data?.sources?.length > 0 ? (
              data.sources.map((source, index) => (
                <div key={index} className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl p-3 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-[42px] h-[42px] rounded-full bg-[#F1F5F9] flex items-center justify-center border border-[#E5E7EB]">
                      <span className="material-symbols-outlined text-[#0F766E] text-[20px]" data-icon="category">category</span>
                    </div>
                    <div className="flex flex-col pt-0.5">
                      <span className="font-bold text-[#1F2937] text-[14px] leading-tight">{source.name}</span>
                      <span className="text-[10px] text-[#6B7280] font-medium mt-0.5">{source.percentage}% of total revenue</span>
                    </div>
                  </div>
                  <span className="font-black text-[#1F2937] text-[14px]">₹{source.amount.toLocaleString()}</span>
                </div>
              ))
            ) : (
              <div className="py-8 flex flex-col items-center justify-center text-[#6B7280] bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl shadow-sm">
                <span className="material-symbols-outlined text-[32px] opacity-30 mb-2 text-[#6B7280]" data-icon="payments">payments</span>
                <p className="font-body-sm text-[12px]">No revenue sources found.</p>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default Revenue;
