# Sử dụng Node.js bản nhẹ (Alpine Linux)
FROM node:18-alpine

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Copy file package.json và package-lock.json trước để tận dụng cache
COPY package*.json ./

# Cài đặt các thư viện (dependencies)
RUN npm install

# Copy toàn bộ mã nguồn vào container
COPY . .

# Mở port 3000 (Port mà server.js của bạn đang dùng)
EXPOSE 3000

# Lệnh chạy ứng dụng khi container khởi động
CMD ["npm", "start"]