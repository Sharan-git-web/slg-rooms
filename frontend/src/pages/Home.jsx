import React, { useState, useEffect } from 'react';
import DashboardCard from '../components/Dashboard/DashboardCard';
import RoomCard from '../components/Room/RoomCard';
import { useNavigate } from 'react-router-dom';
import { roomService } from '../services/roomService';
import { dashboardService } from '../services/dashboardService';

const Home = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsData, roomsData] = await Promise.all([
          dashboardService.getDashboardStats(),
          roomService.getRoomAvailability()
        ]);
        
        setStats(statsData || { occupied: 0, available: 0, checkIns: 0, revenue: 0 });
        setRooms(roomsData?.rooms || []);
        setError(null);
      } catch (err) {
        setError("Unable to load dashboard data. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC]" style={{ fontFamily: 'Roboto, sans-serif' }}>
      <div className="pt-[24px] px-4 pb-4">
        {/* Removed duplicate Daily Overview header to save space */}
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <span className="material-symbols-outlined animate-spin text-[32px] text-[#0F766E]" data-icon="progress_activity">progress_activity</span>
          </div>
        ) : error ? (
          <div className="bg-[#FEE2E2] text-[#991B1B] p-4 rounded-xl text-center mb-6 text-[14px]">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-[8px]">
            <DashboardCard title="Rooms Occupied" value={stats?.occupied?.toString() || "0"} icon="bed" variant="primary" />
            <DashboardCard title="Rooms Available" value={stats?.available?.toString() || "0"} icon="check_circle" variant="surface" />
            <DashboardCard title="Check-ins" value={stats?.checkIns?.toString().padStart(2, '0') || "00"} icon="login" variant="surface" />
            <DashboardCard title="Today's Revenue" value={`₹${(stats?.revenue || 0).toLocaleString()}`} icon="payments" variant="tertiary" />
          </div>
        )}

        <div className="mb-3 flex justify-between items-center mt-[28px]">
          <h3 className="text-[20px] font-semibold leading-tight text-[#1F2937]">Room Status</h3>
          <button onClick={() => navigate('/records')} className="text-[#0F766E] text-[14px] font-medium tracking-[0.2px] flex items-center gap-1 active:scale-95 transition-transform">
            View All <span className="material-symbols-outlined text-[18px]" data-icon="arrow_forward">arrow_forward</span>
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {loading ? (
            <div className="flex justify-center items-center h-32">
               <span className="material-symbols-outlined animate-spin text-[32px] text-[#0F766E]" data-icon="progress_activity">progress_activity</span>
            </div>
          ) : rooms.length > 0 ? (
            rooms.map(room => (
              <RoomCard 
                key={room.number} 
                {...room} 
                onCheckIn={() => navigate('/new-entry', { state: { selectedRoom: room.number } })}
              />
            ))
          ) : (
            <div className="py-[40px] flex flex-col items-center justify-center text-center px-4 bg-white rounded-[20px] border border-[#E5E7EB] shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
              <span className="material-symbols-outlined text-[32px] text-[#9CA3AF] mb-2" data-icon="meeting_room">meeting_room</span>
              <p className="font-semibold text-[14px] text-[#1F2937]">No room data available.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default Home;
