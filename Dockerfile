# Use Node.js for both build and runtime
FROM node:22-slim

WORKDIR /app

# Install dependencies for both frontend and backend
COPY package*.json ./
RUN npm install

# Copy all files
COPY . .

# Build the frontend (Vite)
RUN npm run build

# Expose the port (Cloud Run uses PORT env var)
EXPOSE 4000

# Start the server
CMD ["node", "server/src/index.js"]
