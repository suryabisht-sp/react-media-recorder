import "./App.css";
import { useState } from "react";
import VideoRecorder from "./components/VideoRecorder";
import AudioRecorder from "./components/AudioRecorder";

const App = () => {
  let [recordOption, setRecordOption] = useState("");
  const toggleRecordOption = (type) => {
    setRecordOption(type);
  };
  return (
    <div>
      <h1>React Media Recorder</h1>
      <div className="button-flex">
        <button onClick={() => toggleRecordOption("video")}>
          Record Video
        </button>
        <button onClick={() => toggleRecordOption("audio")}>
          Record Audio
        </button>
      </div>
      {recordOption === "audio" && (
        <div>
          <AudioRecorder />
        </div>
      )}

      {recordOption === "video" && (
        <div>
          {" "}
          <VideoRecorder />
        </div>
      )}
    </div>
  );
};
export default App;
