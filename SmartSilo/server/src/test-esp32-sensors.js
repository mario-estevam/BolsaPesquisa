const Board = require('./esp32-io');

const board = new Board('COM7');

board.onReady(() => {
    setInterval(()=> {
        readAndWriteAnalog(32,18)
        //readAndWriteDigital(19,18)
    },200)
});

function readAndWriteAnalog(pinRead, pinWrite) {
    board.analogRead(pinRead, (value) => {
        console.log(value);
        board.analogWrite(pinWrite,parseInt(value/4));
    });  
}

function readAndWriteDigital(pinRead,pinWrite) {
    board.digitalRead(pinRead, (value) => {
        console.log(value)
        board.digitalWrite(pinWrite,value);
    });

}

