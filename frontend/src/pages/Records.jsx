import React, { useState, useEffect } from 'react';
import { bookingService } from '../services/bookingService';
import { Search, LogIn, ArrowRight, Trash2, Eye, CalendarX2, Loader2, X } from 'lucide-react';

const Records = () => {
  const [activeFilter, setActiveFilter] = useState('Today');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewDeleted, setViewDeleted] = useState(false);
  const [viewerImages, setViewerImages] = useState(null);

  const filters = ['Today', 'Yesterday', 'This Week', 'This Month'];

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const data = await bookingService.getAllBookings();
      setRecords(data || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch records. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      const previousRecords = records;
      // Optimistic UI update for immediate responsiveness
      setRecords(prev => prev.map(r => r.id === id ? { ...r, status: 'deleted' } : r));

      try {
        await bookingService.deleteBooking(id);
      } catch (err) {
        setRecords(previousRecords);
        alert('Failed to delete record.');
      }
    }
  };

  const filteredRecords = React.useMemo(() => {
    const now = new Date();
    const todayYear = now.getFullYear();
    const todayMonth = now.getMonth();
    const todayDate = now.getDate();

    const yesterday = new Date(todayYear, todayMonth, todayDate - 1);
    const yYear = yesterday.getFullYear();
    const yMonth = yesterday.getMonth();
    const yDate = yesterday.getDate();

    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const q = searchQuery.trim().toLowerCase();

    return records.filter(record => {
      const isDeleted = record.status === 'deleted';
      if (viewDeleted ? !isDeleted : isDeleted) return false;

      if (!record.check_in) return false;
      const checkIn = new Date(record.check_in);
      const cYear = checkIn.getFullYear();
      const cMonth = checkIn.getMonth();
      const cDate = checkIn.getDate();

      if (activeFilter === 'Today') {
        if (cYear !== todayYear || cMonth !== todayMonth || cDate !== todayDate) return false;
      } else if (activeFilter === 'Yesterday') {
        if (cYear !== yYear || cMonth !== yMonth || cDate !== yDate) return false;
      } else if (activeFilter === 'This Week') {
        if (checkIn < weekAgo || checkIn > now) return false;
      } else if (activeFilter === 'This Month') {
        if (cYear !== todayYear || cMonth !== todayMonth) return false;
      }

      if (!q) return true;
      const guestName = (record.guest_name || '').toLowerCase();
      const phone = (record.phone_number || '').toString().toLowerCase();
      const room = (record.room_number || '').toString();
      const aadhaar = (record.aadhaar_number || '').toString().toLowerCase();

      return guestName.includes(q) || phone.includes(q) || room.includes(q) || aadhaar.includes(q);
    });
  }, [records, viewDeleted, activeFilter, searchQuery]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen">
      <div className="pt-5 pb-4">
        {/* Search Bar */}
        <div className="bg-white h-[50px] rounded-full flex items-center px-[18px] gap-2.5 mb-3.5 border border-[#EFEBE8] focus-within:border-[#B3122A]">
          <Search size={18} className="text-[#B3122A]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Room No. or Aadhaar"
            className="bg-transparent border-none w-full h-full text-[15px] focus:ring-0 p-0 placeholder:text-[#B0ACA8] text-[#1B1B1F] outline-none"
          />
        </div>

        {/* Tabs (Active / Deleted) */}
        <div className="flex bg-white p-1 rounded-full mb-3.5 border border-[#EFEBE8]">
          <button
            onClick={() => setViewDeleted(false)}
            className="flex-1 h-[40px] text-[15px] font-bold rounded-full transition-all"
            style={{ background: !viewDeleted ? '#B3122A' : 'transparent', color: !viewDeleted ? '#fff' : '#6B6B70' }}
          >
            Active
          </button>
          <button
            onClick={() => setViewDeleted(true)}
            className="flex-1 h-[40px] text-[15px] font-bold rounded-full transition-all"
            style={{ background: viewDeleted ? '#B3122A' : 'transparent', color: viewDeleted ? '#fff' : '#6B6B70' }}
          >
            Deleted
          </button>
        </div>

        {/* Date Filters */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 pb-1">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className="whitespace-nowrap px-4 h-[36px] rounded-full font-bold text-[14px] transition-colors border"
              style={
                activeFilter === filter
                  ? { background: '#B3122A', color: '#fff', borderColor: '#B3122A' }
                  : { background: '#fff', color: '#6B6B70', borderColor: '#EFEBE8' }
              }
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Record Count */}
        <div className="mb-2.5 flex justify-between items-end px-1">
          <h2 className="text-[18px] font-extrabold text-[#1B1B1F]">
            {filteredRecords.length} {viewDeleted ? 'Deleted' : 'Active'}
          </h2>
          <span className="text-[13px] text-[#8A8A8E]">Updated just now</span>
        </div>

        {/* Record Cards */}
        <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {loading ? (
            <div className="flex justify-center items-center h-24 md:col-span-full">
              <Loader2 size={24} className="animate-spin text-[#B3122A]" />
            </div>
          ) : error ? (
            <div className="bg-[#FDEBEC] text-[#B3122A] p-3 rounded-lg text-[13px] md:col-span-full">
              {error}
            </div>
          ) : filteredRecords.length > 0 ? (
            filteredRecords.map(record => (
              <div key={record.id} className="bg-white rounded-[16px] border border-[#EFEBE8] p-4 flex flex-col gap-3">

                {/* Header: Room, Name, Price, Status */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center font-extrabold text-[14px]" style={{ background: '#FDEBEC', color: '#B3122A' }}>
                      {record.room_number}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[15px] font-extrabold text-[#1B1B1F] leading-tight">{record.guest_name || 'Guest'}</span>
                      <span className="text-[12.5px] text-[#6B6B70] leading-tight">{record.phone_number ? `+91 ${record.phone_number}` : `${record.members || 1} Mbrs`}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-extrabold text-[#1B1B1F] text-[15px] leading-none">₹{record.cost || 0}</span>
                  </div>
                </div>

                {/* Body: Check In/Out */}
                <div className="flex items-center gap-2 text-[12.5px] text-[#6B6B70] bg-[#FAF9F7] p-2.5 rounded-[10px]">
                  <LogIn size={14} className="text-[#B0ACA8]" />
                  <span>{formatDate(record.check_in)}</span>
                  <ArrowRight size={14} className="text-[#B0ACA8] mx-1" />
                  <span>{record.check_out ? formatDate(record.check_out) : 'Pending'}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {!viewDeleted && (
                    <button
                      onClick={() => handleDelete(record.id)}
                      className="flex-1 h-[42px] flex items-center justify-center gap-1.5 rounded-full border font-bold text-[13.5px] active:opacity-70"
                      style={{ borderColor: '#B3122A', color: '#B3122A' }}
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (record.aadhaar_image) {
                        setViewerImages(record.aadhaar_image.split(',').filter(Boolean));
                      } else {
                        alert('No Aadhaar image uploaded');
                      }
                    }}
                    className="flex-1 h-[42px] flex items-center justify-center gap-1.5 rounded-full text-white font-bold text-[13.5px] active:opacity-90"
                    style={{ background: '#B3122A' }}
                  >
                    <Eye size={16} />
                    View Aadhaar
                  </button>
                </div>

              </div>
            ))
          ) : (
            <div className="py-10 flex flex-col items-center justify-center text-center px-4 bg-white rounded-[18px] border border-[#EFEBE8] md:col-span-full">
              <CalendarX2 size={30} className="text-[#B3122A] mb-3" />
              <h3 className="text-[17px] font-extrabold text-[#1B1B1F]">No Bookings Found</h3>
            </div>
          )}
        </div>
      </div>

      {viewerImages && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex flex-col items-center justify-center p-4"
          onClick={() => setViewerImages(null)}
        >
          <button
            onClick={() => setViewerImages(null)}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white flex items-center justify-center"
          >
            <X size={18} className="text-[#1B1B1F]" />
          </button>
          <div
            className="w-full max-w-md flex flex-col gap-4 max-h-full overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {viewerImages.map((url, idx) => {
              let label = 'Aadhaar Card';
              if (url.includes('p1_front_') || url.includes('p1_front')) {
                label = 'Person 1 - Front';
              } else if (url.includes('p1_back_') || url.includes('p1_back')) {
                label = 'Person 1 - Back';
              } else if (url.includes('p2_front_') || url.includes('p2_front')) {
                label = 'Person 2 - Front';
              } else if (url.includes('p2_back_') || url.includes('p2_back')) {
                label = 'Person 2 - Back';
              } else if (viewerImages.length === 2) {
                label = idx === 0 ? 'Person 1 - Front' : 'Person 1 - Back';
              } else if (viewerImages.length > 2) {
                const person = Math.floor(idx / 2) + 1;
                const side = idx % 2 === 0 ? 'Front' : 'Back';
                label = `Person ${person} - ${side}`;
              }

              return (
                <div key={url} className="flex flex-col gap-1.5">
                  <span className="text-white text-[13px] font-bold">
                    {label}
                  </span>
                  <img
                    src={url}
                    alt={label}
                    className="w-full rounded-[14px] border border-white/20"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Records;
