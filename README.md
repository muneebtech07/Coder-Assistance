
# Coder-Assistance
A modern, feature-rich coding assistant that helps developers with code-related tasks, formatting, and analysis.
=======
# Professional Coding Assistant

A modern, feature-rich coding assistant that helps developers with code-related tasks, formatting, and analysis.

## Features

- **Interactive Chat Interface**
  - Real-time coding assistance
  - Syntax-highlighted code snippets
  - Message history with search functionality
  - Data masking for sensitive information

- **Code Formatting**
  - Support for multiple programming languages
  - Customizable formatting options
  - Real-time preview
  - Copy formatted code to clipboard

- **Text Analysis Tools**
  - XML/JSON structure analysis
  - Code difference comparison
  - Data compression analysis
  - Message type detection

- **Security Features**
  - Automatic masking of sensitive data:
    - IP addresses
    - Transaction IDs
    - Email addresses
    - Phone numbers
    - Hostnames
  - Secure authentication
  - Dark/Light theme support

## Tech Stack

- **Frontend**
  - React 18
  - TypeScript
  - Tailwind CSS
  - Monaco Editor
  - Prism.js for syntax highlighting

- **Backend**
  - Node.js with Express
  - Gemini AI API integration
  - Supabase for data storage
  - WebSocket for real-time updates

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd professional-coding-assistant
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

   For running both frontend and backend:
   ```bash
   npm run dev:all
   ```

## Usage

1. **Authentication**
   - Log in using your credentials
   - Preferences are automatically synced

2. **Chat Interface**
   - Ask coding questions
   - Share code snippets
   - View message history

3. **Code Formatting**
   - Select language
   - Paste code
   - Apply formatting
   - Copy results

4. **Text Analysis**
   - Compare text differences
   - Analyze data structure
   - Check compression ratios

## Development

### Project Structure

```
src/
├── components/    # React components
├── services/     # API and external services
├── types/        # TypeScript definitions
├── utils/        # Utility functions
└── data/         # Static data and configs
```

### Available Scripts

- `npm run dev` - Start frontend development server
- `npm run start:backend` - Start backend server
- `npm run dev:all` - Start both frontend and backend
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Gemini AI](https://ai.google.dev/) for AI capabilities
- [Supabase](https://supabase.com/) for backend services
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) for code editing
- [Tailwind CSS](https://tailwindcss.com/) for styling
