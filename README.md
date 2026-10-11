# Shop-Home: AI-Powered Multi-Tenant WhatsApp E-Commerce Platform 🛒🤖

A modern, production-grade Node.js backend enabling local retail shops to manage inventory, process customer orders, perform walk-in POS counter billing with automated WhatsApp invoices, and engage customers 24/7 via an AI Sales Assistant (Digital Munshi).

---

## 🌟 Key Features

1. **Multi-Tenant Architecture**: Complete data isolation (`shopId` scoped) for multiple shops on a single backend.
2. **AI Sales Assistant (Digital Munshi)**:
   - Powered by OpenAI `gpt-4o-mini`.
   - Uses function calling / tools (`check_stock_and_price`, `place_order`, `get_shop_info`).
   - Friendly Hinglish / Hindi conversations with chat memory.
3. **WhatsApp Cloud API Integration**:
   - Meta Webhook verification handshake (`GET /webhook`).
   - Inbound message processing (`POST /webhook`).
   - Outbound messaging to customers.
4. **Counter POS Sale + Auto WhatsApp Invoice**:
   - Walk-in billing for physical customers.
   - Real-time inventory stock deduction.
   - Instant digital invoice delivered directly to customer's WhatsApp.
5. **Customer CRM & Udhaar Khata Book**:
   - Lifetime order counts and total spent tracking.
   - Saved delivery addresses.
   - Udhaar balance ledger (+ debt / - payment).
6. **Interactive OpenAPI / Swagger Documentation**:
   - Fully interactive docs available at `/api-docs`.

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd shop-home/backend
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and update values:
```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/shop-home
JWT_SECRET=your_jwt_secret_here
OPENAI_API_KEY=your_openai_api_key_here
WHATSAPP_VERIFY_TOKEN=shop_home_verify_secret_token_123
WHATSAPP_ACCESS_TOKEN=your_meta_system_user_access_token_here
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Open Swagger Documentation
Visit: `http://localhost:3000/api-docs`

---

## 📁 Architecture
```
backend/src/
├── config/        # Database & Swagger setup
├── middlewares/   # JWT Authentication Guard
├── modules/
│   ├── auth/       # Shopkeeper signup, login & password management
│   ├── shop/       # Business settings, timings, delivery rules
│   ├── inventory/  # Product catalog & stock tracking
│   ├── order/      # Online & Counter POS orders + WhatsApp bills
│   ├── customer/   # Customer CRM & Udhaar Khata
│   ├── ai-agent/   # AI Munshi OpenAI function calling
│   └── whatsapp/   # Meta Cloud API Webhook & messaging
└── routes/         # Central router mounting
```
