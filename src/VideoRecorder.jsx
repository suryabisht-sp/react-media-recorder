import { useState, useRef, useEffect } from "react";

const mimeType = 'video/ogg; codecs="opus,vp8"';

const VideoRecorder = () => {
	const [permission, setPermission] = useState(false);
	const mediaRecorder = useRef(null);
	const liveVideoFeed = useRef(null);
	const [recordingStatus, setRecordingStatus] = useState("inactive");
	const [stream, setStream] = useState(null);
	const [recordedVideo, setRecordedVideo] = useState(null);
	const [videoChunks, setVideoChunks] = useState([]);
	const [frontCam, setFrontCam] = useState(true)
	const VideoRef = useRef(null);

	navigator.getUserMedia = navigator.getUserMedia ||
		navigator.webkitGetUserMedia ||
		navigator.mozGetUserMedia ||
		navigator.msGetUserMedia;


	// function detectWebcam(callback) {
	// 	let md = navigator.mediaDevices;
	// 	if (!md || !md.enumerateDevices) return callback(false);
	// 	md.enumerateDevices().then(devices => {
	// 		callback(devices.some(device => 'videoinput' === device.kind));
	// 	})
	// }
	// detectWebcam(function (hasWebcam) {
	// 	console.log('Webcam: ' + (hasWebcam ? 'yes' : 'no'));
	// })

	const getCameraPermission = async () => {
		setRecordedVideo(null);
		if ("MediaRecorder" in window) {
			try {
				const videoConstraints = {
					audio: false,
					video: true,
				}
				const audioConstraints = { audio: true };
				const audioStream = await navigator.getUserMedia(
					audioConstraints
				);
				const videoStream = await frontCam ? (navigator.getUserMedia({
					videoConstraints,
					video: {
						facingMode: { exact: "environment" },
					}
				}))
					:
					(navigator.getUserMedia({
						videoConstraints,
						video: { facingMode: "user" },
					}))
				setPermission(true)
			}
			catch (error) {
				console.log(error)
			}
		}

	}


	useEffect(() => {
		getCameraPermission()
	}, [frontCam])

	const clearState = () => {
		clearInterval(minsd);
		setRecordedVideo(null);
		setVideoChunks([]);
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
				stop_Recording()
				clearInterval(interval);
			}
		}, 1000);
		setMinsd(interval)
	}


	const getCameraStatus = () => {
		navigator.mediaDevices.getUserMedia({ audio: true, video: true })
		setPermission(true)
	}



	function start_video_Recording() {
		setRecordingStatus("recording");
		//To stores the recorded media
		let chunks = [];
		const startBtn = document.getElementById("video_st");
		const endBtn = document.getElementById("video_en");

		// Access the camera and microphone
		navigator.mediaDevices.getUserMedia({
			audio: true, video: {
				facingMode: "user",
			}
		})
			.then((mediaStreamObj) => {
				// Create a new MediaRecorder instance
				const medRec = new MediaRecorder(mediaStreamObj);
				window.mediaStream = mediaStreamObj;
				window.mediaRecorder = medRec;
				medRec.start();
				//when recorded data is available then push into chunkArr array
				medRec.ondataavailable = (e) => {
					chunks.push(e.data);
				};
				//stop the video recording
				medRec.onstop = () => {
					const blobFile = new Blob(chunks, { type: "video/mp4" }); chunks = [];
					const RecUrl = URL.createObjectURL(blobFile);
					setRecordedVideo(RecUrl)
				};
				document.getElementById("vidBox").srcObject = mediaStreamObj;
			});
	}

	function stop_Recording(end, start) {
		setRecordingStatus("inactive")
		//stop all tracks
		window.mediaRecorder.stop();
		window.mediaStream.getTracks().forEach((track) => { track.stop(); });
	}

	const videoRe = VideoRef.current
	const playVideo = () => {
		setShowStart(false)
		if (videoRe.paused === true) {
			videoRe?.play()
		}
	}

	const [showStart, setShowStart] = useState(true)

	const pauseVideo = () => {
		setShowStart(true)
		if (videoRe) {
			videoRe.pause()
		}
	}

	const getTimeString = (time_in_sec) => {
		const dateObj = new Date(time_in_sec * 1000);
		const minutes = dateObj.getUTCMinutes();
		const seconds = dateObj.getSeconds();
		const timeString = minutes.toString().padStart(2, "0") + ":" + seconds.toString().padStart(2, "0");
		return timeString;
	}

	const [currentTime, setCurrentTime] = useState("00:00")

	useEffect(() => {
		let interval;
		const callCurrentTime = async () => {
			interval = setInterval(() => {
				if (VideoRef?.current) {
					const ct = VideoRef?.current?.currentTime?.toString();
					setCurrentTime(getTimeString(ct));
				}
			}, 1000);
		};
		callCurrentTime();
		return () => clearInterval(interval);
	}, [VideoRef.current]);

	return (
		<div>
			<h2>Video-recorder</h2>
			{!permission ? (
				<button onClick={() => { getCameraStatus() }} type="button">
					Get Camera
				</button>
			) : null}
			{permission && !recordedVideo ? <div className="display-none" id="vid-recorder">
				<div className="video-player">
					<video autoPlay id="vidBox" style={{ width: "250px", height: "250px" }}> </video>
				</div>
				{recordingStatus === "inactive" ?
					<button type="button" id="video_st" onClick={() => { start_video_Recording(); timmerCheck() }}>Start</button> :
					<div>
						<button type="button" id="video_en" onClick={() => stop_Recording(document.getElementById('video_en'), document.getElementById('video_st'))}>
							Stop
						</button>
						<button onClick={() => { setFrontCam(!frontCam) }}>Flip Camera</button>
						<hr />
						<span id="seconds">00</span>:<span id="tens">{mins}</span>
					</div>}
			</div> : null}
			<hr />
			{recordedVideo ? (
				<div className="video-player">
					<video ref={VideoRef} style={{ width: "250px", height: "250px" }} className="recorded" src={recordedVideo}></video>
					<p id="demo">{currentTime}</p>
					{showStart ? <button onClick={() => { playVideo() }}>Play</button> :
						<button onClick={() => { pauseVideo() }}>Pause</button>}
					<br />
					<a download href={recordedVideo}>
						Download Recording
					</a>
					<button onClick={() => { clearState() }}>Delete</button>
				</div>
			) : null}
		</div >

	);
};

export default VideoRecorder;
