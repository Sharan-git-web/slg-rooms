const supabase = require('../config/supabase');
const { AC_ROOMS } = require('../config/rooms');

exports.getDailyRevenue = async (req, res) => {
  try {
    let targetDate = new Date();
    if (req.query.date) {
      targetDate = new Date(req.query.date);
    }
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('cost')
      .neq('status', 'deleted')
      .gte('created_at', startOfDay.toISOString())
      .lte('created_at', endOfDay.toISOString());

    if (error) throw error;

    const revenue = bookings.reduce((sum, b) => sum + parseFloat(b.cost || 0), 0);
    const bookingsCount = bookings.length;

    res.status(200).json({ revenue, bookingsCount });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching daily revenue', error: error.message });
  }
};

exports.getWeeklyRevenue = async (req, res) => {
  try {
    const today = new Date();
    const lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('cost')
      .neq('status', 'deleted')
      .gte('created_at', lastWeek.toISOString());

    if (error) throw error;

    const revenue = bookings.reduce((sum, b) => sum + parseFloat(b.cost || 0), 0);
    const bookingsCount = bookings.length;

    res.status(200).json({ revenue, bookingsCount });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching weekly revenue', error: error.message });
  }
};

exports.getMonthlyRevenue = async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('cost')
      .neq('status', 'deleted')
      .gte('created_at', startOfMonth.toISOString());

    if (error) throw error;

    const revenue = bookings.reduce((sum, b) => sum + parseFloat(b.cost || 0), 0);
    const bookingsCount = bookings.length;

    res.status(200).json({ revenue, bookingsCount });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching monthly revenue', error: error.message });
  }
};

exports.getTrends = async (req, res) => {
  try {
    const timeframe = req.query.timeframe || '7days';
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    let startDate = new Date(today);
    let labels = [];
    let trendsMap = {};
    
    if (timeframe === '30days') {
      startDate.setDate(today.getDate() - 29);
      startDate.setHours(0,0,0,0);
      labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'];
    } else if (timeframe === 'year') {
      startDate = new Date(today.getFullYear(), 0, 1);
      startDate.setHours(0,0,0,0);
      labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    } else {
      // 7days
      startDate.setDate(today.getDate() - 6);
      startDate.setHours(0,0,0,0);
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      for (let i = 0; i < 7; i++) {
        const d = new Date(startDate.getTime());
        d.setDate(d.getDate() + i);
        labels.push(days[d.getDay()]);
      }
    }
    
    labels.forEach(l => trendsMap[l] = 0);

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('cost, created_at')
      .neq('status', 'deleted')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', today.toISOString());

    if (error) throw error;

    bookings.forEach(b => {
      const date = new Date(b.created_at);
      let label = '';
      if (timeframe === '30days') {
        const diffDays = Math.floor((date - startDate) / (1000 * 60 * 60 * 24));
        const weekIndex = Math.floor(diffDays / 7);
        label = `Week ${weekIndex + 1}`;
        if (!trendsMap[label]) trendsMap[label] = 0; // Just in case
      } else if (timeframe === 'year') {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        label = months[date.getMonth()];
      } else {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        label = days[date.getDay()];
      }
      
      if (trendsMap[label] !== undefined) {
         trendsMap[label] += parseFloat(b.cost || 0);
      }
    });

    const formattedTrends = Object.keys(trendsMap).map(name => ({
      name,
      revenue: trendsMap[name]
    }));

    res.status(200).json({ trends: formattedTrends });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching trends', error: error.message });
  }
};

exports.getSources = async (req, res) => {
  try {
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('room_number, cost')
      .neq('status', 'deleted');

    if (error) throw error;

    let totalRevenue = 0;
    const sourcesMap = {};

    bookings.forEach(b => {
      const amount = parseFloat(b.cost || 0);
      totalRevenue += amount;
      
      const type = AC_ROOMS.includes(b.room_number) ? 'AC Room' : 'Non-AC Room';
      const label = `Room ${b.room_number} (${type})`;
      
      if (!sourcesMap[label]) sourcesMap[label] = 0;
      sourcesMap[label] += amount;
    });

    const sources = Object.keys(sourcesMap).map(name => {
      const amount = sourcesMap[name];
      const percentage = totalRevenue > 0 ? Math.round((amount / totalRevenue) * 100) : 0;
      return { name, amount, percentage };
    }).sort((a, b) => b.amount - a.amount);

    res.status(200).json({ sources });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sources', error: error.message });
  }
};
