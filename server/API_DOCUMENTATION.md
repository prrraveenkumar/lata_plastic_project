# Business Management API Documentation

## Overview
This is a comprehensive business management system API that allows owners to manage clients, products, orders, and payments. Clients can view their own orders and payment history. The system also includes AI-powered OCR for extracting data from handwritten order slips.

## Base URL
```
http://localhost:8000/api/v1
```

## Authentication
Most endpoints require JWT authentication. Include the access token in:
- Cookie: `accessToken` (preferred)
- Header: `Authorization: Bearer <token>`

## User Roles
- `admin`: Full access to all features
- `staff`: Can manage clients, products, orders, and payments
- `client`: Can only view their own data

---

## User Routes (`/users`)

### Register User
**POST** `/users/register`
- **Public**: Yes
- **Body**: 
  ```json
  {
    "fullname": "John Doe",
    "mobileno": "1234567890",
    "password": "password123",
    "email": "john@example.com",
    "address": "123 Main St",
    "role": "client" // optional, defaults to "client"
  }
  ```
- **File**: `avatar` (optional, multipart/form-data)

### Login
**POST** `/users/login`
- **Public**: Yes
- **Body**:
  ```json
  {
    "mobileno": "1234567890",
    "password": "password123"
  }
  ```

### Logout
**POST** `/users/logout`
- **Auth**: Required

### Get Current User
**GET** `/users/current-user`
- **Auth**: Required

### Change Password
**POST** `/users/change-password`
- **Auth**: Required
- **Body**:
  ```json
  {
    "oldPassword": "oldpass",
    "newPassword": "newpass"
  }
  ```

---

## Product Routes (`/products`)

### Get All Products
**GET** `/products?page=1&limit=10&category=regular&unit=kg&search=plastic`
- **Auth**: Required
- **Query Params**: `page`, `limit`, `category`, `unit`, `search`

### Get Product by ID
**GET** `/products/:productId`
- **Auth**: Required

### Create Product
**POST** `/products`
- **Auth**: Required (Admin/Staff only)
- **Body**:
  ```json
  {
    "name": "Plastic Bag",
    "description": "High quality plastic bag",
    "price": 10.50,
    "stockQuantity": 100,
    "unit": "pcs", // or "kg"
    "category": "regular" // or "soft"
  }
  ```

### Update Product
**PATCH** `/products/:productId`
- **Auth**: Required (Admin/Staff only)

### Delete Product
**DELETE** `/products/:productId`
- **Auth**: Required (Admin only)

### Get Low Stock Products
**GET** `/products/low-stock?threshold=10`
- **Auth**: Required

### Update Stock
**PATCH** `/products/:productId/stock`
- **Auth**: Required (Admin/Staff only)
- **Body**:
  ```json
  {
    "stockQuantity": 150,
    "operation": "set" // or "add"
  }
  ```

---

## Order Routes (`/orders`)

### Get All Orders
**GET** `/orders?clientId=xxx&paymentStatus=Unpaid&page=1&limit=10`
- **Auth**: Required
- **Note**: Clients only see their own orders

### Get Order by ID
**GET** `/orders/:orderId`
- **Auth**: Required
- **Note**: Clients can only access their own orders

### Create Order
**POST** `/orders`
- **Auth**: Required (Admin/Staff only)
- **Body**:
  ```json
  {
    "clientId": "client_id_here",
    "oldBalance": 500,
    "productList": [
      {
        "productId": "product_id_1",
        "quantity": 10,
        "pricePerUnit": 15.50
      },
      {
        "productId": "product_id_2",
        "quantity": 5,
        "pricePerUnit": 20.00
      }
    ]
  }
  ```

### Update Order
**PATCH** `/orders/:orderId`
- **Auth**: Required (Admin/Staff only)

### Update Order Status
**PATCH** `/orders/:orderId/status`
- **Auth**: Required (Admin/Staff only)
- **Body**:
  ```json
  {
    "paymentStatus": "Paid",
    "amountPaid": 1000
  }
  ```

