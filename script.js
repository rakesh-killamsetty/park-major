// Helper functions for predictions and recommendations
async function analyzeAudio(audioBlob) {
    return new Promise((resolve) => {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const fileReader = new FileReader();
  
      fileReader.onload = async function() {
        const arrayBuffer = this.result;
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  
        // Get audio data
        const channelData = audioBuffer.getChannelData(0);
        const bufferLength = channelData.length;
        const sampleRate = audioBuffer.sampleRate;
  
        // 1. Analyze tremor (variation in amplitude)
        let tremor = 0;
        let previousAmplitude = Math.abs(channelData[0]);
        for (let i = 1; i < bufferLength; i++) {
          const currentAmplitude = Math.abs(channelData[i]);
          tremor += Math.abs(currentAmplitude - previousAmplitude);
          previousAmplitude = currentAmplitude;
        }
        tremor = (tremor / bufferLength) * 1000; // Normalize tremor value
  
        // 2. Analyze pitch stability
        let pitchStability = 0;
        const samples = 1024;
        for (let i = 0; i < bufferLength - samples; i += samples) {
          const slice = channelData.slice(i, i + samples);
          const sum = slice.reduce((a, b) => a + Math.abs(b), 0);
          pitchStability += sum / samples;
        }
        pitchStability = 1 - (pitchStability / (bufferLength / samples));
  
        // 3. Analyze speech rate
        let crossings = 0;
        for (let i = 1; i < bufferLength; i++) {
          if ((channelData[i] * channelData[i - 1]) < 0) crossings++;
        }
        const speechRate = crossings / (bufferLength / sampleRate);
  
        // 4. Analyze voice breaks
        let voiceBreaks = 0;
        let silenceThreshold = 0.01;
        let inSilence = false;
        for (let i = 0; i < bufferLength; i++) {
          const amplitude = Math.abs(channelData[i]);
          if (!inSilence && amplitude < silenceThreshold) {
            voiceBreaks++;
            inSilence = true;
          } else if (inSilence && amplitude >= silenceThreshold) {
            inSilence = false;
          }
        }
        const voiceBreakRate = voiceBreaks / (bufferLength / sampleRate);
  
        // 5. Calculate final prediction based on multiple parameters
        let tremorScore = Math.min(10, tremor * 50); // Max 10 points for tremor
        let pitchScore = Math.min(10, (1 - pitchStability) * 50); // Max 10 points for pitch instability
        let speechRateScore = Math.min(5, Math.abs(3 - speechRate) * 5); // Max 5 points for speech rate deviation
        let voiceBreakScore = Math.min(5, voiceBreakRate * 10); // Max 5 points for voice breaks
  
        // Calculate total score (max 30 points)
        let prediction;
        if (audioBlob.type === 'audio/webm') {
          // For recorded audio, cap at 20%
          prediction = Math.min(20, 
            (tremorScore + pitchScore + speechRateScore + voiceBreakScore) * (20/30)
          );
        } else {
          // For uploaded audio, use full range
          prediction = Math.min(100, 
            (tremorScore + pitchScore + speechRateScore + voiceBreakScore) * (100/30)
          );
        }
  
        console.log('Audio Analysis Results:', {
          tremorScore: tremorScore.toFixed(2),
          pitchScore: pitchScore.toFixed(2),
          speechRateScore: speechRateScore.toFixed(2),
          voiceBreakScore: voiceBreakScore.toFixed(2),
          tremor: tremor.toFixed(3),
          pitchStability: pitchStability.toFixed(3),
          speechRate: speechRate.toFixed(3),
          voiceBreaks: voiceBreaks,
          voiceBreakRate: voiceBreakRate.toFixed(3),
          prediction: prediction.toFixed(2)
        });
  
        resolve(prediction);
      };
  
      fileReader.readAsArrayBuffer(audioBlob);
    });
  }
  
  function calculateHealthPrediction(data) {
    // Calculate SpO2 impact (lower SpO2 increases risk)
    const spO2Impact = data.spO2 < 95 ? (95 - data.spO2) * 5 : 0;
    
    // Calculate calories impact (lower calories may indicate reduced movement)
    const caloriesImpact = data.caloriesBurnt < 2000 ? (2000 - data.caloriesBurnt) * 0.015 : 0;
    
    return Math.min(100, Math.max(0,
      (spO2Impact + caloriesImpact + data.muscleStiffness * 10 +
        Math.abs(80 - data.heartRate) * 0.5 +
        (data.age > 55 ? 20 : 0) +
        (data.stepCount < 5000 ? 15 : 0) +
        (data.sleep < 6 ? 10 : 0)) / 5
    ));
  }
  
  function getRecommendations(prediction) {
    if (prediction < 30) {
        return [
            "Exercise: 30-60 min of aerobic exercise (walking, cycling, swimming) & strength training 3-4x/week",
            "Diet: Mediterranean diet (rich in antioxidants, omega-3, whole grains, fruits, and vegetables)",
            "Sleep: 7-8 hours of quality sleep, avoid caffeine/alcohol before bed",
            "Stress Management: Yoga, meditation, and social engagement to reduce anxiety",
            "Medical Monitoring: Regular neurologist checkups, track symptoms with a wearable device",
            "Supplements: Consult a doctor about vitamin D, B12, and coenzyme Q10 for neuroprotection",
        "Note: This assessment is for screening purposes only and should not be considered a medical diagnosis.Please consult with a healthcare professional for proper medical evaluation."
        ];
    } else if (prediction < 60) {
        return [
            "Exercise: Physical therapy + daily walking, stretching, balance exercises, tai chi",
            "Diet: High-protein meals timed correctly (protein can interfere with some medications)",
            "Sleep: Improve sleep hygiene, use weighted blankets, and consider melatonin if needed",
            "Medication: Start Parkinson’s meds as prescribed, monitor for side effects",
            "Fall Prevention: Use handrails, non-slip mats, and supportive shoes",
            "Cognitive Health: Engage in brain-stimulating activities (reading, puzzles, learning new skills)",
        "Note: This assessment is for screening purposes only and should not be considered a medical diagnosis.Please consult with a healthcare professional for proper medical evaluation."
        ];
    } else {
        return [
            "Physical Therapy: Daily mobility exercises, assistive devices (walkers, handrails, wheelchair if needed)",
            "Diet: Soft foods (if swallowing is difficult), high-fiber diet to prevent constipation",
            "Sleep Management: Adjustable beds, nighttime movement assistance, melatonin for sleep regulation",
            "Medication Adjustment: Monitor effectiveness of levodopa and adjust doses with a neurologist",
            "Speech Therapy: Work on voice strength and swallowing exercises",
            "Caregiver Support: Daily assistance with movement, hygiene, and emotional support",
        "Note: This assessment is for screening purposes only and should not be considered a medical diagnosis.Please consult with a healthcare professional for proper medical evaluation."
        ];
    }
}



  
  function getSeverityLevel(prediction) {
    if (prediction < 30) return { level: "Low Risk", class: "severity-low" };
    if (prediction < 60) return { level: "Moderate Risk", class: "severity-moderate" };
    return { level: "High Risk", class: "severity-high" };
  }
  
  // Navigation functions
  function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
      section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
  }
  
  function goBack() {
    showSection('home');
  }
  
  function showVoiceAnalysis() {
    showSection('voiceAnalysis');
  }
  
  function showHealthForm() {
    showSection('healthForm');
  }
  
  // Voice recording functionality
  let mediaRecorder = null;
  let audioChunks = [];
  let recordingInterval = null;
  let audioBlob = null;
  
  document.addEventListener('DOMContentLoaded', () => {
    const recordButton = document.getElementById('recordButton');
    const uploadInput = document.getElementById('audioUpload');
    const recordingProgress = document.getElementById('recordingProgress');
    const progressFill = recordingProgress.querySelector('.progress-fill');
    const audioPreview = document.getElementById('audioPreview');
    const audioPlayer = document.getElementById('audioPlayer');
    const submitRecording = document.getElementById('submitRecording');
  
    recordButton.addEventListener('click', async () => {
      if (!mediaRecorder || mediaRecorder.state === 'inactive') {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          mediaRecorder = new MediaRecorder(stream);
          audioChunks = [];
  
          mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
              audioChunks.push(e.data);
            }
          };
  
          mediaRecorder.onstop = () => {
            audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            const audioUrl = URL.createObjectURL(audioBlob);
  
            // Show audio preview
            audioPlayer.src = audioUrl;
            audioPreview.classList.remove('hidden');
          };
  
          mediaRecorder.start();
          recordButton.textContent = 'Stop Recording';
          recordingProgress.classList.remove('hidden');
          audioPreview.classList.add('hidden');
  
          let progress = 0;
          recordingInterval = setInterval(() => {
            progress += 2;
            if (progress >= 100) {
              stopRecording();
            } else {
              progressFill.style.width = `${progress}%`;
            }
          }, 100);
  
        } catch (err) {
          alert('Please allow microphone access to record your voice');
          console.error('Microphone access error:', err);
        }
      } else {
        stopRecording();
      }
    });
  
    submitRecording.addEventListener('click', async () => {
      if (audioBlob) {
        try {
          const prediction = await analyzeAudio(audioBlob);
          showResults('voice', prediction);
        } catch (error) {
          console.error('Error analyzing audio:', error);
          alert('Error analyzing audio. Please try again.');
        }
      }
    });
  
    uploadInput.addEventListener('change', async (e) => {
      if (e.target.files.length > 0) {
        const file = e.target.files[0];
        const audioUrl = URL.createObjectURL(file);
        audioPlayer.src = audioUrl;
        audioPreview.classList.remove('hidden');
        audioBlob = file;
      }
    });
  });
  
  function stopRecording() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      clearInterval(recordingInterval);
  
      const recordButton = document.getElementById('recordButton');
      const recordingProgress = document.getElementById('recordingProgress');
      const progressFill = recordingProgress.querySelector('.progress-fill');
  
      recordButton.textContent = 'Start Recording';
      recordingProgress.classList.add('hidden');
      progressFill.style.width = '0%';
    }
  }
  
  // Health form handling
  document.getElementById('healthAssessmentForm').addEventListener('submit', (e) => {
    e.preventDefault();
  
    const formData = {
      age: parseInt(document.getElementById('age').value),
      heartRate: parseInt(document.getElementById('heartRate').value),
      spO2: parseInt(document.getElementById('spO2').value),
      muscleStiffness: parseFloat(document.getElementById('muscleStiffness').value),
      caloriesBurnt: parseInt(document.getElementById('caloriesBurnt').value),
      sleep: parseFloat(document.getElementById('sleep').value),
      stepCount: parseInt(document.getElementById('stepCount').value),
    };
  
    const prediction = calculateHealthPrediction(formData);
    showResults('health', prediction);
  });
  
  // Range input value display
  document.querySelectorAll('input[type="range"]').forEach(range => {
    const valueDisplay = range.parentElement.querySelector('.range-value');
    range.addEventListener('input', () => {
      valueDisplay.textContent = range.value;
    });
  });
  
  // Results display
  function showResults(type, prediction) {
    console.log('Showing results:', { type, prediction });
    const severity = getSeverityLevel(prediction);
    const recommendations = getRecommendations(prediction);
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  
    document.getElementById('predictionValue').textContent = `${prediction.toFixed(2)}%`;
    document.getElementById('predictionValue').className = severity.class;
    document.getElementById('severityLevel').textContent = severity.level;
    document.getElementById('severityLevel').className = severity.class;
  
    const recommendationsList = document.getElementById('recommendationsList');
    recommendationsList.innerHTML = recommendations
      .map(rec => `<li>${rec}</li>`)
      .join('');
  
    document.getElementById('assessmentDate').textContent = date;
  
    document.querySelectorAll('.section').forEach(section => {
      section.classList.remove('active');
    });
    document.getElementById('results').classList.add('active');
  }
  
  // Report generation
  function downloadReport() {
    const prediction = parseFloat(document.getElementById('predictionValue').textContent);
    const severity = document.getElementById('severityLevel').textContent;
    const recommendations = Array.from(document.getElementById('recommendationsList').children)
      .map(li => li.textContent);
    const date = document.getElementById('assessmentDate').textContent;
  
    const content = `
      Parkinson's Disease Assessment Report
  
      Date: ${date}
  
      Risk Assessment
      ------------------------------
      Prediction: ${prediction}%
      Severity Level: ${severity}
  
      Recommendations
      ------------------------------
      ${recommendations.join('\n')}
  
      Note: This assessment is for screening purposes only and should not be considered as a medical diagnosis. 
      Please consult with a healthcare professional for proper medical evaluation.
    `;
  
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `parkinsons-assessment-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
  
  // Initialize the application
  document.addEventListener('DOMContentLoaded', () => {
    showSection('home');
  });