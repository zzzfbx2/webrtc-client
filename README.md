# VOIP Client Using WebRTC

A simple, browser-based VOIP (Voice over IP) client that enables real-time, peer-to-peer audio communication using WebRTC technology.

## Features

- Real-time audio calling between browsers
- Simple room-based connection system
- Mute/unmute functionality
- Clean, responsive UI
- No plugins or external software required

## Prerequisites

- Node.js (v12 or higher)
- npm (v6 or higher)
- Modern web browser with WebRTC support (Chrome, Firefox, Edge, Safari)

## Installation

1. Clone this repository or download the source code
2. Navigate to the server directory:
   ```
   cd voip-client/server
   ```
3. Install dependencies:
   ```
   npm install
   ```

## Running the Application

1. Start the server:
   ```
   node server.js
   ```
2. Open your web browser and navigate to:
   ```
   http://localhost:3000
   ```
3. The server will be running on port 3000 by default

## How to Use

1. Open the application in two different browser windows or on two different devices
2. Enter the same Room ID in both instances
3. Click "Join Call" on both instances
4. Allow microphone access when prompted
5. Once connected, you should be able to hear audio from the other peer
6. Use the "Mute" button to toggle your microphone on/off
7. Click "Hang Up" to end the call

## Technical Details

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js with Express
- Real-time communication: Socket.IO for signaling
- Audio streaming: WebRTC API

## Security Considerations

This is a basic implementation and does not include encryption or authentication mechanisms beyond what WebRTC provides by default. For production use, consider implementing:

- HTTPS for secure signaling
- User authentication
- Additional encryption for sensitive data

## Troubleshooting

- Ensure both peers are using browsers that support WebRTC
- Check that your microphone is working properly
- Make sure to allow microphone access when prompted
- If behind NAT or firewalls, WebRTC might have connectivity issues

## License

MIT 