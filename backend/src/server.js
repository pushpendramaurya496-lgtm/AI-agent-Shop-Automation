require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 3000;

console.log("🚀 Server chalu ho raha hai, MongoDB se connect kar rahe hain...\n");

app.listen(PORT, () => {
    console.log(`✅ Server successfully chal raha hai: http://localhost:${PORT}`);
    console.log(`📚 Swagger API Docs yahan dekhein: http://localhost:${PORT}/api-docs\n`);
    
    // Server chalne ke baad database se connect karenge (Atlas cluster)
    connectDB();
});