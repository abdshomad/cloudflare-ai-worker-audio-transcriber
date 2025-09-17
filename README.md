# Cloudflare AI Audio Transcriber

This is a client-side web application that allows users to transcribe audio files using Cloudflare's powerful `@cf/openai/whisper-large-v3-turbo` AI model. It provides a simple, secure, and user-friendly interface for getting text from your audio.

## Features

- **Secure Credential Handling**: Your Cloudflare Account ID and API Token are handled entirely on the client-side and are **never stored or sent to any server** besides Cloudflare's API.
- **Automatic Transcription on Upload**: Transcription begins automatically as soon as you select an audio file, creating a seamless workflow.
- **Large File Support (Up to 200MB)**: Automatically chunks large audio files on the client-side to handle API limits gracefully.
- **Adjustable Chunk Size**: For large files, you can select the chunk size (5, 10, 15, 20, or 24 MB) to optimize the transcription process.
- **Drag & Drop File Upload**: Easily upload audio files by dragging them onto the application window.
- **Real-time Feedback**: Visual loaders and status messages keep you informed during the transcription process, including chunk-by-chunk progress.
- **Error Handling**: Clear error messages are displayed if something goes wrong with the API request or file validation.
- **Copy to Clipboard**: Quickly copy the entire transcription result with a single click.
- **Responsive Design**: The user interface is built with Tailwind CSS and is fully responsive for use on various devices.

## How It Works

1.  **Enter Credentials**: The application first prompts you for your Cloudflare Account ID and an API Token. This is required to authenticate with the Cloudflare AI API.
2.  **Upload Audio**: You can then upload an audio file (e.g., MP3, WAV, M4A). The app supports files up to 200MB. Transcription starts immediately.
3.  **Chunking (for large files)**: For files larger than 5MB, the app splits the audio into smaller chunks directly in your browser. You can adjust the chunk size. The app then sends each chunk sequentially to the Cloudflare AI API endpoint.
4.  **Display Result**: Once all chunks are transcribed, the resulting text is combined and displayed in a clean, readable format.

## Getting Started

To use this application, you will need:

1.  A **Cloudflare Account**.
2.  Your **Cloudflare Account ID**. You can find this on the main dashboard page of your Cloudflare account, on the right-hand sidebar.
3.  A **Cloudflare API Token** with `Account` > `Workers AI` > `Read` permissions.

### Creating the API Token

1.  Log in to your Cloudflare dashboard.
2.  Go to **My Profile** > **API Tokens**.
3.  Click **Create Token**.
4.  Find the **"Edit Cloudflare Workers"** template and click **Use template**.
5.  Under **Permissions**, ensure `Account` > `Workers AI` > `Read` is included.
6.  Continue to summary and create the token.
7.  **Copy the generated API token immediately**, as you will not be able to see it again.

### Usage

1.  Open the application in your web browser.
2.  Enter your Cloudflare Account ID and the API Token you created.
3.  Click "Proceed to Transcriber".
4.  Drag and drop an audio file or click to select one from your device.
5.  The transcription will start automatically. For large files, you can adjust the chunk size before or during the process.
6.  Wait for the process to complete.
7.  View and copy your transcription.

## Technology Stack

- **React**: A JavaScript library for building user interfaces.
- **TypeScript**: A typed superset of JavaScript that compiles to plain JavaScript.
- **Tailwind CSS**: A utility-first CSS framework for rapid UI development.
- **Cloudflare Workers AI**: The backend AI model performing the speech-to-text transcription.

## Disclaimer

This application is a demonstration of how to interact with the Cloudflare AI API on the client side. Your credentials are required for the API calls but are not stored in the application, logged, or sent to any third-party servers. All API communication happens directly between your browser and Cloudflare.