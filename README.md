# 🍔 Food Delivery API

Hệ thống API quản lý đặt món ăn được xây dựng với NestJS, sử dụng kiến trúc microservices với load balancing và monitoring.

## 📋 Mục lục

- [Tổng quan](#🎯tổng-quan)
- [Kiến trúc hệ thống](#🏗️kiến-trúc-hệ-thống)
- [Công nghệ sử dụng](#🛠️công-nghệ-sử-dụng)
- [Cấu trúc dự án](#📁cấu-trúc-dự-án)
- [Yêu cầu hệ thống](#💻yêu-cầu-hệ-thống)
- [Cài đặt và cấu hình](#⚙️cài-đặt-và-cấu-hình)
- [Biến môi trường](#🔐biến-môi-trường)
- [Chạy ứng dụng](#🚀chạy-ứng-dụng)
- [Database](#🗄️database)
- [API Documentation](#📚api-documentation)
- [Monitoring](#📊monitoring)
- [Development](#💻development)

---

## 🎯Tổng quan

Food Delivery API là một hệ thống backend RESTful API được thiết kế để quản lý:

- **Người dùng**: Đăng ký, đăng nhập, quản lý profile
- **Nhà hàng**: Danh sách nhà hàng, thông tin chi tiết, menu
- **Đơn hàng**: Tạo đơn hàng, theo dõi trạng thái, quản lý inventory
- **Xác thực**: JWT-based authentication với Passport.js

Hệ thống được triển khai với:

- **3 API instances** chạy song song để xử lý tải cao
- **Nginx Load Balancer** phân phối request
- **Redis** cho caching và inventory management
- **PostgreSQL** database
- **Prometheus & Grafana** cho monitoring

---

## 🏗️Kiến trúc hệ thống

```
┌─────────────────┐
│   Client/User   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Nginx (8080)   │  ← Load Balancer
└────────┬────────┘
         │
    ┌────┴────┬──────────┐
    ▼         ▼          ▼
┌──────┐ ┌──────┐ ┌──────┐
│API-1 │ │API-2 │ │API-3 │  ← API Instances (3001, 3002, 3003)
│:3001 │ │:3002 │ │:3003 │
└──┬───┘ └──┬───┘ └──┬───┘
   │        │        │
   └────────┼────────┘
            │
    ┌───────┴────────┐
    ▼                ▼
┌─────────┐    ┌──────────┐
│PostgreSQL│   │  Redis   │
│Database │   │  Cache   │
└─────────┘    └──────────┘
```

### Các thành phần chính

1. **Nginx Load Balancer** (Port 8080)
   - Phân phối request đến 3 API instances
   - Health checks tự động
   - Rate limiting (có thể bật/tắt)
   - Logging và monitoring

2. **API Instances** (Ports 3001, 3002, 3003)
   - Mỗi instance chạy độc lập
   - Cùng codebase, khác `SERVER_ID`
   - Graceful shutdown
   - Metrics collection

3. **PostgreSQL Database**
   - Lưu trữ dữ liệu chính
   - Prisma ORM
   - Migrations và seeding

4. **Redis**
   - Caching
   - Inventory management (real-time)
   - Distributed locking cho cron jobs

5. **Monitoring Stack**
   - **Prometheus** (Port 9090): Thu thập metrics
   - **Grafana** (Port 5050): Visualization dashboards

---

## 🛠️Công nghệ sử dụng

### Backend Framework

- **NestJS** 11.x - Progressive Node.js framework
- **TypeScript** 5.9.x
- **Nx** 22.3.3 - Monorepo tool

### Database & ORM

- **PostgreSQL** - Relational database
- **Prisma** 7.2.0 - Next-generation ORM

### Caching & Queue

- **Redis** 7.2 - In-memory data store
  
### Authentication

- **Passport.js** - Authentication middleware
- **JWT** - JSON Web Tokens
- **bcrypt** - Password hashing

### API Documentation

- **Swagger/OpenAPI** - API documentation

### Infrastructure

- **Docker** & **Docker Compose** - Containerization
- **Nginx** - Reverse proxy & load balancer
- **Prometheus** - Metrics collection
- **Grafana** - Metrics visualization

### Development Tools

- **Jest** - Testing framework
- **ESLint** - Code linting
- **Prettier** - Code formatting

---

## 📁Cấu trúc dự án

```text
food-delivery/
├── apps/
│   ├── food-delivery/              # Main application
│   │   ├── src/
│   │   │   ├── app/                # App module, bootstrap
│   │   │   ├── common/             # Shared utilities
│   │   │   │   ├── decorator/      # Custom decorators
│   │   │   │   ├── dto/            # Common DTOs
│   │   │   │   ├── helper/         # Helper functions
│   │   │   │   ├── interceptor/    # Interceptors
│   │   │   │   └── redis/         # Redis module
│   │   │   ├── module/             # Feature modules
│   │   │   │   ├── auth/          # Authentication
│   │   │   │   ├── user/          # User management
│   │   │   │   ├── restaurant/    # Restaurant CRUD
│   │   │   │   ├── order/         # Order management
│   │   │   │   ├── menu/          # Menu items
│   │   │   │   ├── health/        # Health checks
│   │   │   │   ├── metrics/       # Prometheus metrics
│   │   │   │   └── prisma/        # Prisma service
│   │   │   └── main.ts            # Application entry point
│   │   ├── prisma/
│   │   │   ├── schema.prisma      # Database schema
│   │   │   └── seed.ts            # Database seeding
│   │   ├── nginx/                 # Nginx configuration
│   │   ├── monitoring/            # Prometheus & Grafana configs
│   │   ├── Dockerfile             # Production Docker image
│   │   ├── Dockerfile.dev         # Development Docker image
│   │   └── .env                   # Environment variables (tạo file này)
│   ├── food-delivery-e2e/         # E2E tests
│   └── ...
├── docker-compose.yml              # Production compose
├── docker-compose.dev.yml          # Development compose
├── nx.json                         # Nx configuration
├── package.json                    # Dependencies
└── README.md                       # This file
```

---

## 💻Yêu cầu hệ thống

- **Node.js**: >= 20.x
- **npm**: >= 10.x
- **Docker**: >= 20.x
- **Docker Compose**: >= 2.x
- **PostgreSQL**: >= 14.x (hoặc dùng Docker)
- **Redis**: >= 7.x (hoặc dùng Docker)

---

## ⚙️Cài đặt và cấu hình

### 1. Clone repository

```bash
git clone <repository-url>
cd food-delivery
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Tạo file `.env`

Tạo file `.env` trong thư mục `apps/food-delivery/`:

```bash
cp apps/food-delivery/.env.example apps/food-delivery/.env
# Hoặc tạo file mới
touch apps/food-delivery/.env
```

---

## 🔐Biến môi trường

File `.env` cần được đặt tại: `apps/food-delivery/.env`

### Các biến bắt buộc

```env
# Environment
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/food_delivery?schema=public

# JWT Authentication
JWT_SECRET_KEY=your-super-secret-key-minimum-32-characters-long
JWT_EXPIRES_IN=7d

# Redis
REDIS_URL=redis://localhost:6379

# Server ID (được set tự động trong Docker, nhưng cần cho local dev)
SERVER_ID=api-1
```

### Giải thích các biến

| Biến | Mô tả | Ví dụ |
|------|-------|-------|
| `NODE_ENV` | Môi trường chạy | `development`, `production`, `test` |
| `PORT` | Port API server | `3000` |
| `DATABASE_URL` | Connection string PostgreSQL | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET_KEY` | Secret key cho JWT (tối thiểu 32 ký tự) | `your-secret-key-here` |
| `JWT_EXPIRES_IN` | Thời gian hết hạn token | `7d`, `24h`, `1h` |
| `REDIS_URL` | Connection string Redis | `redis://localhost:6379` |
| `SERVER_ID` | ID định danh server instance | `api-1`, `api-2`, `api-3` |

### Tạo JWT Secret Key

```bash
# Linux/Mac
openssl rand -base64 32

# Hoặc sử dụng Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 🚀Chạy ứng dụng

### Option 1: Chạy với Docker Compose (Khuyến nghị)

#### Development mode

```bash
docker-compose -f docker-compose.dev.yml up --build
```

#### Production mode

```bash
docker-compose up --build
```

#### Chạy ở background

```bash
docker-compose up -d
```

#### Dừng services

```bash
docker-compose down
```

#### Xem logs

```bash
# Tất cả services
docker-compose logs -f

# Một service cụ thể
docker-compose logs -f api-1
docker-compose logs -f nginx
```

### Option 2: Chạy local (không dùng Docker)

#### 1. Khởi động PostgreSQL và Redis

```bash
# PostgreSQL (nếu chưa có)
docker run -d \
  --name postgres \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=food_delivery \
  -p 5432:5432 \
  postgres:14

# Redis
docker run -d \
  --name redis \
  -p 6379:6379 \
  redis:7.2-alpine
```

#### 2. Setup database

```bash
# Generate Prisma client
npx prisma generate --schema=apps/food-delivery/prisma/schema.prisma

# Run migrations
npx prisma migrate dev --schema=apps/food-delivery/prisma/schema.prisma

# Seed data (optional)
npx tsx apps/food-delivery/prisma/seed.ts
```

#### 3. Chạy ứng dụng

```bash
# Development mode (với hot reload)
nx serve food-delivery

# Hoặc build và chạy
nx build food-delivery
node dist/apps/food-delivery/main.js
```

### Option 3: Chạy từng service riêng lẻ

#### Chạy một API instance

```bash
# Set SERVER_ID
export SERVER_ID=api-1
export PORT=3001

# Chạy
nx serve food-delivery
```

---

## 🗄️Database

### Prisma Schema

Database schema được định nghĩa trong `apps/food-delivery/prisma/schema.prisma`

### Các models chính

- **User**: Người dùng (USER, ADMIN, OWNER)
- **Restaurant**: Nhà hàng với địa chỉ, rating, cuisine type
- **MenuItem**: Món ăn trong menu, có inventory
- **Order**: Đơn hàng với status tracking
- **OrderItem**: Chi tiết món trong đơn hàng

### Prisma Commands

```bash
# Generate Prisma Client
npx prisma generate --schema=apps/food-delivery/prisma/schema.prisma

# Tạo migration mới
npx prisma migrate dev --name migration_name --schema=apps/food-delivery/prisma/schema.prisma

# Chạy migrations
npx prisma migrate deploy --schema=apps/food-delivery/prisma/schema.prisma

# Xem database trong Prisma Studio
npx prisma studio --schema=apps/food-delivery/prisma/schema.prisma

# Seed database
npx tsx apps/food-delivery/prisma/seed.ts
```

### Seed Data

Script seed tạo:

- 1 Admin user: `admin@example.com` / `123456`
- 1 Owner user: `owner@example.com` / `123456`
- 100 Regular users
- 10 Restaurants với 15 menu items mỗi nhà hàng

---

### Seed Inventory Data cho Redis

```bash
# Đến thư mục prisma
cd apps/food-delivery/prisma

# Chạy lệnh seed data vao redis
npx tsx seed.redis.ts
```

## 📚 API Documentation

### Swagger UI

Khi ứng dụng chạy, truy cập Swagger UI tại:

- **Local**: <http://localhost:3000/api/docs>
- **Docker**: <http://localhost:8080/api/docs>

### Các endpoints chính

#### Authentication (`/api/auth`)

- `POST /api/auth/register` - Đăng ký tài khoản mới
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất
- `GET /api/auth/profile` - Lấy thông tin profile (cần JWT)

#### Restaurants (`/api/restaurants`)

- `GET /api/restaurants` - Danh sách nhà hàng (có pagination, filter)
- `GET /api/restaurants/:id` - Chi tiết nhà hàng
- `GET /api/restaurants/:id/menu` - Menu của nhà hàng

#### Orders (`/api/orders`)

- `POST /api/orders` - Tạo đơn hàng mới
- `GET /api/orders` - Danh sách đơn hàng
- `GET /api/orders/:id` - Chi tiết đơn hàng
- `PATCH /api/orders/:id/status` - Cập nhật trạng thái đơn hàng

#### Health & Metrics

- `GET /api/health` - Health check
- `GET /api/ready` - Readiness probe
- `GET /api/live` - Liveness probe
- `GET /api/info` - Server information
- `GET /api/metrics` - Prometheus metrics

## Authentication

Hầu hết các endpoints yêu cầu JWT token trong header:

```text
Authorization: Bearer <your-jwt-token>
```

### Response Format

Tất cả responses đều có format chuẩn:

```json
{
  "success": true,
  "data": { ... },
  "message": "Success",
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

---

## 📊Monitoring

### Prometheus

- **URL**: <http://localhost:9090>
- **Metrics endpoint**: <http://localhost:3000/api/metrics> (mỗi API instance)
- Thu thập metrics từ 3 API instances

### Grafana

- **URL**: <http://localhost:5050>
- **Username**: `admin`
- **Password**: `admin` (mặc định)
- Dashboards được tự động provision từ `apps/food-delivery/monitoring/grafana/dashboards/`

### Metrics được thu thập

- HTTP request count
- HTTP request duration
- Error rate
- Active connections
- Server ID tracking

### Nginx Status

- **URL**: <http://localhost:8080/nginx-status> (chỉ accessible từ internal network)

---

## 💻 Development

### Nx Commands

```bash
# Chạy development server
nx serve food-delivery

# Build application
nx build food-delivery

# Run tests
nx test food-delivery

# Lint code
nx lint food-delivery

# Xem project graph
nx graph

# Xem project details
nx show project food-delivery
```

### Code Structure

- **Modules**: Mỗi feature là một NestJS module độc lập
- **DTOs**: Data Transfer Objects cho validation
- **Guards**: JWT authentication guard
- **Interceptors**: Metrics collection
- **Services**: Business logic
- **Controllers**: HTTP endpoints

### Hot Reload

Khi chạy với `nx serve`, code sẽ tự động reload khi có thay đổi.

### Testing

```bash
# Unit tests
nx test food-delivery

# E2E tests
nx e2e food-delivery-e2e
```

### Linting & Formatting

```bash
# Lint
nx lint food-delivery

# Format (nếu có Prettier)
npm run format
```

---

## 🐳 Docker

### Build Images

```bash
# Production image
docker build -f apps/food-delivery/Dockerfile -t food-delivery:latest .

# Development image
docker build -f apps/food-delivery/Dockerfile.dev -t food-delivery:dev .
```

### Docker Compose Services

| Service | Port | Description |
|---------|------|-------------|
| `api-1` | 3001 | API instance 1 |
| `api-2` | 3002 | API instance 2 |
| `api-3` | 3003 | API instance 3 |
| `nginx` | 8080 | Load balancer |
| `prometheus` | 9090 | Metrics collection |
| `grafana` | 5050 | Metrics visualization |
| `redis` | 6379 | Cache & queue |

### Resource Limits (Production)

- **API instances**: 0.5 CPU, 256MB RAM
- **Nginx**: Default limits
- **Monitoring**: Default limits

---

## 🔧 Troubleshooting

### Lỗi kết nối database

```bash
# Kiểm tra PostgreSQL đang chạy
docker ps | grep postgres

# Kiểm tra connection string trong .env
# Đảm bảo DATABASE_URL đúng format
```

### Lỗi Redis connection

```bash
# Kiểm tra Redis đang chạy
docker ps | grep redis

# Test connection
redis-cli ping
```

### Lỗi JWT validation

- Đảm bảo `JWT_SECRET_KEY` có ít nhất 32 ký tự
- Kiểm tra token format: `Bearer <token>`

### Port đã được sử dụng

```bash
# Tìm process đang dùng port
# Windows
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :3000

# Hoặc thay đổi PORT trong .env
```

### Docker build fails

```bash
# Xóa cache và build lại
docker-compose build --no-cache

# Xóa volumes cũ
docker-compose down -v
```

---

## 📝 Notes

### Inventory Management

- Inventory được quản lý trong Redis để đảm bảo real-time updates
- Cron job chạy mỗi 10 giây để sync Redis → Database
- Distributed locking đảm bảo chỉ một instance sync tại một thời điểm

### Load Balancing

- Nginx sử dụng round-robin (có thể thay đổi trong nginx.conf)
- Health checks tự động loại bỏ unhealthy instances
- Failover tự động

### Security

- JWT tokens có expiration
- Password được hash với bcrypt
- CORS enabled (có thể cấu hình)
- Rate limiting có thể bật trong nginx.conf

---

## 📄 License

MIT

---

## 👥 Contributors

- [Your Name/Team]

---

## 🔗 Useful Links

- [NestJS Documentation](https://docs.nestjs.com/)
- [Nx Documentation](https://nx.dev/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Docker Documentation](https://docs.docker.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)

---

**Happy Coding! 🚀**
