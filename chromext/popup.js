document.addEventListener('DOMContentLoaded', function () {
    const startButton = document.getElementById('startRecording');
    const stopButton = document.getElementById('stopRecording');
    const socket = io('http://localhost:5000'); // Connect to the Socket.IO server
  
    let mediaRecorder;
    let recordedChunks = [];
  
    startButton.addEventListener('click', async () => {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
  
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunks.push(event.data);
  
            // Send the chunk to the server via Socket.IO
            socket.emit('chunk', event.data);
          }
        };
  
        mediaRecorder.onstop = () => {
          const blob = new Blob(recordedChunks, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = 'screen-recording.webm';
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          recordedChunks = [];
        };
  
        mediaRecorder.start();
        startButton.disabled = true;
        stopButton.disabled = false;
      } catch (error) {
        console.error('Error starting recording:', error);
      }
    });
  
    stopButton.addEventListener('click', () => {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        startButton.disabled = false;
        stopButton.disabled = true;
      }
    });
  });
  