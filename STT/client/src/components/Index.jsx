import React, { useState, useEffect } from "react";
import { Mic, MicOff } from "@material-ui/icons";
import './index.css';

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const micro = new SpeechRecognition();

micro.continuous = true;
micro.interimResults = true;
micro.lang = "fr-FR";

const Index = () => {
  const [islistening, setIslistening] = useState(false);
  const [note, setNote] = useState(null);

  useEffect(() => {
    handleListen();
  }, [islistening]);

  const handleListen = () => {
    if (islistening) {
      micro.start();
      micro.onend = () => {
        console.log("continue...");
        micro.start();
      };
    } else {
      micro.stop();
      micro.onend = () => {
        console.log("Stopped mic on click");
      };
    }
    micro.onstart = () => {
      console.log("Mics on");
    };

    micro.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join("");
      console.log(transcript);
      setNote(transcript);
      micro.onerror = (event) => {
        console.log(event.error);
      };
    };
  };

  return (
    <>
     <div className="container">
    <div className="content">
      <div className="container">
        <div className="box">
          <p>{note}</p>
          
        </div>
        <div className="record">
          <button onClick={() => setIslistening((prevState) => !prevState)}>
         
            {islistening ? <MicOff /> : <Mic />}
          </button>
          </div>
      </div>
      </div>
      </div>
      
    </>
  );
};

export default Index;
