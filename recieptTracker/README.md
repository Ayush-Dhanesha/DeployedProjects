# RecieptIO - Intelligent Receipt Management System

![RecieptIO Logo](https://via.placeholder.com/200x80?text=RecieptIO)

RecieptIO is a modern, full-stack web application that revolutionizes receipt management through AI-powered scanning, intelligent data extraction, and comprehensive expense tracking. Built with cutting-edge technologies, it provides seamless receipt processing with advanced OCR capabilities and smart analytics.

## 🚀 Features

### 📱 Core Functionality
- **Smart Receipt Scanning**: Upload PDF receipts with drag-and-drop interface
- **AI-Powered Data Extraction**: Automatically extract merchant details, transaction data, and itemized purchases
- **Intelligent Receipt Summaries**: Generate human-readable summaries with AI insights
- **Real-time Processing**: Live status updates with processing indicators
- **Secure Cloud Storage**: Encrypted file storage with download capabilities

### 💰 Subscription Management
- **Flexible Pricing Plans**: Free, Jackpot, and Pro tiers
- **Feature Entitlements**: Role-based access to premium features
- **Usage Tracking**: Monitor scan limits and feature usage
- **Billing Integration**: Embedded customer portal for subscription management

### 🎨 User Experience
- **Modern UI/UX**: Clean, responsive design with Tailwind CSS
- **Animated Interactions**: Smooth transitions and hover effects
- **Dark Mode Support**: Comprehensive theming system
- **Mobile Responsive**: Optimized for all device sizes

### 🔐 Security & Authentication
- **Multi-Provider Auth**: Powered by Clerk with social logins
- **Protected Routes**: Secure API endpoints and middleware
- **User Management**: Complete profile and session handling

## 🛠️ Tech Stack

### Frontend
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - Latest React with concurrent features
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first styling
- **[Lucide React](https://lucide.dev/)** - Beautiful icons
- **[Radix UI](https://www.radix-ui.com/)** - Accessible component primitives

### Backend & Database
- **[Convex](https://convex.dev/)** - Real-time backend-as-a-service
- **Real-time Subscriptions** - Live data updates
- **File Storage** - Secure document management
- **Schema Validation** - Type-safe database operations

### AI & Processing
- **[Inngest](https://www.inngest.com/)** - Reliable background job processing
- **[Google Gemini](https://ai.google.dev/)** - Advanced AI for document analysis and receipt insights
- **Direct API Integration** - Fault-tolerant AI processing
- **Agent-Kit Integration** - Multi-agent AI workflows

### Authentication & Billing
- **[Clerk](https://clerk.com/)** - Complete authentication solution
- **[Schematic](https://schematichq.com/)** - Feature flags and subscription management
- **JWT Tokens** - Secure API authentication

### Development Tools
- **[ESLint](https://eslint.org/)** - Code linting and formatting
- **[Prettier](https://prettier.io/)** - Code formatting
- **npm-run-all** - Parallel script execution

## 📋 Prerequisites

Before running this project, ensure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **Git** for version control

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd recieptTracker
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory with the following variables:

```env
# Convex Configuration
CONVEX_DEPLOYMENT=your_convex_deployment_url
NEXT_PUBLIC_CONVEX_URL=your_public_convex_url

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_JWT_ISSUER_DOMAIN=your_clerk_jwt_issuer_domain

# Schematic Feature Flags & Billing
NEXT_PUBLIC_SCHEMATIC_KEY=your_schematic_publishable_key
SCHEMATIC_API_KEY=your_schematic_api_key
NEXT_PUBLIC_SCHEMATIC_CUSTOMEER_PORTAL_COMPONENT_ID=your_component_id

# AI Service Keys
GOOGLE_API_KEY=your_google_gemini_api_key
GEMINI_API_KEY=your_google_gemini_api_key

# Inngest
INNGEST_EVENT_KEY=your_inngest_event_key
INNGEST_SIGNING_KEY=your_inngest_signing_key
```

### 4. Database Setup
```bash
# Start Convex development server
npx convex dev

# Push schema to database
npx convex dev --until-success
```

### 5. Authentication Configuration
1. Set up your Clerk application at [clerk.com](https://clerk.com)
2. Configure JWT template for Convex integration
3. Add your domain to Clerk's allowed origins
4. Follow the [Convex-Clerk integration guide](https://docs.convex.dev/auth/clerk)

### 6. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
recieptTracker/
├── app/                          # Next.js App Router
│   ├── globals.css              # Global styles and animations
│   ├── layout.tsx               # Root layout component
│   ├── page.tsx                 # Homepage with features showcase
│   ├── api/inngest/            # Inngest webhook endpoints
│   ├── manage-plan/            # Subscription management
│   └── reciepts/               # Receipt management pages
│       ├── page.tsx            # Receipt list view
│       └── [id]/page.tsx       # Individual receipt details
├── components/                   # Reusable React components
│   ├── ConvexClientProvider.tsx # Database and auth providers
│   ├── Header.tsx              # Navigation header
│   ├── PdfDropZone.tsx         # File upload component
│   ├── RecieptList.tsx         # Receipt listing component
│   ├── schematic/              # Subscription management UI
│   └── ui/                     # Base UI components
├── convex/                      # Backend database functions
│   ├── auth.config.ts          # Authentication configuration
│   ├── reciepts.ts             # Receipt CRUD operations
│   └── schema.ts               # Database schema definition
├── inngest/                     # Background job processing
│   ├── agent.ts                # AI agent orchestration
│   ├── client.ts               # Inngest client setup
│   ├── constants.ts            # Event type definitions
│   └── agents/                 # Specialized AI agents
│       ├── DatabaseAgent.ts    # Database operations agent
│       └── recieptScanningAgent.ts # OCR processing agent
├── actions/                     # Server actions
│   ├── uploadPDF.ts            # File upload handling
│   ├── getFiledownloadUrl.ts   # File access utilities
│   └── getTemporaryaccessToken.ts # Auth token management
├── lib/                         # Utility libraries
│   ├── ConvexClients.ts        # Database client configuration
│   ├── Schematic.ts            # Feature flag client
│   └── utils.ts                # Helper functions
└── public/                      # Static assets
```

## 🔧 Configuration Details

### Convex Database Schema
The application uses a structured schema for receipts:

```typescript
reciepts: {
  userId: string,
  fileName: string,
  fileDisplayName?: string,
  fileId: Id<"_storage">,
  uploadedAt: number,
  size: number,
  status?: "pending" | "processed" | "failed",
  mimeType: string,
  merchantName?: string,
  merchantAddress?: string,
  transactionDate?: number,
  transactionAmount?: number,
  transactionCurrency?: string,
  recieptSummary?: string,
  items: Array<{
    itemName: string,
    quantity: number,
    unitPrice?: number,
    totalprices?: number
  }>
}
```

### AI Agent Workflow
1. **File Upload**: User uploads PDF receipt
2. **Storage**: File stored securely in Convex storage
3. **Processing Trigger**: Inngest job initiated
4. **OCR Extraction**: Receipt Scanning Agent processes document
5. **Data Structuring**: Database Agent saves extracted data
6. **Summary Generation**: AI creates human-readable summary
7. **Status Update**: Real-time notification to user

### AI Analysis Workflow
1. **User Request**: User requests AI insights on receipt
2. **Status Update**: Receipt status updated to "processing"
3. **Primary Path**: Direct API call to Google Gemini for analysis
4. **Fallback Path**: Inngest-based processing if primary fails
5. **Data Analysis**: AI extracts insights, categorizes items, and provides recommendations
6. **Status Completion**: Receipt status updated to "completed"
7. **UI Update**: Real-time display of analysis results

### Feature Entitlements
- **Free Plan**: 50 receipts/month, basic OCR
- **Jackpot Plan**: 500 receipts/month, advanced features, priority support
- **Pro Plan**: Unlimited receipts, custom solutions, dedicated support

## 🚀 Deployment

### Vercel Deployment (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy with automatic CI/CD

### Manual Deployment
```bash
# Build the application
npm run build

# Start production server
npm start
```

### Environment Variables for Production
Ensure all environment variables are properly configured in your deployment platform:
- Database URLs and API keys
- Authentication providers
- AI service credentials
- Feature flag configurations

## 🧪 Testing

```bash
# Run type checking
npm run lint

# Check for TypeScript errors
npx tsc --noEmit
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use Prettier for code formatting
- Write descriptive commit messages
- Test all new features thoroughly
- Update documentation as needed

## 📝 API Documentation

### Key Endpoints
- `POST /api/inngest` - Webhook for background processing
- `POST /api/direct-ai-analysis` - Fault-tolerant AI analysis endpoint
- `POST /api/generate-ai-insights` - AI insights generation
- `GET /api/check-receipt-status` - Receipt status check endpoint
- Convex mutations and queries handled through the client

### Convex Functions
- `generateUploadUrl()` - Create secure upload URL
- `storeReciept()` - Save receipt metadata
- `getRecieptById()` - Fetch receipt details
- `deleteReciept()` - Remove receipt and files
- `updateRecieptwithExtractedData()` - Save processed data

## 🔒 Security

- **Authentication**: Clerk-based multi-provider auth
- **Authorization**: Route-level protection with middleware
- **File Security**: Signed URLs for secure file access
- **Data Validation**: Zod schemas for type safety
- **API Security**: JWT token validation

## 📊 Monitoring & Analytics

- **Error Tracking**: Built-in error handling and logging
- **Performance**: Real-time database with optimized queries
- **Usage Analytics**: Schematic integration for feature tracking
- **Job Monitoring**: Inngest dashboard for background processes

## 🆘 Troubleshooting

### Common Issues

**Authentication Problems**
- Verify Clerk configuration and JWT template
- Check environment variables
- Ensure domain is added to Clerk settings

**File Upload Failures**
- Confirm Convex storage permissions
- Check file size limits
- Verify network connectivity

**AI Processing Issues**
- Validate API keys for Google Gemini API
- Check Inngest webhook configuration
- Monitor background job status
- Try the direct AI analysis endpoint if Inngest is failing

## 📞 Support

For issues and questions:
- Create an issue in the GitHub repository
- Check the documentation for troubleshooting
- Contact the development team

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Convex** for the amazing real-time backend
- **Clerk** for seamless authentication
- **Inngest** for reliable background processing
- **Google Gemini** for powerful AI capabilities
- **Schematic** for feature management
- The amazing open-source community

---

**Built with ❤️ by the RecieptIO Team**

*RecieptIO - Making receipt management intelligent and effortless.*
