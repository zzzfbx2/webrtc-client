// Initialize socket connection
const socket = io();

// WebRTC variables
let peerConnection;
let localStream;
let room;
let isMuted = false;

// STUN servers configuration for ICE
const configuration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ]
};

// DOM elements
const callButton = document.getElementById('callButton');
const muteButton = document.getElementById('muteButton');
const hangUpButton = document.getElementById('hangUpButton');
const roomInput = document.getElementById('room');
const homeDiv = document.getElementById('home');
const callDiv = document.getElementById('call');
const roomDisplay = document.getElementById('roomDisplay');
const callStatus = document.getElementById('callStatus');

// Event listeners
callButton.addEventListener('click', startCall);
muteButton.addEventListener('click', toggleMute);
hangUpButton.addEventListener('click', hangUp);

// Socket event listeners
socket.on('offer', handleOffer);
socket.on('answer', handleAnswer);
socket.on('ice-candidate', handleIceCandidate);
socket.on('user-joined', handleUserJoined);

/**
 * Start a call by joining a room and setting up WebRTC
 */
async function startCall() {
    room = roomInput.value.trim();
    if (!room) {
        alert('Please enter a room ID');
        return;
    }

    // Update UI
    homeDiv.style.display = 'none';
    callDiv.style.display = 'block';
    roomDisplay.textContent = room;
    callStatus.textContent = 'Connecting...';

    // Join the room
    socket.emit('join', room);

    try {
        // Get user's audio stream
        localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Create peer connection
        createPeerConnection();
        
        // Add local stream to peer connection
        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream);
        });
        
    } catch (error) {
        console.error('Error accessing media devices:', error);
        callStatus.textContent = 'Error: Could not access microphone';
        callStatus.style.color = '#e74c3c';
    }
}

/**
 * Create a new RTCPeerConnection
 */
function createPeerConnection() {
    peerConnection = new RTCPeerConnection(configuration);
    
    // Set up ICE candidate handling
    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            socket.emit('ice-candidate', {
                room: room,
                candidate: event.candidate
            });
        }
    };
    
    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
        if (peerConnection.connectionState === 'connected') {
            callStatus.textContent = 'Connected';
            callStatus.style.color = '#27ae60';
        } else if (peerConnection.connectionState === 'disconnected' || 
                   peerConnection.connectionState === 'failed') {
            callStatus.textContent = 'Disconnected';
            callStatus.style.color = '#e74c3c';
        }
    };
    
    // Handle incoming audio stream
    peerConnection.ontrack = event => {
        const remoteAudio = document.createElement('audio');
        remoteAudio.srcObject = event.streams[0];
        remoteAudio.autoplay = true;
        document.body.appendChild(remoteAudio);
    };
}

/**
 * Handle an incoming offer from another peer
 */
async function handleOffer(data) {
    if (!peerConnection) {
        try {
            // Get user's audio stream if not already done
            if (!localStream) {
                localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            }
            
            // Create peer connection
            createPeerConnection();
            
            // Add local stream to peer connection
            localStream.getTracks().forEach(track => {
                peerConnection.addTrack(track, localStream);
            });
            
        } catch (error) {
            console.error('Error accessing media devices:', error);
            callStatus.textContent = 'Error: Could not access microphone';
            callStatus.style.color = '#e74c3c';
            return;
        }
    }
    
    // Set remote description from offer
    await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
    
    // Create answer
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    
    // Send answer to the other peer
    socket.emit('answer', {
        room: room,
        answer: answer
    });
}

/**
 * Handle an incoming answer from another peer
 */
async function handleAnswer(data) {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
}

/**
 * Handle an incoming ICE candidate from another peer
 */
async function handleIceCandidate(data) {
    try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
    } catch (error) {
        console.error('Error adding ICE candidate:', error);
    }
}

/**
 * Handle when another user joins the room
 */
async function handleUserJoined(data) {
    callStatus.textContent = 'User joined, establishing connection...';
    
    try {
        // Create and send an offer
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        
        socket.emit('offer', {
            room: room,
            offer: offer
        });
    } catch (error) {
        console.error('Error creating offer:', error);
    }
}

/**
 * Toggle microphone mute state
 */
function toggleMute() {
    if (!localStream) return;
    
    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
        isMuted = !isMuted;
        audioTrack.enabled = !isMuted;
        muteButton.querySelector('.btn-text').textContent = isMuted ? 'Unmute' : 'Mute';
        muteButton.style.backgroundColor = isMuted ? '#f39c12' : '#ecf0f1';
    }
}

/**
 * End the call and clean up resources
 */
function hangUp() {
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }
    
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }
    
    // Reset UI
    callDiv.style.display = 'none';
    homeDiv.style.display = 'block';
    roomInput.value = '';
    callStatus.textContent = 'Connecting...';
    callStatus.style.color = 'inherit';
    muteButton.querySelector('.btn-text').textContent = 'Mute';
    muteButton.style.backgroundColor = '#ecf0f1';
    isMuted = false;
} 