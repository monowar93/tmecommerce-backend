# TM_ECommerce - Backend

TM_ECommerce backend is a RESTful API built to support a modern e-commerce
platform. It handles user authentication, product management, orders, payments
via Stripe, and admin functionality with secure access control.

## Live Backend Link

https://tm-ecommerce-backend.vercel.app/

## FrontEnd Repository

https://github.com/tarekmonowar/E-Commerce-FrontEnd

## Features

### User Features

- User registration and login
- OAuth2 authentication and JWT token-based sessions
- View products and filter by category
- Add products to cart and place orders
- Stripe payment integration
- Track order status
- Write Reviews

### Admin Features

- Add, edit, delete products
- Block or manage users
- View all orders and payments
- Access real-time statistics

### API Features

- RESTful endpoints for products, users, orders, payments
- Token-based authentication for protected routes
- Role-based access for admin and users

## Technologies Used

- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** OAuth2, JWT , Bcrypt
- **Payment Gateway:** Stripe
- **Logging & Monitoring:** Winston / Morgan
- **Environment Management:** dotenv
- **CORS Handling:** cors middleware

## 🔐 Authentication Routes

All authentication-related routes are prefixed with: `/api/v1/auth`

| Method | Endpoint           | Description                       | Access        |
| ------ | ------------------ | --------------------------------- | ------------- |
| POST   | `/login`           | User login with credentials       | Public        |
| POST   | `/refresh-token`   | Refresh access token              | Public        |
| POST   | `/logout`          | Invalidate current session        | Authenticated |
| POST   | `/change-password` | Change user password              | Authenticated |
| POST   | `/set-password`    | set password for google auth user | Authenticated |
| POST   | `/forgot-password` | Initiate password reset Link      | Public        |
| POST   | `/forgot-password` | Initiate new password reset       | Public        |
| GET    | `/google`          | Initiate Google OAuth login       | Public        |
| GET    | `/google/callback` | Google OAuth callback handler     | Public        |

## 👤 User Management

All user-related routes are prefixed with: `/api/v1/user`

| Method | Endpoint     | Description                                        | Access        |
| ------ | ------------ | -------------------------------------------------- | ------------- |
| POST   | `/register`  | Register new user with email/name/password         | Public        |
| GET    | `/all-users` | Get all users by admin with filter,sort,pagination | Admin Only    |
| GET    | `/me`        | Get current user profile                           | Authenticated |
| GET    | `/:id`       | Get user by ID                                     | Admin Only    |
| PATCH  | `/:id`       | Update user information                            | Owner/Admin   |

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/tarekmonowar/E-Commerce-BackEnd.git
   ```

## Contact Information

For any questions or support, reach out via email:

**Email:** [tarekmonowar353@gmail.com](mailto:tarekmonowar353@gmail.com)
