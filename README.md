# ScreenSort 🖼️✨

**Drop photos, AI finds everything, search instantly - your photos organized automatically**

<div align="center">

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Try_Now-blue?style=for-the-badge)](https://courageous-swan-769f25.netlify.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/yourusername/screensort)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**[🌟 Try ScreenSort Live](https://courageous-swan-769f25.netlify.app)**

</div>

---

ScreenSort is an intelligent photo management application that uses advanced AI to automatically analyze, categorize, and make your photos instantly searchable. Simply drag and drop your images, and let AI do the heavy lifting of organization.

## 🌟 Features

### 🤖 **Smart AI Analysis**
- **Gemini 2.0 Flash Integration**: Powered by Google's latest vision model via OpenRouter
- **Object Detection**: Automatically identifies people, animals, vehicles, objects, and more
- **Color Analysis**: Extracts dominant colors and color schemes
- **Text Recognition (OCR)**: Reads and extracts text from images using Tesseract.js
- **Scene Understanding**: Recognizes indoor/outdoor settings, activities, and emotions

### 🔍 **Intelligent Search**
- **Natural Language Search**: Search by typing what you see - "red car", "cruise ship", "ocean"
- **Multi-Modal Search**: Combines text, objects, colors, and AI insights
- **Smart Combinations**: Understands complex queries like "blue dress" or "marine vessel"
- **Instant Results**: Real-time search with smart ranking and relevance scoring

### 📱 **Modern Interface**
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Masonry Grid Layout**: Beautiful Pinterest-style photo grid with zoom controls
- **Drag & Drop Upload**: Simply drag photos to upload with real-time progress
- **Full-Screen Viewer**: Detailed photo viewer with comprehensive metadata

### 🔒 **Secure & Private**
- **Supabase Authentication**: Secure email-based authentication
- **Row Level Security**: Your photos are private and secure
- **Cloud Storage**: Reliable file storage with Supabase Storage
- **Real-time Sync**: Instant updates across all your devices

## 🚀 Live Demo

**Try it now:** [https://courageous-swan-769f25.netlify.app](https://courageous-swan-769f25.netlify.app)

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for responsive styling
- **Lucide React** for beautiful icons

### AI & Computer Vision
- **Gemini 2.0 Flash** (via OpenRouter) for advanced image analysis
- **COCO-SSD** for real-time object detection
- **Tesseract.js** for OCR text extraction
- **TensorFlow.js** for client-side ML

### Backend & Database
- **Supabase** for authentication, database, and storage
- **PostgreSQL** with full-text search capabilities
- **Row Level Security** for data privacy

### Deployment
- **Netlify** for frontend hosting
- **Supabase Cloud** for backend services

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Supabase account** ([supabase.com](https://supabase.com))
- **OpenRouter API key** ([openrouter.ai](https://openrouter.ai)) for AI features

## ⚡ Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/screensort.git
cd screensort
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Update `.env` with your credentials:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenRouter API for Gemini 2.0 Flash
VITE_OPENROUTER_API_KEY=sk-or-your_openrouter_api_key

# Optional: Site information
VITE_SITE_URL=http://localhost:5173
VITE_SITE_NAME=ScreenSort
```

### 4. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Settings → API** and copy your URL and anon key
3. Run the database migrations (they're included in the `supabase/migrations` folder)
4. Set up storage bucket for screenshots

### 5. Get OpenRouter API Key

1. Sign up at [openrouter.ai](https://openrouter.ai)
2. Generate an API key (starts with `sk-or-`)
3. Add it to your `.env` file

### 6. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) to see your app!

## 🔧 Configuration

### Supabase Setup

The application requires these Supabase configurations:

1. **Database Tables**: Screenshots table with AI analysis columns
2. **Storage Bucket**: `screenshots` bucket for file storage
3. **Row Level Security**: Policies for user data isolation
4. **Authentication**: Email/password authentication enabled

All database migrations are included in the `supabase/migrations` folder.

### OpenRouter Configuration

For AI features to work, you need an OpenRouter API key:

1. The free tier includes generous usage limits
2. Supports Gemini 2.0 Flash for advanced image analysis
3. Provides object detection, scene understanding, and text extraction

## 🎯 Usage

### Uploading Photos

1. **Drag & Drop**: Simply drag photos onto the upload area
2. **Click to Browse**: Use the floating upload button
3. **Batch Upload**: Upload multiple photos at once
4. **AI Analysis**: Each photo is automatically analyzed for objects, colors, and text

### Searching Photos

1. **Natural Language**: Type what you're looking for - "red car", "ocean view"
2. **Object Search**: Find specific objects like "boat", "person", "animal"
3. **Color Search**: Search by colors - "blue", "red", "green"
4. **Text Search**: Find photos containing specific text
5. **Combined Search**: Use multiple terms - "blue ocean cruise ship"

### Advanced Features

- **Zoom Controls**: Adjust grid size for better viewing
- **Full-Screen Mode**: Click any photo for detailed view
- **Metadata Panel**: View AI analysis results and extracted text
- **Real-time Search**: Results update as you type

## 🏗️ Project Structure

```
screensort/
├── public/                 # Static assets
├── src/
│   ├── components/        # React components
│   │   ├── Auth/         # Authentication components
│   │   ├── Dashboard/    # Main dashboard and photo grid
│   │   ├── Layout/       # Navigation and layout
│   │   └── Search/       # Search functionality
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Supabase client and types
│   ├── utils/            # AI analysis utilities
│   │   ├── cocoSsdDetection.ts  # Object detection
│   │   ├── geminiVision.ts      # Gemini AI analysis
│   │   ├── imageAnalysis.ts     # Combined analysis
│   │   └── ocr.ts              # Text extraction
│   └── main.tsx          # App entry point
├── supabase/
│   └── migrations/       # Database schema
├── .env.example          # Environment template
└── README.md            # This file
```

## 🔍 AI Analysis Pipeline

ScreenSort uses a sophisticated AI pipeline:

1. **Upload**: Photos are uploaded to Supabase Storage
2. **Object Detection**: COCO-SSD identifies objects and animals
3. **Color Analysis**: Extracts dominant colors and schemes
4. **Text Recognition**: OCR extracts readable text
5. **Gemini Analysis**: Advanced scene understanding and tagging
6. **Smart Tagging**: Combines all analysis into searchable tags
7. **Database Storage**: Metadata saved for instant search

## 🚀 Deployment

### Deploy to Netlify

The project is configured for easy Netlify deployment:

```bash
npm run build
```

Then drag the `dist` folder to Netlify, or connect your GitHub repository.

### Environment Variables for Production

Make sure to set these environment variables in your deployment:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_OPENROUTER_API_KEY`
- `VITE_SITE_URL` (your production URL)

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and test thoroughly
4. **Commit your changes**: `git commit -m 'Add amazing feature'`
5. **Push to the branch**: `git push origin feature/amazing-feature`
6. **Open a Pull Request**

### Development Guidelines

- Use TypeScript for type safety
- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure responsive design works on all devices

## 🐛 Troubleshooting

### Common Issues

**AI Analysis Not Working**
- Check your OpenRouter API key is correct and starts with `sk-or-`
- Verify you have credits in your OpenRouter account
- Check browser console for error messages

**Upload Failures**
- Verify Supabase storage bucket is configured correctly
- Check file size limits (10MB max)
- Ensure supported image formats (JPEG, PNG, GIF, WebP, BMP, TIFF)

**Search Not Finding Results**
- Try different search terms
- Check if photos have been fully analyzed
- Use the debug mode in search to see analysis data

**Authentication Issues**
- Verify Supabase URL and anon key are correct
- Check if email confirmation is required
- Ensure Supabase project is active

### Getting Help

- **Issues**: Open an issue on GitHub
- **Discussions**: Use GitHub Discussions for questions
- **Documentation**: Check the detailed setup guide in `ENVIRONMENT_SETUP.md`

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Supabase** for the amazing backend-as-a-service platform
- **OpenRouter** for providing access to Gemini 2.0 Flash
- **Google** for the powerful Gemini vision model
- **TensorFlow.js** team for COCO-SSD object detection
- **Tesseract.js** for client-side OCR capabilities
- **Tailwind CSS** for the beautiful styling system

## 📊 Stats

- **AI Models**: 3 (Gemini 2.0 Flash, COCO-SSD, Tesseract.js)
- **Supported Formats**: 7 image formats
- **Object Classes**: 80+ detectable objects
- **Search Modes**: 4 (All, Text, Objects, Colors)
- **Responsive Breakpoints**: 6 screen sizes

---

**Made with ❤️ by the ScreenSort team**

*Transform your photo chaos into organized bliss with the power of AI*