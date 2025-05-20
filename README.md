# EmotionLink

An emotion-aware chatbot that uses EEG data to provide personalized responses.

## Features

- Real-time emotion detection using EEG devices
- Support for multiple EEG devices (NeuroSky, Muse, Naxon, DIY)
- Modern, responsive UI with dark mode support
- Secure WebSocket connections
- Emotion-based response generation

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- EEG device (optional - can run in demo mode)

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_WS_URL=wss://your-websocket-server.com
```

## Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Deploying to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Configure the following environment variables in Vercel:
   - `NEXT_PUBLIC_WS_URL`
4. Deploy!

### Manual Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## Testing

Run the test suite:
```bash
npm test
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@emotionlink.com or open an issue in the GitHub repository. 