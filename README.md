# Babymall E-commerce Platform

A modern, full-stack e-commerce platform specifically designed for baby products, built with cutting-edge technologies and best practices.

## 🚀 Project Overview

Babymall is a comprehensive e-commerce solution featuring four main applications:

- **Admin Dashboard** - Manage products, orders, and analytics
- **Client Website** - Customer-facing shopping experience
- **Mobile App** - Native mobile shopping application
- **Backend Server** - RESTful API with comprehensive features

## 🏗️ Architecture

```
Babymall/
├── admin/          # React + Vite Admin Dashboard
├── client/         # Next.js Customer Website
├── mobileapp/      # React Native Mobile App
└── server/         # Node.js + Express API Backend
```

## 🛠️ Technology Stack

### Frontend

- **Admin Dashboard**: React 18 + TypeScript + Vite + TailwindCSS + shadcn/ui
- **Client Website**: Next.js 14 + TypeScript + TailwindCSS + shadcn/ui
- **Mobile App**: React Native + TypeScript + Expo

### Backend

- **Server**: Node.js + Express.js + MongoDB + JWT Authentication
- **File Storage**: Cloudinary integration
- **API Documentation**: Swagger/OpenAPI

### State Management & UI

- **State**: Zustand for all applications
- **UI Components**: Radix UI, shadcn/ui, Lucide React icons
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios (admin/mobile), Fetch API (client)

## 📱 Application Details

### 🖥️ Admin Dashboard (Port 5173)

**Purpose**: Complete administrative control panel

- **Technology**: React + Vite + TypeScript
- **Features**: Product management, order processing, analytics, user management
- **Access**: `http://localhost:5173`
- **Start Command**: `npm run dev`

**What you'll see**: A clean admin interface with placeholder content explaining the admin dashboard purpose. Simply remove the placeholder text and start building your admin features.

### 🌐 Client Website

**Purpose**: Customer-facing e-commerce website

- **Technology**: Next.js + TypeScript
- **Features**: Product browsing, shopping cart, user authentication, order tracking

**What you'll see**: A modern e-commerce homepage with project information. Remove the intro text to start customizing for your needs.

### 📱 Mobile App

**Purpose**: Native mobile shopping experience

- **Technology**: React Native + TypeScript
- **Features**: Mobile-optimized shopping, push notifications, offline support

**What you'll see**: A React Native app ready for mobile e-commerce development with placeholder content explaining the mobile app structure.

### 🔧 Backend Server

**Purpose**: RESTful API backend

- **Technology**: Node.js + Express + MongoDB
- **Features**: Authentication, product management, order processing, file uploads

## 📋 Features Overview

### Admin Dashboard

- 📊 Analytics & Reports
- 📦 Product Management (CRUD)
- 🛍️ Order Management
- 👥 User Management
- 🏷️ Category & Brand Management
- 📸 Image Upload & Management
- 💳 Payment Processing
- 🔐 Role-based Access Control

### Client Website

- 🛒 Shopping Cart & Checkout
- 🔍 Product Search & Filtering
- 👤 User Authentication & Profile
- 📱 Responsive Design
- ⭐ Product Reviews & Ratings
- 💝 Wishlist Functionality
- 📋 Order History
- 🎯 Category Browsing

### Mobile App

- 📱 Native Mobile Experience
- 🔔 Push Notifications
- 📴 Offline Support
- 📍 Location Services
- 📷 Camera Integration
- 🔄 Sync with Web Platform

### Backend API

- 🔐 JWT Authentication
- 📡 RESTful API Design
- 📊 MongoDB Integration
- ☁️ Cloudinary File Storage
- 📝 Comprehensive Logging
- 🔄 Request Validation
- 📖 Swagger Documentation


