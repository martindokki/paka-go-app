# PAKA-Go Admin Panel

A comprehensive web-based admin panel for managing the PAKA-Go parcel delivery service. Built with React Native Web, featuring a responsive design optimized for desktop use.

## 🎨 Design System

### Brand Colors
- **Primary Orange**: `#FF6A00` - Main brand color
- **Black**: `#000000` - Text and accents  
- **White**: `#FFFFFF` - Backgrounds and contrast
- **Supporting Colors**: Success green, warning amber, error red, info blue

### Design Inspiration
- **iOS**: Clean, minimal interface with smooth interactions
- **Instagram**: Modern card-based layouts and visual hierarchy
- **Airbnb**: Intuitive navigation and user-friendly forms
- **Notion**: Organized content structure and typography
- **Linear**: Professional dashboard aesthetics

## 🚀 Features

### 1. 📊 Dashboard Analytics
- **Revenue Metrics**: Total revenue, average order value
- **Order Statistics**: Total, pending, completed, cancelled orders
- **User Analytics**: Customer count, new user growth
- **Driver Metrics**: Active drivers, performance stats
- **Real-time Updates**: Live order tracking and status updates

### 2. 🛒 Order Management
- **Order Overview**: Search, filter, and sort all orders
- **Status Management**: Update order status (pending → delivered)
- **Driver Assignment**: Assign/reassign drivers to orders
- **Payment Integration**: Send M-Pesa STK Push for unpaid orders
- **Order Cancellation**: Cancel orders with reason logging
- **Detailed View**: Customer info, locations, package details

### 3. 🛵 Driver Management
- **Driver Approval**: Review and approve new driver applications
- **Account Management**: Suspend/activate driver accounts
- **Vehicle Assignment**: Assign motorcycles/bicycles to drivers
- **Performance Tracking**: Ratings, delivery count, earnings
- **Live Location**: Track active drivers on map
- **Profile Management**: View driver details and history

### 4. 🚚 Vehicle Management
- **Fleet Overview**: All vehicles with status and assignments
- **Vehicle Registration**: Add new vehicles (plate, type, capacity)
- **Assignment Tracking**: Which driver is using which vehicle
- **Maintenance Status**: Available, assigned, maintenance modes
- **Vehicle Types**: Motorcycle, bicycle, car, van support

### 5. 👥 Customer Management
- **Customer Database**: All registered users with order history
- **Account Actions**: Suspend/delete customer accounts
- **Order Analytics**: Total orders and spending per customer
- **Profile Details**: Contact info, registration date, status
- **Customer Support**: View customer queries and complaints

### 6. 📩 Push Notification System
- **Broadcast Messages**: Send to all users or all drivers
- **Targeted Notifications**: Send to specific user groups
- **Message Templates**: Pre-built templates for common notifications
- **Delivery Tracking**: Monitor notification delivery rates
- **Notification History**: View all sent notifications

### 7. 📬 Customer Support
- **Query Management**: View and respond to customer queries
- **Ticket Assignment**: Assign queries to support agents
- **Priority Levels**: High, medium, low priority classification
- **Response Templates**: Quick replies for common issues
- **Status Tracking**: Open, in progress, resolved states

### 8. ⚙️ Settings & Configuration
- **Pricing Structure**: Base fare, per-km rate, minimum charge
- **Surcharges**: Fragile items, insurance, after-hours, weekend
- **Commission Rates**: Driver payout percentages
- **System Settings**: Maintenance mode toggle
- **Price Calculator**: Preview pricing changes

### 9. 🛡️ Security & Admin Tools
- **Role-Based Access**: Super Admin, Admin, Support Agent roles
- **Activity Logs**: Track all admin actions with timestamps
- **Session Management**: View active sessions, force logout
- **Security Settings**: 2FA, session timeout, login attempts
- **IP Monitoring**: Track login locations and suspicious activity

## 🏗️ Technical Architecture

### Frontend Stack
- **React Native Web**: Cross-platform compatibility
- **TypeScript**: Type safety and better development experience
- **Zustand**: State management for admin data
- **tRPC**: Type-safe API communication
- **Lucide Icons**: Consistent iconography
- **Expo Router**: File-based routing system

### Backend Integration
- **tRPC Routes**: Type-safe API endpoints
- **Zod Validation**: Input validation and type checking
- **Mock Data**: Development-ready sample data
- **Error Handling**: Comprehensive error management

### State Management
```typescript
// Admin Store Structure
interface AdminState {
  // Data
  stats: AdminStats | null;
  drivers: Driver[];
  vehicles: Vehicle[];
  customers: Customer[];
  supportQueries: SupportQuery[];
  settings: AdminSettings | null;
  activityLogs: ActivityLog[];
  
  // Actions
  fetchStats: () => Promise<void>;
  approveDriver: (driverId: string) => Promise<boolean>;
  sendNotification: (type, message, userIds?) => Promise<boolean>;
  updateSettings: (settings) => Promise<boolean>;
  // ... more actions
}
```

## 🔧 Setup Instructions

