/*
  FirmataExt.h - Firmata library
  Copyright (C) 2006-2008 Hans-Christoph Steiner.  All rights reserved.
  Copyright (C) 2010-2011 Paul Stoffregen.  All rights reserved.
  Copyright (C) 2009 Shigeru Kobayashi.  All rights reserved.
  Copyright (C) 2013 Norbert Truchsess. All rights reserved.
  Copyright (C) 2009-2015 Jeff Hoefs.  All rights reserved.

  This library is free software; you can redistribute it and/or
  modify it under the terms of the GNU Lesser General Public
  License as published by the Free Software Foundation; either
  version 2.1 of the License, or (at your option) any later version.

  See file LICENSE.txt for further informations on licensing terms.

  Last updated by Jeff Hoefs: November 15th, 2015
*/

#include <ConfigurableFirmata.h>
#include "FirmataExt.h"
#include <string>
#include <vector>
#include <sstream>
#include <iterator>
using namespace std;


FirmataExt *FirmataExtInstance;

void handleSetPinModeCallback(byte pin, int mode)
{
  if (!FirmataExtInstance->handlePinMode(pin, mode) && mode != PIN_MODE_IGNORE) {
    Firmata.sendString("Unknown pin mode"); // TODO: put error msgs in EEPROM
  }
}

void handleSysexCallback(byte command, byte argc, byte* argv)
{
  if (!FirmataExtInstance->handleSysex(command, argc, argv)) {
    Firmata.sendString("Unhandled sysex command");
  }
}

FirmataExt::FirmataExt()
{
  FirmataExtInstance = this;
  Firmata.attach(SET_PIN_MODE, handleSetPinModeCallback);
  Firmata.attach((byte)START_SYSEX, handleSysexCallback);
  numFeatures = 0;
}

void FirmataExt::handleCapability(byte pin)
{

}

boolean FirmataExt::handlePinMode(byte pin, int mode)
{
  boolean known = false;
  for (byte i = 0; i < numFeatures; i++) {
    known |= features[i]->handlePinMode(pin, mode);
  }
  return known;
}
// Modified by Josenalde Oliveira, June 2020
boolean FirmataExt::handleSysex(byte command, byte argc, byte* argv)
{
  switch (command) {
    case 0x01: {// DIGITALWRITE = DIGITALOUTPUT
      byte digitalPin;
      byte pinState;
     
      digitalPin = argv[0]; //buffer[2]
      pinState = argv[1]; //buffer[3]
      
      pinMode(digitalPin, OUTPUT);
      digitalWrite(digitalPin, pinState);
     
      Firmata.sendSysex(command, argc, argv); // callback
      
      break;
    }
    case 0x02: { // Analog Read Command
      byte adcPin = argv[0];
      
      unsigned short rawV;
      rawV = analogRead(adcPin); //0-1023
      // pin does not need to callback, therefore argv is modified here
      byte i = 0;
      byte nBytes = rawV / 127;
      byte lastByte = rawV % 127;
      //nBytes is the number of full 7 bit bytes and lastByte is the offset (difference) for the last 7-bit byte
      for (; i<nBytes;i++) {
        argv[i] = 127;
      }
      // generates dynamic argv with 127 slices
      if (nBytes >= 1) {
        argv[i] = lastByte;
      } else argv[i] = rawV;

      argc = i+1;
   
      Firmata.sendSysex(command, argc, argv);
      break; 
    }
    case 0x03: { // Digital Read Command
      byte digitalPin = argv[0];
      byte pinState[1];
      pinMode(digitalPin, INPUT);
      pinState[0] = digitalRead(digitalPin);
      Firmata.sendSysex(command, argc, pinState);
      break;
    }
    case 0x04: { // PWM output
      byte pwmPin = argv[0];
      byte pwmChannel = argv[1];
      byte pwmFreq = argv[2];
      byte pwmResolution = argv[3];
     
      byte pw = (argv[4]);
      string s(pw, sizeof(pw));
      unsigned short pwmValue = 0;
  
  //teste 
  /*
      string text = argv[4];
      vector<int> numbers;
      int num;

      size_t pos = 0;
      while ((pos = text.find(',')) != string::npos) {
          numbers.push_back(atoi(text.substr(0, pos)));
          text.erase(0, pos + 1);
      }
      numbers.push_back(atoi(text.substr(0, pos)));
      int aux;
        for (int i =0; i< numbers.size(); i++){
                aux += numbers[i];  
              }
      pwmValue = aux;
*/
        /*
        string listArgs;
        vector<string> v;
        vector<string> args;
        listArgs = atoi(s);
        auto f1 = listArgs.find(",");
      
        if (f1 != string::npos) {
          v.push_back(listArgs.substr(0,f1));
        }
        
        size_t f;
        while (f1 != string::npos) {
          f = listArgs.find(",", f1+1);
          v.push_back(listArgs.substr(f1+1,f-f1-1));
          f1 = f;
        }
       
         for (int i = 0; i < v.size(); i++){
            atoi(v[i]);
         }// Convert string to float; stoi convert string to int

        int aux;

      for (int i =0; i<v.size(); i++){
              aux += v[i];  
            }

        pwmValue = aux;

*/

/*
      for (byte i = 4; i < argc; i++) {
          pwmValue += argv[i]; //from buffer[4]...
      }
*/

      
      //Serial.println(pwmValue);
        if (argc > 5) {
        //pinMode(19, OUTPUT);
        digitalWrite(19, LOW);
        digitalWrite(18, HIGH);
      } 
      if(argc = 5) {
        digitalWrite(19, HIGH);
        digitalWrite(18, HIGH);
      }
      





      //ledcSetup(pwmChannel, pwmFreq*1000, pwmResolution);
      //ledcAttachPin(pwmPin, pwmChannel);
      //ledcWrite(pwmChannel, pwmValue);
      Firmata.sendSysex(command, argc, argv);
    }
    case PIN_STATE_QUERY:
      if (argc > 0) {
        byte pin = argv[0];
        if (pin < TOTAL_PINS) {
          Firmata.write(START_SYSEX);
          Firmata.write(PIN_STATE_RESPONSE);
          Firmata.write(pin);
          Firmata.write(Firmata.getPinMode(pin));
          int pinState = Firmata.getPinState(pin);
          Firmata.write((byte)pinState & 0x7F);
          if (pinState & 0xFF80) Firmata.write((byte)(pinState >> 7) & 0x7F);
          if (pinState & 0xC000) Firmata.write((byte)(pinState >> 14) & 0x7F);
          Firmata.write(END_SYSEX);
          return true;
        }
      }
      break;
    case CAPABILITY_QUERY:
      Firmata.write(START_SYSEX);
      Firmata.write(CAPABILITY_RESPONSE);
      for (byte pin = 0; pin < TOTAL_PINS; pin++) {
        if (Firmata.getPinMode(pin) != PIN_MODE_IGNORE) {
          for (byte i = 0; i < numFeatures; i++) {
            features[i]->handleCapability(pin);
          }
        }
        Firmata.write(127);
      }
      Firmata.write(END_SYSEX);
      return true;
    default:
      for (byte i = 0; i < numFeatures; i++) {
        if (features[i]->handleSysex(command, argc, argv)) {
          return true;
        }
      }
      break;
  }
  return false;
}

void FirmataExt::addFeature(FirmataFeature &capability)
{
  if (numFeatures < MAX_FEATURES) {
    features[numFeatures++] = &capability;
  }
}

void FirmataExt::reset()
{
  for (byte i = 0; i < numFeatures; i++) {
    features[i]->reset();
  }
}
