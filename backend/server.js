// Lodge operates on IST; without this, naive datetime strings (e.g. from
// <input type="datetime-local">) and "today/this week" boundaries would be
// interpreted using whatever timezone the host machine defaults to, which
// silently shifts every check-in/check-out and revenue cutoff once deployed
// to a server that isn't already set to IST.
process.env.TZ = process.env.TZ || 'Asia/Kolkata';

const dns = require('node:dns');
dns.setDefaultResultOrder('ipv4first');

require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5001;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
