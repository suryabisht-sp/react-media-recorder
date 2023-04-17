import { useState, useRef, useEffect } from "react";

const mimeType = "audio/mpeg";

const AudioRecorder = () => {
  const [permission, setPermission] = useState(false);

  const mediaRecorder = useRef(null);

  const [recordingStatus, setRecordingStatus] = useState("inactive");

  const [stream, setStream] = useState(null);

  const [audio, setAudio] = useState(null);

  const [audioChunks, setAudioChunks] = useState([]);
  const playerRef = useRef(null);

  const getMicrophonePermission = async () => {
    if ("MediaRecorder" in window) {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
        setPermission(true);
        setStream(mediaStream);
      } catch (err) {
        alert(err.message);
      }
    } else {
      alert("The MediaRecorder API is not supported in your browser.");
    }
  };

  const startRecording = async () => {
    setRecordingStatus("recording");
    const media = new MediaRecorder(stream, { type: mimeType });

    mediaRecorder.current = media;

    mediaRecorder.current.start();

    let localAudioChunks = [];

    mediaRecorder.current.ondataavailable = (event) => {
      if (typeof event.data === "undefined") return;
      if (event.data.size === 0) return;
      localAudioChunks.push(event.data);
    };

    setAudioChunks(localAudioChunks);
  };

  const stopRecording = () => {
    setRecordingStatus("inactive");
    mediaRecorder.current.stop();
    mediaRecorder.current.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/mpeg" });
      const audioUrl = URL.createObjectURL(audioBlob);
      const formData = new FormData();
      formData.append("audio-file", audioBlob);
      // console.log("formData", formData)
      setAudio(audioUrl);
      // console.log("audioUrl", audioUrl);
      setAudio(audioUrl)
    };
  };

  const deleteAudio = () => {
    clearInterval(minsd);
    setAudio(null)
    setAudioChunks([])
    setCurrentTime("00:00")
    setMins("00")
  }

  let counter = 60;
  const [mins, setMins] = useState("00")
  const [minsd, setMinsd] = useState()

  const timmerCheck = () => {
    const interval = setInterval(() => {
      counter--;
      setMins(counter)
      if (counter <= 0) {
        console.log('Ding!');
        clearInterval(interval);
      }
    }, 1000);
    setMinsd(interval)
  }

  const audioSr = playerRef?.current


  const getTimeString = (time_in_sec) => {
    const dateObj = new Date(time_in_sec * 1000);
    const minutes = dateObj.getUTCMinutes();
    const seconds = dateObj.getSeconds();
    const timeString = minutes.toString().padStart(2, "0") + ":" + seconds.toString().padStart(2, "0");
    return timeString;
  }

  const [currentTime, setCurrentTime] = useState("00:00")

  const playAudio = () => {
    setShowStart(false)
    if (audioSr.paused === true) {
      audioSr?.play()
    }
  }

  const [showStart, setShowStart] = useState(true)

  const pauseAudio = () => {
    setShowStart(true)
    if (audioSr) {
      audioSr.pause()
    }
  }


  const onLoadedMetadata = () => {
    if (playerRef.current) {
    }
  };

  function myFunction() {
    // var x = document.getElementById("myAudio").duration;
    // document.getElementById("demo").innerHTML = x;
  }


  const handleAudioTimeUpdate = () => {
    const audio = playerRef?.current;
    if (!audio) return;
    let value = (100 / audio?.duration) * audio?.currentTime;
    // setAudioSeekBarValue(Math.round(value));

  };

  useEffect(() => {
    let interval;
    const callCurrentTime = async () => {
      interval = setInterval(() => {
        if (playerRef?.current) {
          const ct = playerRef?.current?.currentTime?.toString();
          setCurrentTime(getTimeString(ct));
        }
      }, 1000);
    };
    callCurrentTime();
    return () => clearInterval(interval);
  }, [playerRef.current]);



  return (
    <div>
      <h2>Audio Recorder</h2>
      <main>
        <div className="audio-controls">
          {!permission ? (
            <button onClick={getMicrophonePermission} type="button">
              Get Microphone
            </button>
          ) : null}
          {permission && recordingStatus === "inactive" && mins <= 0 ? (
            <button onClick={() => { timmerCheck(); startRecording() }} type="button">
              Start Recording
            </button>
          ) : null}
          {recordingStatus === "recording" ? (
            <div>
              <button onClick={stopRecording} type="button">
                Stop Recording
              </button>
              <hr />
              <span id="seconds">00</span>:<span id="tens">{mins}</span>
            </div>
          ) : null}
        </div>
        {
          audio ? (
            <div className="audio-player">
              <audio ref={playerRef} onLoadedMetadata={onLoadedMetadata} id="myAudio" onTimeUpdate={handleAudioTimeUpdate} onEnded={() => {
                setShowStart(true)
              }}>
                <source src={audio} type="audio/mp3" />
              </audio>
              <p id="demo">{currentTime}</p>
              {showStart ? <button onClick={() => { playAudio(); myFunction() }}>Play</button> :
                <button onClick={() => { pauseAudio() }}>Pause</button>}
              {/* <audio src={audio} controls ></audio> */}
              <hr />
              <a download href={audio}>
                Download Recording
              </a>
              <button onClick={() => { deleteAudio() }}>Delete</button>
            </div>
          ) : null
        }
      </main >
    </div >
  );
};

export default AudioRecorder;