### 1. Authentication Setup
```typescript
// Ensure admin user type in auth store
const { user } = useAuthStore();
if (user?.userType !== 'admin') {
  router.replace('/auth');
}
```

### 2. Admin Route Protection
```typescript
// Add to app/_layout.tsx
<Stack.Screen name="(admin)" options={{ headerShown: false }} />
```

### 3. Backend Configuration
```typescript
// Add admin routes to tRPC router
admin: createTRPCRouter({
  dashboard: dashboardProcedure,
  drivers: createTRPCRouter({
    getAll: getDriversProcedure,
    approve: approveDriverProcedure,
    // ... more procedures
  }),
  // ... more admin routes
})
```

## 📱 Responsive Design

### Desktop First (Primary)
- **Sidebar Navigation**: Fixed sidebar with collapsible sections
- **Grid Layouts**: Multi-column card grids for data display
- **Modal Dialogs**: Overlay modals for forms and details
- **Keyboard Shortcuts**: Quick actions and navigation

### Tablet Support
- **Adaptive Sidebar**: Collapsible sidebar for smaller screens
- **Touch Interactions**: Optimized for touch input
- **Responsive Grids**: Flexible column layouts

### Mobile Fallback
- **Overlay Sidebar**: Slide-out navigation menu
- **Single Column**: Stacked layouts for narrow screens
- **Touch-Friendly**: Larger touch targets and spacing

## 🔐 Security Features

### Authentication & Authorization
- **JWT Tokens**: Secure session management
- **Role-Based Access**: Different permission levels
- **Session Timeout**: Automatic logout after inactivity
- **2FA Support**: Two-factor authentication option

### Activity Monitoring
- **Audit Logs**: All admin actions logged with timestamps
- **IP Tracking**: Monitor login locations
- **Failed Attempts**: Track and alert on suspicious activity
- **Session Management**: View and revoke active sessions

### Data Protection
- **Input Validation**: Zod schemas for all inputs
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Sanitized user inputs
- **HTTPS Only**: Secure communication

## 📊 Pricing Structure Integration

### Standard Delivery Pricing
```typescript
const pricingConfig = {
  baseFare: 80,           // KES
  perKilometer: 11,       // KES per km
  minimumCharge: 150,     // KES minimum
  
  // Surcharges (percentages)
  fragileItems: 20,       // +20%
  insurance: 20,          // +20%
  afterHours: 10,         // +10% (after 7 PM)
  weekend: 10,            // +10% (Sat/Sun)
  waitTime: 5,            // KES 5 per minute after 5 min
  
  // Driver payout
  commissionRate: 15,     // 15-20% to PAKA-Go
  driverEarnings: 85,     // 80-85% to driver
};
```

### Sample Calculation
```typescript
// 8km delivery with fragile item and insurance
const calculation = {
  baseFare: 80,
  distance: 8 * 11,       // 88 KES
  subtotal: 168,          // 80 + 88
  fragile: 33.60,         // 20% of 168
  insurance: 33.60,       // 20% of 168
  total: 235,             // Final amount
};
```

## 🚀 Deployment Checklist

### Pre-Production
- [ ] Replace mock data with real API calls
- [ ] Set up proper authentication middleware
- [ ] Configure environment variables
- [ ] Set up database connections
- [ ] Implement proper error handling
- [ ] Add loading states and error boundaries

### Security Hardening
- [ ] Enable HTTPS only
- [ ] Set up rate limiting
- [ ] Configure CORS properly
- [ ] Implement CSP headers
- [ ] Set up monitoring and alerting
- [ ] Regular security audits

### Performance Optimization
- [ ] Code splitting and lazy loading
- [ ] Image optimization
- [ ] Bundle size optimization
- [ ] Caching strategies
- [ ] CDN setup for static assets

## 🔄 Future Enhancements

### Advanced Analytics
- **Revenue Forecasting**: Predictive analytics
- **Driver Performance**: Detailed metrics and rankings
- **Customer Insights**: Behavior analysis and segmentation
- **Route Optimization**: AI-powered delivery routing

### Integration Expansions
- **WhatsApp Business**: Customer communication
- **SMS Gateway**: Notification backup
- **Email Marketing**: Customer engagement
- **Third-party Logistics**: Partner integrations

### Mobile Admin App
- **React Native Mobile**: Native mobile admin app
- **Push Notifications**: Real-time admin alerts
- **Offline Capability**: Basic functionality without internet
- **Biometric Authentication**: Fingerprint/Face ID login

## 📞 Support & Maintenance

### Monitoring
- **Error Tracking**: Sentry or similar service
- **Performance Monitoring**: Real user monitoring
- **Uptime Monitoring**: Service availability tracking
- **Log Aggregation**: Centralized logging system

### Backup & Recovery
- **Database Backups**: Automated daily backups
- **Disaster Recovery**: Multi-region deployment
- **Data Retention**: Configurable retention policies
- **Audit Trail**: Immutable activity logs

---

**PAKA-Go Admin Panel** - Empowering efficient delivery service management with modern web technologies and intuitive design.