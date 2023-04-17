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

	navigator.getUserMedia = navigator.getUserMedia ||
		navigator.webkitGetUserMedia ||
		navigator.mozGetUserMedia ||
		navigator.msGetUserMedia;


	function detectWebcam(callback) {
		let md = navigator.mediaDevices;
		if (!md || !md.enumerateDevices) return callback(false);
		md.enumerateDevices().then(devices => {
			callback(devices.some(device => 'videoinput' === device.kind));
		})
	}
	detectWebcam(function (hasWebcam) {
		console.log('Webcam: ' + (hasWebcam ? 'yes' : 'no'));
	})

	function success(stream) {
		// The success function receives an argument which points to the webcam stream
		// document.getElementById('myVideo').src = stream;
	}

	function error() {
		alert("No webcam for you, matey!");
	}
	// const getCameraPermission = async () => {
	// 	setRecordedVideo(null);
	// 	//get video and audio permissions and then stream the result media stream to the videoSrc variable
	// 	if ("MediaRecorder" in window) {
	// 		try {
	// 			const videoConstraints = {
	// 				audio: false,
	// 				video: true,
	// 			};
	// 			const audioConstraints = { audio: true };
	// 			// create audio and video streams separately
	// 			const audioStream = await navigator.getUserMedia(
	// 				audioConstraints, success, error
	// 			);
	// 			const videoStream = frontCam ? await navigator.getUserMedia({
	// 				videoConstraints,
	// 				video: {
	// 					facingMode: { exact: "environment" },
	// 				},
	// 			}, success, error
	// 			) :
	// 				await navigator.getUserMedia({
	// 					videoConstraints,
	// 					video: { facingMode: "user" },
	// 				}, success, error
	// 				);
	// 			;
	// 			setPermission(true);
	// 			//combine both audio and video streams
	// 			const combinedStream = new MediaStream([
	// 				...videoStream.getVideoTracks(),
	// 				...audioStream.getAudioTracks(),
	// 			]);
	// 			setStream(combinedStream);

	// 			//set videostream to live feed player
	// 			liveVideoFeed.current.srcObject = videoStream;
	// 		} catch (err) {
	// 			alert(err.message);
	// 		}
	// 	} else {
	// 		alert("The MediaRecorder API is not supported in your browser.");
	// 	}
	// };



	const getCameraPermission = () => {
		setRecordedVideo(null);


	}




	useEffect(() => {
		getCameraPermission()
	}, [frontCam])

	const startRecording = async () => {
		setRecordingStatus("recording");
		const media = new MediaRecorder(stream, { mimeType });
		mediaRecorder.current = media;
		mediaRecorder.current.start();
		let localVideoChunks = [];
		mediaRecorder.current.ondataavailable = (event) => {
			if (typeof event.data === "undefined") return;
			if (event.data.size === 0) return;
			localVideoChunks.push(event.data);
		};
		setVideoChunks(localVideoChunks);
	};

	const stopRecording = () => {
		setPermission(false);
		setRecordingStatus("inactive");
		mediaRecorder.current.stop();
		mediaRecorder.current.onstop = () => {
			const videoBlob = new Blob(videoChunks, { type: mimeType });
			const videoUrl = URL.createObjectURL(videoBlob);
			setRecordedVideo(videoUrl);
			setVideoChunks([]);
		};
	};



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
				clearInterval(interval);
			}
		}, 1000);
		setMinsd(interval)
	}








	function start_video_Recording() {
		//To stores the recorded media
		let chunks = [];
		const startBtn = document.getElementById("video_st");
		const endBtn = document.getElementById("video_en");

		// Access the camera and microphone
		navigator.mediaDevices.getUserMedia({ audio: true, video: true })
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
					// create video element and store the media which is recorded
					const recMediaFile = document.createElement("video");
					recMediaFile.controls = true;
					const RecUrl = URL.createObjectURL(blobFile);

					//keep the recorded url as source
					recMediaFile.src = RecUrl;
					document.getElementById(`vid-recorder`).append(recMediaFile);
				};
				document.getElementById("vidBox").srcObject = mediaStreamObj;
				startBtn.disabled = true;
				endBtn.disabled = false;
			});
	}
	//--------------------audio---------------------------------------

	function stop_Recording(end, start) {
		//stop all tracks
		window.mediaRecorder.stop();
		window.mediaStream.getTracks().forEach((track) => { track.stop(); });
		//disable the stop button and enable the start button
		end.disabled = true;
		start.disabled = false;
	}



	return (
		<div>
			<h2>Video-recorder</h2>
			<div className="display-none" id="vid-recorder">
				<div className="video-player">
					<video autoPlay id="vidBox"> </video>
				</div>
				<button type="button" id="video_st" onClick={() => start_video_Recording()}>Start</button>
				<button type="button" id="video_en" onClick={() => stop_Recording(document.getElementById('video_en'), document.getElementById('video_st'))}>
					Stop
				</button>
			</div>
			<br />
			<hr />
		</div >


		// <div>
		// 	<h2>Video Recorder</h2>
		// 	<main>
		// 		<div className="video-controls">
		// 			{!permission ? (
		// 				<button onClick={getCameraPermission} type="button">
		// 					Get Camera
		// 				</button>
		// 			) : null}
		// 			{permission && recordingStatus === "inactive" ? (
		// 				<button onClick={startRecording} type="button">
		// 					Start Recording
		// 				</button>
		// 			) : null}
		// 			{recordingStatus === "recording" ? (
		// 				<div>
		// 					<button onClick={stopRecording} type="button">
		// 						Stop Recording
		// 					</button>
		// 					<button onClick={() => { setFrontCam(!frontCam) }}>Flip Camera</button>
		// 					<span id="seconds">00</span>:<span id="tens">{mins}</span>
		// 				</div>
		// 			) : null}
		// 		</div>
		// 	</main>
		// 	<div className="video-player">
		// 		{!recordedVideo ? (
		// 			<video ref={liveVideoFeed} autoPlay className="live-player"></video>
		// 		) : null}
		// 		{recordedVideo ? (
		// 			<div className="recorded-player">
		// 				<video className="recorded" src={recordedVideo} controls></video>
		// 				<a download href={recordedVideo}>
		// 					Download Recording
		// 				</a>
		// 				<a onClick={() => { clearState() }}>Delete</a>
		// 			</div>
		// 		) : null}
		// 	</div>
		// </div>
	);
};

export default VideoRecorder;
