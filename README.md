# Meteor Madness 🚀

A professional Near Earth Objects monitoring system with AI analysis and real-time threat assessment, built with Next.js and powered by NASA APIs.

## Features

- **Real-time NEO Monitoring**: Track asteroids and comets using NASA JPL APIs
- **AI Risk Assessment**: Advanced threat analysis using Gemini AI
- **Professional Dashboard**: Beautiful dark theme with real-time data visualization
- **Responsive Design**: Optimized for desktop and mobile devices
- **Vercel Ready**: Optimized for deployment on Vercel platform

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with custom NASA theme
- **Animations**: Framer Motion
- **APIs**: NASA NEO API, JPL Small-Body Database, Gemini AI
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- NASA API key from [api.nasa.gov](https://api.nasa.gov/)
- (Optional) Gemini AI API key from [ai.google.dev](https://ai.google.dev/)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Yatishgrandhe/meteormadness.git
cd meteormadness
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env.local
```

4. Add your API keys to `.env.local`:
```env
NEXT_PUBLIC_NASA_API_KEY=your_nasa_api_key_here
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment on Vercel

### Method 1: Deploy from GitHub

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_NASA_API_KEY`
   - `NEXT_PUBLIC_GEMINI_API_KEY` (optional)
4. Deploy automatically

### Method 2: Deploy with Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Follow the prompts and add environment variables

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_NASA_API_KEY` | NASA API key for NEO data | Yes |
| `NEXT_PUBLIC_GEMINI_API_KEY` | Gemini AI API key for analysis | No |

## API Endpoints

- `/api/neo` - Fetches Near Earth Objects data
- `/api/comets` - Fetches comet data from JPL

## Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API routes
│   ├── dashboard/      # Dashboard page
│   ├── neo/           # NEO monitoring page
│   └── globals.css    # Global styles
├── components/         # React components
└── lib/               # Utility functions and API clients
    └── api/           # API integration
```

## Features

### Dashboard
- Real-time object monitoring statistics
- Recent activity feed with actual NEO data
- AI-powered risk assessment
- Professional NASA-themed design

### NEO Monitoring
- Comprehensive asteroid and comet data
- Advanced filtering and sorting
- Real-time threat assessment
- Detailed object information

### Data Sources
- **Asteroids**: NASA NEO API (api.nasa.gov)
- **Comets**: JPL Small-Body Database (ssd-api.jpl.nasa.gov)
- **AI Analysis**: Gemini AI (ai.google.dev)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- NASA for providing free access to NEO data
- JPL for comprehensive small-body database
- Google for Gemini AI capabilities
- Vercel for hosting platform

## Support

For issues and questions, please open an issue on GitHub or contact the maintainer.

---

Built with ❤️ for space exploration and planetary defense