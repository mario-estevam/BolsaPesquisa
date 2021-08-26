const Arduino = require('firmata');
const Controller = require('node-pid-controller');
const Esp32 = require('./esp32-io');

module.exports = class Board {
  /**
   * A Class to handle with the board, getting data and controlling output  
   * @param {*} boardPath The path for the board like 'COM2', 'COM3' and '/dev/ttyusb0'
   * @param {*} config The start configuration of the board
   */

  

  constructor(boardPath, { setpoint, pins, pidConsts }) {
    this.setpoint = setpoint || 30;
    this.errorValue = null;
    this.output = 0; // save the output in the scale of 0 to 255
    this.openLoopTimeLapse = null;
    this.onOffTimeLapse = null;
    this.pins = pins || [32, 33, 34, 35]; // pinos analogicos
    this.pidTimeLapse = null;
    this.openLoopVoltage = 0;
    this.therms = [];
    this.isControlling = false;
    this.board = new Esp32(boardPath);
    this.pidConsts = pidConsts || {
      pb: 30, // proportional band width
      ti: 1.27, // integral time
      td: 6, // derivativeTime
    };
  }


  /**
   * Execute a function when the board is ready
   * @param {function} callback The function to be executed
   */
  onReady(callback) {
    this.board.onReady(callback);
  }


 
  /**
   * Returns the voltage value related to the PWM board output
   * @returns {Number} Voltagem
   */
  getVoltage() { 
    return this.scaleOutput(this.output, {
      from: [0, 1023], // modificado [0,255]
      to: [0, 3.3], // modifcado [0, 5]
    });
  }
  
  /**
   * Convert the raw value read by the board to Celsius
   * @param {number} rawADC The raw that is between 0 and 1023 
   * @returns {number} Temperature converted to celsius
   */
  toCelsius(rawADC) {
    // Parâmetros do termistor
    const beta = 3600.0;
    const  r0 = 10000.0;
    const  t0 = 273.0 + 25.0;
    const  rx = r0 * Math.exp(-beta/t0);
     
    // Parâmetros do circuito
    const  vcc = 3.3;
    const  R = 10000.0;
     

   
    // Determina a resistência do termistor
    let v = (vcc*rawADC)/(1024); //2 elevado a resolução
    let rt = (vcc*R)/v - R;
   
    // Calcula a temperatura
   let t = beta / Math.log(rt/rx);
   let temp = 0;
   temp = t-273.0;

    //let temp = Math.log(10240000 / rawADC - 10000);
    //temp = 1 / (0.001129148 + 0.000234125 * temp + 0.0000000876741 * temp ** 3);
    //temp = temp - 273.15; // Kelvin para Celsius
    return temp;
  }
  /**
   * Return the value in another scale 
   * @param {number} value The entry value to make the conversion 
   * @param {Object} scaleObject A object that specifies how the conversion works
   * @returns {number} The value converted
   */
  scaleOutput(value, {from, to}) { // converter um valor qualquer pra outra escala
    let scale = (to[1] - to[0]) / (from[1] - from[0]);
    let capped = Math.min(from[1], Math.max(from[0], value)) - from[0];
    //console.log(capped * scale + to[0]); // verificar valores do calculo
    return capped * scale + to[0];
  }
  /**
   * Returns the average temperature of the board sensors 
   * @returns {number} Average temperature in °C
   */
  getTemp() {
     const averageTemp = this.therms.reduce((acc, cur) => acc + this.toCelsius(cur), 0) / this.therms.length;
     return averageTemp;
    
  }
  
  /**-
   * Update the current setpoint to a new setpoint
   * @param {number} newSetPoint 
   */
  updateSetpoint(newSetPoint) {
    this.setpoint = Number(newSetPoint);
  }
  /**
   * 
   * @param {} newPidConsts 
   */
  updatePidConsts(newPidConsts) {
    this.pidConsts = newPidConsts;
  }
  /**
   * Update the current voltage related to the open loop control
   * @param {number} voltage 
   */
  updateOpenLoopVoltage(voltage) {
    this.openLoopVoltage = voltage;
    clearInterval(this.openLoopTimeLapse);
    this.startControlling('Open loop');
  }
  /**
   * Update the current pins to new pins 
   * @param {number[]} pins the new pins to be updated
   */
  updatePins(pins) {
   
    const filterPin = pins.filter(pin =>(pin!=='0'))
    this.pins = filterPin;
    console.log('pins: ',this.pins)
    this.therms = [];
    this.startThermsReading();
  }
  /**
   * Start reading the pins that are specified in this.pins array
   */
   startThermsReading() {
     setInterval(() => {
      for (let i = 0; i < this.pins.length; i++) {     
        this.board.analogRead(this.pins[i], (value) => {
          this.therms.push(value);
        });
      }
      }, 100);
 }


  /**
   * Stops all the output controlling of the board 
   */
  stopControlling() {
    this.isControlling = false;
    clearInterval(this.openLoopTimeLapse);
    clearInterval(this.onOffTimeLapse);
    clearInterval(this.pidTimeLapse);
  }
  /**
   * Start controlling the output of the board with a control mode
   * @param {'PID' | 'ON/OFF' | 'Open loop'} mode the control mode for the output 
   */
  startControlling(mode) {
    this.board.pinMode(18, this.board.firmata.MODES.PWM);
    switch (mode) {
      case 'PID':
        this.isControlling = true;
        this.pidTimeLapse = setInterval(() => this.controlViaPid(), 100);
        break;
      case 'ON/OFF':
        this.isControlling = true;
        this.onOffTimeLapse = setInterval(() => this.controlViaOnOff(), 100);
        break;
      case 'Open loop':
        console.log(this.openLoopVoltage)
        this.output = this.scaleOutput(this.openLoopVoltage, {
          from: [0, 3.3], // modificado [0, 5]
          to: [0, 1023], // modificado [0, 255]
        });
        this.openLoopTimeLapse = setInterval(() => {
          this.board.pwmWrite(19, 0, 25, 10, this.output);// modificado [digitalWrite - analogWrite] // 18 seria para validar, onde seria o pino de saida (fixo) // esse this.output n ta me passando um valor
       
        }, 100);
        console.log(this.output)
        break;
    }
  }
  /**
   * Control the output via ON/OFF
   */
  controlViaOnOff() {
    this.output = this.getTemp() < this.setpoint ? 255 : 0;
    this.board.pwmWrite(18, this.output);
  }
  /**
   * Control the output via proportional integral derivative (PID)
   */
  controlViaPid() {
    const { pb, ti, td } = this.pidConsts;
    const KP = 1 / (pb / 100); // proportionalBand
    const KI = KP / ti; // integrativeTime
    const KD = KP * td; // derivativeTime
    const H = 0.1;

    const pidController = new Controller(KP, KI, KD, H);
    const temperature = this.getTemp();
    this.errorValue = this.getTemp() - this.setpoint;

    pidController.setTarget(this.setpoint);
    this.output = pidController.update(temperature);

    if (this.output < 2 && this.setpoint > 30) {
      this.output *= 1.05;
    }
    if (this.output > 255) {
      this.output = 255;
    } else if (this.output < 0) {
      this.output = 0;
    }
    this.board.pwmWrite(18, this.output);
  }
};