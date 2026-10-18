import React, { useState, useEffect } from 'react';
import { revenueService } from '../services/revenueService';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { Loader2, TrendingUp, Calendar, ChevronDown, Check, LayoutGrid, Wallet } from 'lucide-react';

const Revenue = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trendsLoading, setTrendsLoading] = useState(false);
  const [dateLoading, setDateLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('7days');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

  const timeframes = {
    '7days': 'Last 7 Days',
    '30days': 'Last 30 Days',
    'year': 'This Year'
  };

  // Initial dashboard load (all sections)
  useEffect(() => {
    let isMounted = true;
    const fetchInitial = async () => {
      try {
        setLoading(true);
        const dashboardData = await revenueService.getRevenueDashboard(timeframe, selectedDate);
        if (isMounted) {
          setData(dashboardData || {
            monthly: 0,
            daily: 0,
            weekly: 0,
            trends: [],
            sources: []
          });
          setError(null);
        }
      } catch (err) {
        if (isMounted) setError("Unable to load revenue data.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchInitial();
    return () => {
      isMounted = false;
    };
  }, []);

  // When timeframe changes, only fetch trends without unmounting the whole page
  const handleTimeframeChange = async (newTimeframe) => {
    setTimeframe(newTimeframe);
    setDropdownOpen(false);
    if (!data) return;

    try {
      setTrendsLoading(true);
      const res = await revenueService.getTrends(newTimeframe);
      if (res && res.trends) {
        setData(prev => (prev ? { ...prev, trends: res.trends } : prev));
      }
    } catch (err) {
      console.error('Failed to update trends:', err);
    } finally {
      setTrendsLoading(false);
    }
  };

  // When selected date changes, only fetch daily stats without full-page reload
  const handleDateChange = async (newDate) => {
    setSelectedDate(newDate);
    if (!data) return;

    try {
      setDateLoading(true);
      const res = await revenueService.getDailyWithDate(newDate);
      if (res) {
        setData(prev => (prev ? {
          ...prev,
          daily: res.revenue || 0,
          dailyBookings: res.bookingsCount || 0
        } : prev));
      }
    } catch (err) {
      console.error('Failed to update daily revenue:', err);
    } finally {
      setDateLoading(false);
    }
  };

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
            <div className="bg-[#FFFFFF] rounded-[18px] border border-[#EFEBE8] p-[18px] flex flex-col relative overflow-hidden">
              <div className="flex justify-between items-start mb-2.5">
                <Calendar size={18} className="text-[#B3122A]" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="text-[9px] font-bold text-[#6B6B70] bg-[#FAF9F7] border border-[#EFEBE8] rounded px-1 py-0.5 outline-none cursor-pointer"
                />
              </div>
              <span className="text-[13.5px] text-[#6B6B70] font-bold mb-1.5">Day Revenue</span>
              <span className="text-[24px] font-extrabold text-[#1B1B1F] leading-tight mb-0.5">
                {dateLoading ? '...' : `₹${(data?.daily || 0).toLocaleString()}`}
              </span>
              <span className="text-[12.5px] text-[#8A8A8E] font-medium">
                {dateLoading ? 'Updating...' : `${data?.dailyBookings || 0} Bookings`}
              </span>
            </div>
            <div className="bg-[#FFFFFF] rounded-[18px] border border-[#EFEBE8] p-[18px] flex flex-col">
              <Calendar size={18} className="text-[#B3122A] mb-2.5" />
              <span className="text-[13.5px] text-[#6B6B70] font-bold mb-1.5">Weekly</span>
              <span className="text-[24px] font-extrabold text-[#1B1B1F] leading-tight mb-0.5">₹{(data?.weekly || 0).toLocaleString()}</span>
              <span className="text-[12.5px] text-[#8A8A8E] font-medium">{data?.weeklyBookings || 0} Bookings</span>
            </div>
          </div>

          {/* Revenue Trends + Sources */}
          <div className="md:grid md:grid-cols-5 md:gap-6 md:items-start">
            <div className="bg-[#FFFFFF] rounded-[20px] border border-[#EFEBE8] p-5 mb-6 md:col-span-3 md:mb-0">
              <div className="flex justify-between items-center mb-5 relative">
                <h3 className="font-display text-[19px] font-extrabold text-[#1B1B1F]">Revenue Trends</h3>
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="bg-[#FAF9F7] border border-[#EFEBE8] text-[#1B1B1F] rounded-full pl-3.5 pr-2.5 py-2 flex items-center gap-1.5 active:scale-95 transition-transform cursor-pointer"
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
                            onClick={() => handleTimeframeChange(key)}
                            className="text-left px-4 py-2.5 text-[12px] font-bold transition-colors flex items-center justify-between cursor-pointer"
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
              <div className="w-full h-[150px] mt-4 flex items-center justify-center">
                {trendsLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 size={24} className="animate-spin text-[#B3122A]" />
                  </div>
                ) : data?.trends && data.trends.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.trends}>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#8A8A8E' }} dy={10} />
                      <Tooltip cursor={{ fill: '#FAF9F7' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="revenue" fill="#B3122A" radius={[6, 6, 0, 0]} maxBarSize={26}>
                        <LabelList
                          dataKey="revenue"
                          position="top"
                          formatter={(v) => (v > 0 ? `₹${v >= 1000 ? `${(v/1000).toFixed(1)}k` : v}` : '')}
                          style={{ fontSize: '10px', fill: '#8A8A8E', fontWeight: 700 }}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-[#8A8A8E] text-[13px] text-center my-auto">No trend data available</p>
                )}
              </div>
            </div>

            {/* Revenue Sources Breakdown */}
            <div className="bg-[#FFFFFF] rounded-[20px] border border-[#EFEBE8] p-5 md:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-display text-[19px] font-extrabold text-[#1B1B1F]">Top Revenue Sources</h3>
                <LayoutGrid size={17} className="text-[#8A8A8E]" />
              </div>

              {data?.sources && data.sources.length > 0 ? (
                <div className="flex flex-col gap-3.5">
                  {data.sources.slice(0, 5).map((source) => (
                    <div key={source.name} className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-[13px]">
                        <span className="font-bold text-[#1B1B1F] truncate pr-2">{source.name}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-extrabold text-[#1B1B1F]">₹{source.amount.toLocaleString()}</span>
                          <span className="text-[11.5px] font-bold text-[#8A8A8E] w-8 text-right">{source.percentage}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-[#FAF9F7] h-2 rounded-full overflow-hidden border border-[#EFEBE8]/60">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(source.percentage, 100)}%`, background: '#B3122A' }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 flex flex-col items-center justify-center text-center">
                  <Wallet size={24} className="text-[#B0ACA8] mb-1.5" />
                  <p className="text-[#8A8A8E] text-[13px]">No revenue sources recorded</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Revenue;
