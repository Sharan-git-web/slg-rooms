import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { bookingService } from '../services/bookingService';
import { roomService } from '../services/roomService';
import Input from '../components/Common/Input';
import Button from '../components/Common/Button';
import CameraCapture from '../components/Common/CameraCapture';
import { Loader2, CircleCheck, Save } from 'lucide-react';
import { compressImage } from '../utils/imageCompressor';

const Booking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    guestName: '',
    roomNumber: location.state?.selectedRoom?.toString() || '',
    totalMembers: '',
    aadhaarNumber: '',
    phoneNumber: '',
    checkInTime: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
    checkOutTime: new Date(Date.now() + 86400000 - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
    cost: ''
  });
  
  // Person 1 ID Card
  const [cameraImageFront, setCameraImageFront] = useState(null);
  const [cameraImageBack, setCameraImageBack] = useState(null);

  // Person 2 ID Card
  const [person2ImageFront, setPerson2ImageFront] = useState(null);
  const [person2ImageBack, setPerson2ImageBack] = useState(null);

  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const data = await roomService.getRoomAvailability();
        if (data && data.rooms) {
          const vacant = data.rooms.filter(r => r.status === 'Available');
          setAvailableRooms(vacant);
        }
      } catch (err) {
        // Silently fail or handle error state
      }
    };
    fetchRooms();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleP1CaptureFront = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressed = await compressImage(file);
      setCameraImageFront(compressed);
    }
  };

  const handleP1CaptureBack = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressed = await compressImage(file);
      setCameraImageBack(compressed);
    }
  };

  const handleP2CaptureFront = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressed = await compressImage(file);
      setPerson2ImageFront(compressed);
    }
  };

  const handleP2CaptureBack = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressed = await compressImage(file);
      setPerson2ImageBack(compressed);
    }
  };

  const handleClear = () => {
    setFormData({
      guestName: '',
      roomNumber: '',
      totalMembers: '',
      aadhaarNumber: '',
      phoneNumber: '',
      checkInTime: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
      checkOutTime: new Date(Date.now() + 86400000 - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
      cost: ''
    });
    setCameraImageFront(null);
    setCameraImageBack(null);
    setPerson2ImageFront(null);
    setPerson2ImageBack(null);
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const hasAnyImage = cameraImageFront || cameraImageBack || person2ImageFront || person2ImageBack;
      let dataToSubmit = formData;

      if (hasAnyImage) {
        const fd = new FormData();
        fd.append('room_number', formData.roomNumber);
        fd.append('members', formData.totalMembers);
        fd.append('aadhaar_number', formData.aadhaarNumber);
        fd.append('check_in', formData.checkInTime);
        fd.append('check_out', formData.checkOutTime);
        fd.append('cost', formData.cost);
        fd.append('guest_name', formData.guestName);
        fd.append('phone_number', formData.phoneNumber);

        if (cameraImageFront) {
          fd.append('aadhaar_images', cameraImageFront, `p1_front_${cameraImageFront.name || 'front.jpg'}`);
        }
        if (cameraImageBack) {
          fd.append('aadhaar_images', cameraImageBack, `p1_back_${cameraImageBack.name || 'back.jpg'}`);
        }
        if (person2ImageFront) {
          fd.append('aadhaar_images', person2ImageFront, `p2_front_${person2ImageFront.name || 'front.jpg'}`);
        }
        if (person2ImageBack) {
          fd.append('aadhaar_images', person2ImageBack, `p2_back_${person2ImageBack.name || 'back.jpg'}`);
        }
        dataToSubmit = fd;
      } else {
        dataToSubmit = {
          room_number: formData.roomNumber,
          members: formData.totalMembers,
          aadhaar_number: formData.aadhaarNumber,
          check_in: formData.checkInTime,
          check_out: formData.checkOutTime,
          cost: formData.cost,
          guest_name: formData.guestName,
          phone_number: formData.phoneNumber
        };
      }

      await bookingService.createBooking(dataToSubmit);
      setSuccess(true);
      setTimeout(() => {
        handleClear();
      }, 2000);
    } catch (err) {
      console.error('Booking submission failed:', err);
      const backendMessage = err.response?.data?.error || err.response?.data?.message;
      setError(backendMessage ? `Failed to save booking: ${backendMessage}` : `Failed to save booking: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="md:max-w-xl md:mx-auto">
      <header className="py-6 mt-4">
        <h2 className="font-display text-[24px] font-extrabold leading-8 text-[#1B1B1F]">New Guest Entry</h2>
        <p className="text-[14px] font-normal leading-[22px] text-[#6B6B70] mt-1">Register a new check-in for the lodge.</p>
      </header>

      {error && (
        <div className="bg-[#FDEBEC] text-[#B3122A] p-3 rounded-lg mb-4 text-sm font-medium">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-[#E8F6EC] text-[#16A34A] p-3 rounded-lg mb-4 text-sm font-medium">
          Booking created successfully!
        </div>
      )}
      
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input 
          label="Guest Name" name="guestName" value={formData.guestName} 
          onChange={handleChange} placeholder="John Doe" required 
        />
        
        <div className="grid grid-cols-2 gap-gutter">
          <div className="flex flex-col">
            <label className="text-[13px] font-bold text-[#1B1B1F] tracking-wide mb-1.5 ml-1">Room Number *</label>
            <select
              name="roomNumber"
              value={formData.roomNumber}
              onChange={handleChange}
              required
              className="bg-[#FFFFFF] border border-[#EFEBE8] text-[#1B1B1F] text-[15px] font-medium rounded-[14px] focus:ring-2 focus:ring-[#B3122A]/20 focus:border-[#B3122A] block w-full p-3.5 transition-all outline-none"
            >
              <option value="">Select Room</option>
              {availableRooms.map(r => (
                <option key={r.number} value={r.number}>
                  {r.number} ({r.type})
                </option>
              ))}
            </select>
          </div>
          <Input 
            label="Total Members" name="totalMembers" value={formData.totalMembers} 
            onChange={handleChange} placeholder="2" type="number" required 
          />
        </div>
        
        <Input 
          label="Aadhaar Number" name="aadhaarNumber" value={formData.aadhaarNumber} 
          onChange={handleChange} placeholder="0000 0000 0000" tracking required 
        />
        
        <Input 
          label="Phone Number" name="phoneNumber" value={formData.phoneNumber} 
          onChange={handleChange} placeholder="98765 43210" type="tel" required 
        />
        
        {/* Person 1 ID Card */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between ml-1">
            <label className="text-[13px] font-bold text-[#1B1B1F] tracking-wide">
              Person 1 - ID Card *
            </label>
            <span className="text-[11px] font-semibold text-[#16A34A] bg-[#E8F6EC] px-2 py-0.5 rounded-full">
              Primary Guest
            </span>
          </div>
          <div className="grid grid-cols-2 gap-gutter">
            <CameraCapture
              onCapture={handleP1CaptureFront}
              onClear={() => setCameraImageFront(null)}
              image={cameraImageFront}
              hasImage={!!cameraImageFront}
              label="Front Image"
            />
            <CameraCapture
              onCapture={handleP1CaptureBack}
              onClear={() => setCameraImageBack(null)}
              image={cameraImageBack}
              hasImage={!!cameraImageBack}
              label="Back Image"
            />
          </div>
        </div>

        {/* Person 2 ID Card */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between ml-1">
            <label className="text-[13px] font-bold text-[#1B1B1F] tracking-wide">
              Person 2 - ID Card
            </label>
            <span className="text-[11px] font-medium text-[#6B6B70] bg-[#FAF9F7] border border-[#EFEBE8] px-2 py-0.5 rounded-full">
              Second Guest (Optional)
            </span>
          </div>
          <div className="grid grid-cols-2 gap-gutter">
            <CameraCapture
              onCapture={handleP2CaptureFront}
              onClear={() => setPerson2ImageFront(null)}
              image={person2ImageFront}
              hasImage={!!person2ImageFront}
              label="Front Image"
            />
            <CameraCapture
              onCapture={handleP2CaptureBack}
              onClear={() => setPerson2ImageBack(null)}
              image={person2ImageBack}
              hasImage={!!person2ImageBack}
              label="Back Image"
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <Input 
            label="Check-in Date & Time" name="checkInTime" value={formData.checkInTime} 
            onChange={handleChange} type="datetime-local" required 
          />
          <Input 
            label="Check-out Date & Time" name="checkOutTime" value={formData.checkOutTime} 
            onChange={handleChange} type="datetime-local" required 
          />
        </div>
        
        <Input 
          label="Booking Cost (₹)" name="cost" value={formData.cost} 
          onChange={handleChange} placeholder="2500" type="number" prefix="₹" required 
        />
        
        <div className="pt-8 flex flex-col gap-3 pb-4">
          <Button
            type="submit"
            disabled={loading}
            variant={success ? 'tertiary' : 'primary'}
            icon={loading ? Loader2 : success ? CircleCheck : Save}
            iconSpin={loading}
          >
            {loading ? 'Saving...' : success ? 'Saved Successfully' : 'Save Entry'}
          </Button>
          
          <Button 
            type="button" 
            variant="transparent"
            onClick={handleClear}
          >
            Clear Form
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Booking;
