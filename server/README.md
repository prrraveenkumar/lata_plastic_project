# Business Management System - Backend API

A comprehensive business management system built with Node.js, Express, and MongoDB. This system allows business owners to manage clients, products, orders, and payments, while clients can view their own orders and payment history. The system includes AI-powered OCR for extracting data from handwritten order slips.

## Features

### Owner/Admin Features
- ✅ User authentication and authorization
- ✅ Add and manage clients
- ✅ Add and manage products with stock tracking
- ✅ Create orders for clients with product details
- ✅ Process payments from clients (auto-distributed to orders)
- ✅ View all orders, payments, and client details
- ✅ AI-powered OCR for handwritten order slip extraction
- ✅ Role-based access control (Admin, Staff, Client)

### Client Features
- ✅ View own orders and order history
- ✅ View total credit balance
- ✅ View payment history
- ✅ Access restricted to own data only

### AI OCR Features
- ✅ Extract text from handwritten order slips using Tesseract.js
- ✅ Parse client name, products, quantities, and prices
- ✅ Extract old balance and total amount
- ✅ Auto-match extracted data with existing clients and products
- ✅ Create orders directly from OCR-extracted data

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Cloud Storage**: Cloudinary
- **OCR**: Tesseract.js
- **Password Hashing**: bcrypt

## Project Structure

```
server/
├── src/
│   ├── app.js                 # Express app configuration
│   ├── index.js               # Server entry point
│   ├── config/
│   │   └── index.js          # Database configuration
│   ├── controllers/
│   │   ├── user.controller.js
│   │   ├── client.controller.js
│   │   ├── product.controller.js
│   │   ├── order.controller.js
│   │   ├── payment.controller.js
│   │   └── ocr.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── role.middleware.js
│   │   └── multer.middleware.js
│   ├── models/
│   │   ├── user.model.js
│   │   ├── product.model.js
│   │   ├── order.model.js
│   │   └── transation.model.js
│   ├── routes/
│   │   ├── user.routes.js
│   │   ├── client.routes.js
│   │   ├── product.routes.js
│   │   ├── order.routes.js
│   │   ├── payment.routes.js
│   │   └── ocr.routes.js
│   └── utils/
│       ├── apiError.js
│       ├── apiResponse.js
│       ├── asyncHandler.js
│       ├── cloudinary.js
│       └── ocrService.js
├── public/
│   └── temp/                  # Temporary file storage
├── package.json
└── API_DOCUMENTATION.md       # Complete API documentation
```

## Installation

1. **Clone the repository** (if applicable) or navigate to the server directory

2. **Install dependencies**:
```bash
npm install
```

3. **Set up environment variables**:
Create a `.env` file in the root directory:
```env
MONGO_URI=mongodb://localhost:27017
PORT=8000
ACCESS_TOKEN_SECRET=your_access_token_secret_here
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_EXPIRY=10d
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CORSE_ORIGIN=http://localhost:3000
```

4. **Start MongoDB** (if running locally):
```bash
mongod
```

5. **Run the server**:
```bash
npm run dev
```

The server will start on `http://localhost:8000` (or the port specified in your `.env` file).

## API Endpoints

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API documentation.

### Quick Reference:

- **User Routes**: `/api/v1/users`
- **Product Routes**: `/api/v1/products`
- **Order Routes**: `/api/v1/orders`
- **Client Routes**: `/api/v1/clients`
- **Payment Routes**: `/api/v1/payments`
- **OCR Routes**: `/api/v1/ocr`

## Database Models

### User Model
- Stores user information (admin, staff, clients)
- Includes authentication fields
- Tracks credit balance for clients

### Product Model
- Product details (name, description, price)
- Stock quantity tracking
- Unit (kg/pcs) and category (soft/regular)

### Order Model
- Bill number (auto-generated)
- Product list with quantities and prices
- Client reference
- Payment status and amount paid
- Old balance tracking

### Transaction Model
- Payment records
- Payment method and reference
- Links to orders that were paid
- Received by (admin/staff)

## Authentication Flow

1. User registers/logs in
2. Server generates access token and refresh token
3. Tokens stored in HTTP-only cookies
4. Access token used for authenticated requests
5. Refresh token used to get new access token when expired

## Role-Based Access Control

- **Admin**: Full access to all features
- **Staff**: Can manage clients, products, orders, payments (cannot delete)
- **Client**: Can only view their own data

## OCR Workflow

1. Upload handwritten order slip image
2. OCR extracts text using Tesseract.js
3. System parses extracted text for:
   - Client name
   - Product details (name, quantity, price)
   - Old balance
   - Total amount
4. System attempts to match with existing clients/products
5. Returns extracted data with suggestions
6. Admin/Staff can create order from extracted data

## Error Handling

All errors are handled using a centralized error handling system:
- Custom `ApiError` class for consistent error responses
- `asyncHandler` wrapper for async route handlers
- Standardized error response format

## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- HTTP-only cookies for token storage
- Role-based access control
- Input validation and sanitization

## Future Enhancements

- [ ] Email notifications
- [ ] PDF invoice generation
- [ ] Advanced reporting and analytics
- [ ] Multi-currency support
- [ ] Barcode scanning for products
- [ ] Mobile app support
- [ ] Real-time notifications
- [ ] Advanced OCR with machine learning models

## License

ISC

## Author

Business Management System - Backend API

