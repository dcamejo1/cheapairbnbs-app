# Notification Feature Setup Guide

## Overview

The notification feature allows visitors to subscribe to email notifications when new affordable destinations are added to CheapAirbnbs. This feature includes:

- **Bell icon button** in the header
- **Modal popup** for email collection
- **MongoDB integration** for storing subscriptions
- **Input validation** and error handling
- **Success/failure feedback** to users

## Setup Instructions

### 1. MongoDB Database Setup

Make sure you have a MongoDB database ready. You can use:

- Local MongoDB installation
- MongoDB Atlas (cloud)
- Any MongoDB hosting service

### 2. Environment Configuration

Create a `.env` file in your project root (or add to your existing `.env` file):

```bash
# MongoDB Configuration
MONGODB_URI=your_mongodb_connection_string_here
```

**Examples:**

```bash
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/cheapairbnbs

# MongoDB Atlas (cloud)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cheapairbnbs?retryWrites=true&w=majority

# MongoDB with authentication
MONGODB_URI=mongodb://username:password@localhost:27017/cheapairbnbs
```

### 3. Database Schema

The notification system will automatically create a `subscriptions` collection with the following schema:

```javascript
{
  email: String,        // User's email (required, unique)
  status: String,       // 'active', 'inactive', or 'pending' (default: 'active')
  reason: String,       // Subscription reason (default: 'cheapairbnbs')
  createdAt: Date       // Timestamp when subscription was created
}
```

### 4. Files Added

The following files have been added to your project:

- `server/api/notifications/subscribe.post.ts` - API endpoint for handling subscriptions
- `components/NotificationBell.vue` - Bell icon component with modal
- `NOTIFICATION_SETUP.md` - This setup guide
- `env.example` - Environment variables example

### 5. Files Modified

- `nuxt.config.ts` - Added runtime configuration for MongoDB URI
- `pages/index.vue` - Added NotificationBell component to header

## How It Works

1. **User clicks bell icon** in the header
2. **Modal opens** with email subscription form
3. **User enters email** and clicks "Get Notified"
4. **Frontend sends POST request** to `/api/notifications/subscribe`
5. **Backend validates email** and checks for duplicates
6. **MongoDB document created** with subscription data
7. **User receives confirmation** message

## Features

### Frontend Features:

- ✅ Beautiful modal design matching your app's aesthetic
- ✅ Email validation
- ✅ Loading states and error handling
- ✅ Success feedback
- ✅ Responsive design
- ✅ Keyboard shortcuts (ESC to close)
- ✅ Duplicate subscription handling

### Backend Features:

- ✅ Email validation with regex
- ✅ Duplicate email detection
- ✅ Mongoose schema validation
- ✅ Error handling and meaningful responses
- ✅ Automatic database connection management

## Testing

### 1. Start your development server:

```bash
npm run dev
```

### 2. Test the notification feature:

1. Open your app in the browser
2. Click the bell icon in the header
3. Enter an email address
4. Click "Get Notified"
5. Check your MongoDB database for the new subscription

### 3. Test duplicate handling:

- Try subscribing with the same email twice
- Should show "already subscribed" message

## Customization

### Styling

The component uses your existing Tailwind classes and `airbnb-rausch` color scheme. You can customize the modal appearance in `components/NotificationBell.vue`.

### Notification Dot

To show a notification dot on the bell icon (for new features), set `hasNewFeatures.value = true` in the component.

### Status Management

You can extend the system to manage subscription statuses:

- `active` - Receiving notifications
- `inactive` - Paused notifications
- `pending` - Awaiting confirmation

## Security Notes

- The API endpoint validates email format
- MongoDB connection string is server-side only
- No sensitive data is exposed to the frontend
- Duplicate subscriptions are handled gracefully

## Troubleshooting

### "Database configuration missing" error:

- Check that `MONGODB_URI` is set in your `.env` file
- Restart your development server after adding environment variables

### Modal not appearing:

- Check browser console for JavaScript errors
- Ensure Tailwind CSS is properly configured

### Styling issues:

- Verify that the `airbnb-rausch` color classes are defined in your CSS
- Check if Tailwind's JIT mode is enabled

## Next Steps

To complete your notification system, you'll want to:

1. Set up email sending functionality (e.g., with SendGrid, Mailgun, etc.)
2. Create an admin interface to manage subscriptions
3. Implement unsubscribe functionality
4. Add email templates for notifications

The database structure is ready for these enhancements!