### Delete Order
**DELETE** `/orders/:orderId`
- **Auth**: Required (Admin only)

---

## Client Routes (`/clients`)

### Add Client
**POST** `/clients`
- **Auth**: Required (Admin/Staff only)
- **Body**:
  ```json
  {
    "fullname": "Jane Doe",
    "mobileno": "9876543210",
    "password": "password123",
    "email": "jane@example.com",
    "address": "456 Oak St"
  }
  ```

### Get All Clients
**GET** `/clients?search=jane&page=1&limit=10`
- **Auth**: Required (Admin/Staff only)

### Get Client Details
**GET** `/clients/:clientId`
- **Auth**: Required (Admin/Staff only)
- **Returns**: Client info, orders, payments, and total credit

### Process Client Payment
**POST** `/clients/:clientId/payment`
- **Auth**: Required (Admin/Staff only)
- **Body**:
  ```json
  {
    "paymentAmount": 5000,
    "paymentMethod": "Cash", // "Cash", "Online", "Cheque", "Bank Transfer"
    "referenceNumber": "CHQ123456" // optional
  }
  ```
- **Note**: Payment is automatically distributed to oldest unpaid orders first

### Get My Credit (Client)
**GET** `/clients/my-credit`
- **Auth**: Required (Client only)
- **Returns**: Credit balance, orders, and payment history

---

## Payment Routes (`/payments`)

### Get All Payments
**GET** `/payments?clientId=xxx&paymentMethod=Cash&page=1&limit=10`
- **Auth**: Required
- **Note**: Clients only see their own payments

### Get Payment by ID
**GET** `/payments/:paymentId`
- **Auth**: Required

### Get My Payments (Client)
**GET** `/payments/my-payments`
- **Auth**: Required (Client only)

---

## OCR Routes (`/ocr`)

### Process Order Slip Image
**POST** `/ocr/process-slip`
- **Auth**: Required (Admin/Staff only)
- **Content-Type**: `multipart/form-data`
- **Body**: `image` (file)
- **Returns**: Extracted data including:
  - Client name (with matching suggestions)
  - Products (with matching suggestions)
  - Old balance
  - Total amount
  - Raw OCR text

### Create Order from OCR Data
**POST** `/ocr/create-order`
- **Auth**: Required (Admin/Staff only)
- **Body**:
  ```json
  {
    "clientId": "client_id_here",
    "oldBalance": 500,
    "totalAmount": 2000,
    "products": [
      {
        "productId": "product_id_1",
        "quantity": 10,
        "pricePerUnit": 15.50,
        "totalPrice": 155.00
      }
    ]
  }
  ```

---

## Error Responses

All errors follow this format:
```json
{
  "statusCode": 400,
  "message": "Error message",
  "success": false,
  "data": null
}
```

## Success Responses

All success responses follow this format:
```json
{
  "statusCode": 200,
  "message": "Success message",
  "success": true,
  "data": { ... }
}
```

---

## Environment Variables

Create a `.env` file with:
```
MONGO_URI=mongodb://localhost:27017
PORT=8000
ACCESS_TOKEN_SECRET=your_secret_key
REFRESH_TOKEN_SECRET=your_refresh_secret_key
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_EXPIRY=10d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CORSE_ORIGIN=http://localhost:3000
```

---

## Installation & Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env`

3. Start the server:
```bash
npm run dev
```

---

## Features

### Owner/Admin Features:
- ✅ Add and manage clients
- ✅ Add and manage products
- ✅ Create orders for clients
- ✅ Process payments from clients
- ✅ View all orders and payments
- ✅ AI-powered OCR for handwritten order slips

### Client Features:
- ✅ View own orders
- ✅ View total credit balance
- ✅ View payment history
- ✅ Access restricted to own data only

### AI OCR Features:
- ✅ Extract text from handwritten order slips
- ✅ Parse client name, products, quantities, prices
- ✅ Extract old balance and total amount
- ✅ Auto-match with existing clients and products
- ✅ Create orders directly from OCR data

