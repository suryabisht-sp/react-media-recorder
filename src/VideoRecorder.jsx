import { useState, useRef, useEffect } from "react";

const mimeType = 'video/webm; codecs="opus,vp8"';

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


	console.log("console", navigator.mediaDevices)
	const getCameraPermission = async () => {
		setRecordedVideo(null);
		//get video and audio permissions and then stream the result media stream to the videoSrc variable
		if ("MediaRecorder" in window) {
			try {
				const videoConstraints = {
					audio: false,
					video: true,
				};
				const audioConstraints = { audio: true };

				// create audio and video streams separately
				const audioStream = await (navigator.mediaDevices || navigator.webkitGetUserMedia ||
					navigator.mozGetUserMedia ||
					navigator.msGetUserMedia).getUserMedia(
						audioConstraints
					);
				const videoStream = frontCam ? await (navigator.mediaDevices || navigator.webkitGetUserMedia ||
					navigator.mozGetUserMedia ||
					navigator.msGetUserMedia).getUserMedia({
						videoConstraints,
						video: {
							facingMode: { exact: "environment" },
						},
					}
					) :
					await navigator.mediaDevices.getUserMedia({
						videoConstraints,
						video: { facingMode: "user" },
					}
					);
				;

				setPermission(true);
				//combine both audio and video streams
				const combinedStream = new MediaStream([
					...videoStream.getVideoTracks(),
					...audioStream.getAudioTracks(),
				]);

				setStream(combinedStream);

				//set videostream to live feed player
				liveVideoFeed.current.srcObject = videoStream;
			} catch (err) {
				alert(err.message);
			}
		} else {
			alert("The MediaRecorder API is not supported in your browser.");
		}
	};

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
		setRecordedVideo(null);
		setVideoChunks([]);
	}

	return (
		<div>
			<h2>Video Recorder</h2>
			<main>
				<div className="video-controls">
					{!permission ? (
						<button onClick={getCameraPermission} type="button">
							Get Camera
						</button>
					) : null}
					{permission && recordingStatus === "inactive" ? (
						<button onClick={startRecording} type="button">
							Start Recording
						</button>
					) : null}
					{recordingStatus === "recording" ? (
						<div>
							<button onClick={stopRecording} type="button">
								Stop Recording
							</button>
							<button onClick={() => { setFrontCam(!frontCam) }}>Flip Camera</button>
						</div>
					) : null}
				</div>
			</main>
			<div className="video-player">
				{!recordedVideo ? (
					<video ref={liveVideoFeed} autoPlay className="live-player"></video>
				) : null}
				{recordedVideo ? (
					<div className="recorded-player">
						<video className="recorded" src={recordedVideo} controls></video>
						<a download href={recordedVideo}>
							Download Recording
						</a>
						<a onClick={() => { clearState() }}>Delete</a>
					</div>
				) : null}
			</div>
		</div>
	);
};

export default VideoRecorder;
