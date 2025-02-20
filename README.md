# Doctor Appointment Booking System

A comprehensive doctor appointment scheduling web application that provides flexible, reliable, and location-aware medical booking with advanced scheduling capabilities for Indian healthcare providers.

## System Architecture

![Architecture Diagram](https://github.com/devXpraAddy/Ctrl_Alt_Defeat/blob/e294509b0479bf42d63d10303822351bdb963ac3/ArchitectureDiagram.png)

## Features

- 🔐 **Advanced Authentication**
  - Email-based authentication
  - Role-based access control (Patient/Doctor)
  - Secure session management

- 🗺️ **Location-Based Doctor Search**
  - Interactive map interface
  - Real-time distance calculation
  - Filter doctors by specialty
  - Advanced search capabilities

- 📅 **Appointment Management**
  - Real-time availability checking
  - Instant appointment confirmation
  - Automatic conflict detection
  - Calendar integration

- 📱 **Responsive Design**
  - Cross-device compatibility
  - Modern, professional UI
  - Intuitive user experience
  - Accessible interface

- 📧 **Multi-Channel Notifications**
  - Email confirmations
  - Appointment reminders
  - Status updates
  - Booking confirmations

## Tech Stack

- **Frontend**
  - React with TypeScript
  - TanStack Query for state management
  - Tailwind CSS for styling
  - ShadcnUI components
  - Google Maps integration

- **Backend**
  - Node.js with Express
  - PostgreSQL database
  - Drizzle ORM
  - Passport.js authentication

- **APIs & Services**
  - Mailgun for email notifications
  - Google Maps API for location services

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/devXpraAddy/Ctrl_Alt_Defeat.git
   cd Ctrl_Alt_Defeat
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file with the following:
   ```
   DATABASE_URL=your_postgresql_url
   SESSION_SECRET=your_session_secret
   MAILGUN_API_KEY=your_mailgun_api_key
   MAILGUN_DOMAIN=your_mailgun_domain
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
.
├── client/                # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utility functions and configs
│   │   └── pages/        # Application pages
├── server/               # Backend Express server
│   ├── auth.ts          # Authentication setup
│   ├── notifications.ts  # Email notification system
│   ├── routes.ts        # API routes
│   └── storage.ts       # Database operations
└── shared/              # Shared TypeScript types
    └── schema.ts        # Database schema
```

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [ShadcnUI](https://ui.shadcn.com/) for the beautiful UI components
- [TanStack Query](https://tanstack.com/query) for robust data fetching
- [Google Maps Platform](https://developers.google.com/maps) for location services
- [Mailgun](https://www.mailgun.com/) for reliable email delivery
