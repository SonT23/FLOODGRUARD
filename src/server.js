import express from 'express';
import morgan from 'morgan';
import path from 'path';
import { engine } from 'express-handlebars';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

// --- CẤU HÌNH ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// View Engine
app.engine('hbs', engine({ extname: '.hbs' }));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'resources', 'views'));

// --- DỮ LIỆU GIẢ LẬP (Biến toàn cục) ---
let currentSensorData = {
    sensorId: "SENSOR_01",
    waterLevel: 0,
    warningLevel: "normal",
    updatedAt: new Date()
};

// ============================================================
// 📍 WEB VIEWS (Giao diện)
// ============================================================
app.get('/', (req, res) => res.redirect('/index'));
app.get('/index', (req, res) => res.render('index'));
app.get('/sensor', (req, res) => res.render('sensor'));
app.get('/sos', (req, res) => res.render('sos'));
app.get('/grab', (req, res) => res.render('grab'));
app.get('/report', (req, res) => res.render('report'));

// API phụ trợ (Vẫn giữ để Web gọi lấy dữ liệu ban đầu)
app.get('/api/sensors', (req, res) => {
    res.json([currentSensorData]);
});

// ============================================================
// 📍 SOCKET.IO & AUTO GENERATOR (QUAN TRỌNG NHẤT)
// ============================================================
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    // Gửi ngay dữ liệu mới nhất khi khách vừa vào
    socket.emit('new_sensor_data', currentSensorData);
    
    socket.on('chat_message', (msg) => {
        io.emit('chat_message', msg);
    });
});

// --- BỘ MÁY TẠO DỮ LIỆU GIẢ (AUTO-PILOT) ---
console.log("🚀 Đang chạy chế độ DEMO: Dữ liệu sẽ tự động nhảy mỗi 5 giây...");

setInterval(() => {
    // 1. GIẢ LẬP CẢM BIẾN (Mực nước ngẫu nhiên từ 100cm - 250cm)
    // Math.random() tạo số từ 0-1. 
    // Công thức: (Random * (Max - Min)) + Min
    const randomWaterLevel = (Math.random() * (250 - 100) + 100).toFixed(1);
    
    let warning = "normal";
    if (randomWaterLevel > 200) warning = "danger"; // >2m là nguy hiểm
    else if (randomWaterLevel > 150) warning = "alert"; // >1.5m là cảnh báo

    // Cập nhật biến dữ liệu chung
    currentSensorData = {
        sensorId: "SENSOR_01",
        waterLevel: parseFloat(randomWaterLevel),
        warningLevel: warning,
        updatedAt: new Date()
    };

    // Gửi ra Dashboard (/sensor)
    io.emit('new_sensor_data', currentSensorData);
    console.log(`📡 [AUTO] Sensor gửi: ${randomWaterLevel}cm (${warning})`);

    // 2. GIẢ LẬP SOS (Xác suất 30% sẽ có người kêu cứu mỗi 5 giây)
    if (Math.random() > 0.7) { 
        // Tạo tọa độ ngẫu nhiên xung quanh Hương Khê (18.188, 105.715)
        // Cộng trừ một chút xíu (0.01) để vị trí thay đổi
        const randomLat = 18.188 + (Math.random() * 0.02 - 0.01);
        const randomLng = 105.715 + (Math.random() * 0.02 - 0.01);

        const sosMsg = {
            id: Date.now(),
            message: "Nước vào nhà nhanh quá, cứu tôi với!",
            lat: randomLat,
            lng: randomLng,
            type: "SOS"
        };

        // Gửi ra Bản đồ (/index) và trang SOS (/sos)
        io.emit('sos_alert', sosMsg);
        console.log(`🆘 [AUTO] Phát tín hiệu SOS tại [${randomLat.toFixed(3)}, ${randomLng.toFixed(3)}]`);
    }

}, 5000); // Chạy mỗi 5000ms (5 giây)

// Khởi chạy Server
httpServer.listen(port, () => {
    console.log(`Server đang chạy tại http://localhost:${port}`);
});