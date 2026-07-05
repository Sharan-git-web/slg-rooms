import React, { useState, useEffect } from 'react';
import { bookingService } from '../services/bookingService';

const Records = () => {
  const [activeFilter, setActiveFilter] = useState('Today');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewDeleted, setViewDeleted] = useState(false);

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
      try {
        await bookingService.deleteBooking(id);
        fetchRecords(); // Refresh list after delete
      } catch (err) {
        alert('Failed to delete record.');
      }
    }
  };

  const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  const matchesDateFilter = (record) => {
    if (!record.check_in) return false;
    const checkIn = new Date(record.check_in);
    const now = new Date();

    if (activeFilter === 'Today') {
      return isSameDay(checkIn, now);
    } else if (activeFilter === 'Yesterday') {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      return isSameDay(checkIn, yesterday);
    } else if (activeFilter === 'This Week') {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      return checkIn >= weekAgo && checkIn <= now;
    } else if (activeFilter === 'This Month') {
      return checkIn.getFullYear() === now.getFullYear() && checkIn.getMonth() === now.getMonth();
    }
    return true;
  };

  const filteredRecords = records.filter(record => {
    const isDeleted = record.status === 'deleted';
    if (viewDeleted ? !isDeleted : isDeleted) return false;

    if (!matchesDateFilter(record)) return false;

    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const guestName = (record.guest_name || '').toLowerCase();
    const phone = (record.phone_number || '').toString().toLowerCase();
    const room = (record.room_number || '').toString();

    return guestName.includes(q) || phone.includes(q) || room.includes(q);
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="font-sans min-h-screen bg-[#F8FAFC]">
      <div className="p-3 pb-20">
        {/* Search Bar */}
        <div className="bg-white h-[44px] rounded-[10px] flex items-center px-3 gap-2 mb-3 border border-[#E5E7EB] focus-within:border-[#0F766E] shadow-sm">
          <span className="material-symbols-outlined text-[#9CA3AF] text-[18px]">search</span>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Room No. or Aadhaar" 
            className="bg-transparent border-none w-full h-full text-[13px] focus:ring-0 p-0 placeholder:text-[#9CA3AF] text-[#1F2937] outline-none"
          />
        </div>

        {/* Tabs (Active / Deleted) */}
        <div className="flex bg-white p-0.5 rounded-[8px] mb-3 border border-[#E5E7EB] shadow-sm">
          <button 
            onClick={() => setViewDeleted(false)}
            className={`flex-1 h-[36px] text-[13px] font-semibold rounded-[6px] transition-all ${!viewDeleted ? 'bg-[#0F766E] text-white' : 'text-[#6B7280] hover:bg-gray-50'}`}
          >
            Active
          </button>
          <button 
            onClick={() => setViewDeleted(true)}
            className={`flex-1 h-[36px] text-[13px] font-semibold rounded-[6px] transition-all ${viewDeleted ? 'bg-[#0F766E] text-white' : 'text-[#6B7280] hover:bg-gray-50'}`}
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
              className={`whitespace-nowrap px-3 h-[32px] rounded-full font-medium text-[12px] transition-colors border ${
                activeFilter === filter 
                  ? 'bg-[#0F766E] text-white border-[#0F766E]' 
                  : 'bg-white border-[#E5E7EB] text-[#4B5563]'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Record Count */}
        <div className="mb-3 flex justify-between items-end px-1">
          <h2 className="text-[14px] font-semibold text-[#1F2937]">
            {filteredRecords.length} {viewDeleted ? 'Deleted' : 'Active'}
          </h2>
          <span className="text-[11px] text-[#6B7280]">Updated just now</span>
        </div>

        {/* Record Cards */}
        <div className="flex flex-col gap-2.5">
          {loading ? (
            <div className="flex justify-center items-center h-24">
              <span className="material-symbols-outlined animate-spin text-[24px] text-[#0F766E]">progress_activity</span>
            </div>
          ) : error ? (
            <div className="bg-[#FEE2E2] text-[#991B1B] p-3 rounded-lg text-[13px]">
              {error}
            </div>
          ) : filteredRecords.length > 0 ? (
            filteredRecords.map(record => (
              <div key={record.id} className="bg-white rounded-[12px] border border-[#E5E7EB] p-3 shadow-sm flex flex-col gap-2.5">
                
                {/* Header: Room, Name, Price, Status */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    <div className="w-[36px] h-[36px] bg-[#CCFBF1] text-[#0F766E] rounded-lg flex items-center justify-center font-bold text-[14px]">
                      {record.room_number}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[14px] font-bold text-[#1F2937] leading-tight">{record.guest_name || 'Guest'}</span>
                      <span className="text-[12px] text-[#6B7280] leading-tight">{record.phone_number ? `+91 ${record.phone_number}` : `${record.members || 1} Mbrs`}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-bold text-[#1F2937] text-[15px] leading-none">₹{record.cost || 0}</span>
                  </div>
                </div>

                {/* Body: Check In/Out */}
                <div className="flex items-center gap-2 text-[12px] text-[#4B5563] bg-[#F8FAFC] p-2 rounded-lg">
                  <span className="material-symbols-outlined text-[14px] text-[#9CA3AF]">login</span>
                  <span>{formatDate(record.check_in)}</span>
                  <span className="material-symbols-outlined text-[14px] text-[#9CA3AF] mx-1">arrow_forward</span>
                  <span>{record.check_out ? formatDate(record.check_out) : 'Pending'}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {!viewDeleted && (
                    <button 
                      onClick={() => handleDelete(record.id)} 
                      className="flex-1 h-[40px] flex items-center justify-center gap-1.5 rounded-lg border border-[#EF4444] text-[#EF4444] font-semibold text-[13px] active:bg-[#FEF2F2]"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                      Delete
                    </button>
                  )}
                  <button 
                    onClick={() => record.aadhaar_image ? window.open(record.aadhaar_image, '_blank') : alert('No Aadhaar image uploaded')} 
                    className="flex-1 h-[40px] flex items-center justify-center gap-1.5 rounded-lg bg-[#0F766E] text-white font-semibold text-[13px] active:bg-[#0D635C]"
                  >
                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                    View Aadhaar
                  </button>
                </div>
                
              </div>
            ))
          ) : (
            <div className="py-8 flex flex-col items-center justify-center text-center px-4 bg-white rounded-[12px] border border-[#E5E7EB] shadow-sm">
              <span className="material-symbols-outlined text-[32px] text-[#9CA3AF] mb-2">event_note</span>
              <h3 className="text-[14px] font-semibold text-[#1F2937]">No Bookings Found</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Records;
