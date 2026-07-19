import React, { useState, useEffect } from 'react';
import DashboardCard from '../components/Dashboard/DashboardCard';
import RoomCard from '../components/Room/RoomCard';
import { useNavigate } from 'react-router-dom';
import { roomService } from '../services/roomService';
import { dashboardService } from '../services/dashboardService';
import { bookingService } from '../services/bookingService';
import { BedDouble, CircleCheck, LogIn, Wallet, ArrowRight, Loader2, DoorClosed } from 'lucide-react';

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

  const handleCheckout = async (bookingId) => {
    try {
      setLoading(true);
      await bookingService.updateBooking(bookingId, { check_out: new Date().toISOString() });
      const [statsData, roomsData] = await Promise.all([
        dashboardService.getDashboardStats(),
        roomService.getRoomAvailability()
      ]);
      setStats(statsData || { occupied: 0, available: 0, checkIns: 0, revenue: 0 });
      setRooms(roomsData?.rooms || []);
    } catch (err) {
      setError("Failed to checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="pt-6 pb-4">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 size={32} className="animate-spin text-[#B3122A]" />
          </div>
        ) : error ? (
          <div className="bg-[#FDEBEC] text-[#B3122A] p-4 rounded-xl text-center mb-6 text-[14px]">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-[14px]">
            <DashboardCard title="Rooms Occupied" value={stats?.occupied?.toString() || "0"} icon={BedDouble} variant="primary" />
            <DashboardCard title="Rooms Available" value={stats?.available?.toString() || "0"} icon={CircleCheck} variant="surface" />
            <DashboardCard title="Check-ins" value={stats?.checkIns?.toString().padStart(2, '0') || "00"} icon={LogIn} variant="surface" />
            <DashboardCard title="Today's Revenue" value={`₹${(stats?.revenue || 0).toLocaleString()}`} icon={Wallet} variant="tertiary" />
          </div>
        )}

        <div className="mb-3.5 flex justify-between items-center mt-7">
          <h3 className="font-display text-[21px] font-extrabold text-[#1B1B1F]">Room Status</h3>
          <button onClick={() => navigate('/records')} className="text-[#B3122A] text-[14px] font-bold flex items-center gap-1 active:scale-95 transition-transform">
            View All <ArrowRight size={16} strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {loading ? (
            <div className="flex justify-center items-center h-32 md:col-span-full">
              <Loader2 size={32} className="animate-spin text-[#B3122A]" />
            </div>
          ) : rooms.length > 0 ? (
            rooms.map(room => (
              <RoomCard
                key={room.number}
                {...room}
                onCheckIn={() => navigate('/new-entry', { state: { selectedRoom: room.number } })}
                onCheckout={handleCheckout}
              />
            ))
          ) : (
            <div className="py-10 flex flex-col items-center justify-center text-center px-4 bg-white rounded-[20px] border border-[#EFEBE8] md:col-span-full">
              <DoorClosed size={32} className="text-[#B0ACA8] mb-2" />
              <p className="font-bold text-[14px] text-[#1B1B1F]">No room data available.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default Home;
