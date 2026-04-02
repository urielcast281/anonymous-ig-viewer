require('dotenv').config();
console.log('IG_WEB_COOKIES:', process.env.IG_WEB_COOKIES ? 'SET' : 'MISSING');
console.log('USE_MOCK_DATA:', process.env.USE_MOCK_DATA);
const ig = new (require('./services/instagram-web-session'))();
console.log('isReady:', ig.isReady());
console.log('cookies keys:', ig.cookies ? Object.keys(ig.cookies) : 'none');
