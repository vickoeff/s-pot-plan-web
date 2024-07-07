FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Salin package.json dan package-lock.json ke dalam container
COPY package*.json ./

# Install dependencies
RUN npm install

# Salin semua file ke dalam container
COPY . .

# Build aplikasi Next.js
RUN npm run build

# Gunakan base image yang lebih ringan untuk produksi
FROM node:20-alpine AS production

# Set working directory
WORKDIR /app

# Salin hasil build dari tahap builder
COPY --from=builder /app ./

# Install hanya dependencies produksi
RUN npm install --production

# Expose port
EXPOSE 3000

# Start aplikasi
CMD ["npm", "start"]
