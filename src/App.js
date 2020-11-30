import React, { useState, useEffect, useRef } from "react";
import './App.css';

function App() {

  const canvas = useRef(null);
  const ws = useRef(null);

  const [state, setState] = useState({
    mouseDown: false,
    pixelsArray: []
  });

  const [allPixels, setAllPixels] = useState([]);

  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:8000/canvas");

    ws.current.onopen = () => {
      ws.current.send(JSON.stringify({ type: "GET_ALL_PIXELS" }));
    };
    ws.current.onclose = () => console.log("ws connection closed");
    ws.current.onmessage = e => {
      const decodedMessage = JSON.parse(e.data);
      if (decodedMessage.type === "ALL_PIXELS") {
        console.log(decodedMessage.pixelsArray)
        setAllPixels(...decodedMessage.pixelsArray);
      } else if (decodedMessage.type === "NEW_PIXEL") {
        console.log(decodedMessage.pixels)
        setAllPixels([...allPixels, ...decodedMessage.pixels]);
      }
    };
    return () => ws.current.close();
  }, []);


  const canvasMouseMoveHandler = event => {
    if (state.mouseDown) {
      event.persist();
      const clientX = event.clientX;
      const clientY = event.clientY;
      setState(prevState => {
        return {
          ...prevState,
          pixelsArray: [...prevState.pixelsArray, {
            x: clientX,
            y: clientY
          }]
        };
      });
      const context = canvas.current.getContext('2d');
      const imageData = context.createImageData(5, 5);
      const d = imageData.data;
      d[0] = 0;
      d[1] = 0;
      d[2] = 0;
      d[3] = 255;
      context.beginPath();
      if (allPixels !== undefined && allPixels !== null) {
        for(let i = 0; i < allPixels.length; i++){
          context.arc(allPixels[i].x, allPixels[i].y, 2, 0, 50 * Math.PI);
        }
      }

      context.lineWidth = 5;
      context.fillStyle = 'rgb(0,0,0)';
      context.arc(event.clientX, event.clientY, 2, 0, 50 * Math.PI);
      context.stroke();
      console.log(allPixels)
    }
  };

  const mouseDownHandler = event => {
    setState({ ...state, mouseDown: true });
  };

  const mouseUpHandler = event => {
    ws.current.send(JSON.stringify({
      type: "CREATE_PIXEL",
      pixels: state.pixelsArray,
    }));
    setState({ ...state, mouseDown: false, pixelsArray: [] });
  };

  return (
    <div className="App">
      <canvas
        ref={canvas}
        style={{ border: '1px solid black' }}
        width={800}
        height={600}
        onMouseDown={mouseDownHandler}
        onMouseUp={mouseUpHandler}
        onMouseMove={canvasMouseMoveHandler}
      />
    </div>
  );
}

export default App;

