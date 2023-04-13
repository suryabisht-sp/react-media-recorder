import "./App.css";
import { useState } from "react";
import VideoRecorder from "../src/VideoRecorder";
import AudioRecorder from "../src/AudioRecorder";

const VIDEO_TYPES = ['webm', 'mp4', 'x-matroska', 'ogg'];
const AUDIO_TYPES = ['webm', 'mp3', 'mp4', 'x-matroska', 'ogg', 'wav'];

const VIDEO_CODECS = ['vp9', 'vp9.0', 'vp8', 'vp8.0', 'avc1', 'av1', 'h265', 'h.265', 'h264', 'h.264', 'mpeg', 'theora'];
const AUDIO_CODECS = ['opus', 'vorbis', 'aac', 'mpeg', 'mp4a', 'pcm'];

const testType = (mimeType) => {
    if (MediaRecorder.isTypeSupported(mimeType)) {
        console.log(` ${mimeType}`);
    }
};

console.log();
console.log('Supported Video MIME Types:');

for (let i = 0; i < VIDEO_TYPES.length; ++i) {
    const videoType = VIDEO_TYPES[i];
    for (let j = 0; j < VIDEO_CODECS.length; ++j) {
        const videoCodec = VIDEO_CODECS[j];
        testType(`video/${videoType};codecs=${videoCodec}`);
    }
}

console.log();
console.log('Supported Audio MIME Types:');

for (let i = 0; i < AUDIO_TYPES.length; ++i) {
    const audioType = AUDIO_TYPES[i];
    for (let j = 0; j < AUDIO_CODECS.length; ++j) {
        const audioCodec = AUDIO_CODECS[j];
        testType(`audio/${audioType};codecs=${audioCodec}`);
    }
}

// console.log();
// console.log('Supported Video/Audio MIME Types:');

// for (let i = 0; i < VIDEO_TYPES.length; ++i) {
//     const videoType = VIDEO_TYPES[i];
//     for (let j = 0; j < VIDEO_CODECS.length; ++j) {
//         const videoCodec = VIDEO_CODECS[j];
//         for (let k = 0; k < AUDIO_CODECS.length; ++k) {
//             const audioCodec = AUDIO_CODECS[k];
//             testType(`video/${videoType};codecs=${videoCodec},${audioCodec}`);
//         }
//     }
// }

// console.log();
// console.log('Supported Other MIME Types:');

// testType('video/webm');
// testType('video/x-matroska');
// testType('video/webm;codecs=vp8,vp9,opus');
// testType('video/webm;codecs=h264,vp9,opus');
// testType('audio/webm');

const App = () => {
	let [recordOption, setRecordOption] = useState("video");

	const toggleRecordOption = (type) => {
		return () => {
			setRecordOption(type);
		};
	};

	return (
		<div>
			<h1>React Media Recorder</h1>
			<div className="button-flex">
				<button onClick={toggleRecordOption("video")}>Record Video</button>
				<button onClick={toggleRecordOption("audio")}>Record Audio</button>
			</div>
			<div>
				{recordOption === "video" ? <VideoRecorder /> : <AudioRecorder />}
			</div>
		</div>
	);
};

export default App;
