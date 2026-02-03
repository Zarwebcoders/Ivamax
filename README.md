# IVAMAX - MLM + Wallet + Royalty System

A modern, full-stack MLM (Multi-Level Marketing) platform with cryptocurrency wallet integration, binary tree structure, and comprehensive royalty tracking system.

## 🎯 Features

### ✅ Implemented (Phase 1)
- **Authentication System**
  - User registration with auto-generated User ID
  - Login with User ID + Password
  - Forgot password with OTP flow
  - JWT-based authentication
  - Protected routes

- **Dashboard**
  - Comprehensive stats overview
  - Income tracking (PMR, DRR, FCR)
  - Business metrics display
  - Rank visualization
  - Withdrawal statistics

- **Wallet Integration**
  - MetaMask wallet connection
  - Wallet address management
  - Connection status tracking

- **Design System**
  - White & Golden theme
  - Glassmorphism effects
  - Smooth animations with Framer Motion
  - Responsive layout
  - Custom Tailwind configuration

### 🚧 Coming Soon (Phases 2-14)
- Full Profile Management
- Business Details & Binary Tree Visualization
- Interactive Tree View with zoom/expand
- Complete Income Module (PMR, DRR, FCR)
- Report Generation & PDF Download
- Withdrawal Request System
- Admin Panel
- And more...

## 🛠 Tech Stack

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Charts**: Chart.js + react-chartjs-2
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios
- **Web3**: ethers.js, web3.js

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + bcrypt
- **Email**: Nodemailer (for OTP)

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- MetaMask browser extension (for wallet features)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Edit `backend/.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ivamax
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRE=7d
```

4. Start MongoDB (if running locally):
```bash
mongod
```

5. Start the backend server:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Edit `frontend/.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## 🚀 Usage

### User Registration
1. Navigate to `/register`
2. Fill in the registration form:
   - Full Name
   - Mobile Number
   - Email Address
   - Password
   - Referral ID (optional)
   - Wallet Address (optional)
3. System auto-generates User ID (format: IVA100001, IVA100002, etc.)
4. After registration, you'll be logged in automatically

### Login
1. Navigate to `/login`
2. Enter your User ID and Password
3. Optionally check "Remember Me"
4. Click "Login"

### Dashboard
- View total income and breakdown (PMR, DRR, FCR)
- Check business statistics (Left/Right pairs)
- View current rank and royalty percentage
- Monitor withdrawal status
- Quick access to all features

### Wallet Connection
1. Click "Connect Wallet" in the top navbar
2. MetaMask will prompt for connection
3. Approve the connection
4. Your wallet address will be displayed

## 📁 Project Structure

```
IVAMAX/
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── context/        # React context providers
│   │   ├── assets/         # Images, fonts
│   │   └── index.css       # Global styles
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API routes
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Auth, validation
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Helper functions
│   │   └── config/         # Configuration
│   ├── server.js
│   └── package.json
│
└── README.md
```

## 🎨 Design Theme

The application uses a **White & Golden** theme:
- **Primary Colors**: Golden (#FFD700, #FFA500, #DAA520)
- **Background**: White (#FFFFFF, #F8F9FA)
- **Text**: Dark (#1A1A1A, #333333)
- **Accents**: Glassmorphism effects, smooth animations
- **Typography**: Inter font family

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes
- Role-based access control (User/Admin)
- Wallet signature verification
- Rate limiting (configured)

## 📊 Database Models

### User
- Auto-generated User ID
- Personal information
- Investment details
- Referral tracking
- Rank management

### Tree
- Binary tree structure
- Left/Right direct IDs
- Pair counting
- STI (Side Total Income) tracking

### Income
- PMR (Pair Matching Royalty)
- DRR (Direct Referral Royalty)
- FCR (Founder Club Royalty)
- Monthly aggregation

### Wallet
- Wallet address management
- Connection status
- Change request tracking

### Withdrawal
- Request management
- Admin approval workflow
- Transaction tracking

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### More endpoints coming in future phases...

## 🐛 Known Issues

- OTP email sending not yet implemented (currently logs to console)
- Some pages are placeholders (marked as "Coming Soon")
- Admin panel features are in development
- Tree visualization needs full implementation

## 🗺 Roadmap

See `task.md` and `implementation_plan.md` in the brain directory for detailed development roadmap.

## 📝 License

This project is proprietary and confidential.

## 👥 Support

For support, please contact the development team.

---

**Note**: This is Phase 1 of the implementation. Many features are still under development. Check the task list for current progress.
