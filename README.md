# EmotionLink

A Next.js application that helps users track and understand their emotions using AI-powered analysis.

## Features

- User authentication with Supabase
- Emotion tracking and analysis
- AI-powered emotion interpretation
- Secure API endpoints
- Real-time updates
- **Live mock EEG data simulation**
- **Emotion trend analytics and insights**
- **Automatic error feedback loop**

## Tech Stack

- Next.js 14
- TypeScript
- Supabase (Auth & Database)
- OpenAI GPT-4
- Tailwind CSS

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/emotionlink.git
cd emotionlink
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file with the following variables:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

The application is configured for deployment on Vercel. Simply connect your GitHub repository to Vercel and set up the environment variables.

## Production & Scaling Best Practices

- **Environment Variables:** Never commit secrets to the repo. Use Vercel's dashboard to securely manage environment variables.
- **Error Monitoring:** Integrate a service like [Sentry](https://sentry.io/welcome/) for real-time error tracking and alerting in production.
- **Scaling:** Vercel auto-scales serverless functions, but monitor usage and upgrade your plan if needed for high traffic.
- **Performance:** Use Next.js image optimization and static generation where possible. Monitor cold starts for API routes.
- **Security:** Always use HTTPS, keep dependencies up to date, and review Supabase policies for data protection.
- **Feedback Loop:** The app includes a built-in error feedback loop for user and developer debugging.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 