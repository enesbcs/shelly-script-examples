// Copyright 2021 Allterco Robotics EOOD
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// Shelly is a Trademark of Allterco Robotics

// ShellyPlus 0-10V Dimmer device Brightness helper for Domoticz MQTTAD control
// Domoticz rpc control JSON is malformed, this script will interpret it anyway

// original author: enesbcs

// Extension for ShellyTeacher4Domo
// https://github.com/enesbcs/shellyteacher4domo

let CONFIG = {
  shelly_id: null,
};
Shelly.call("Mqtt.GetConfig", {}, function (result) {
 if (result && result.topic_prefix) {
  CONFIG.shelly_id = result.topic_prefix;
  MQTT.subscribe(
    buildMQTTStateCmdTopics("rpc"),
    DecodeDomoticzFaultyJSON
  );
  console.log("Subscribed to RPC");
 } else {
  console.log("Failed to get Shelly device info:", result);
 }
});

/**
 * @param {string} topic
 */
function buildMQTTStateCmdTopics(topic) {
  let _t = topic || "";
  return CONFIG.shelly_id + "/" + _t;
}

/**
 * @param {string} topic
 * @param {string} message
 */
function DecodeDomoticzFaultyJSON(topic, message) {
 try {
  let trimmedMessage = message.trim();
  if (trimmedMessage) {
    if (trimmedMessage.indexOf("domoticz") !== -1){
     let req = JSON.parse(trimmedMessage);
     if (typeof req['params'] !== "undefined" && req['params'] !== null) {
      return;
     }
     if (typeof req['brightness'] === "undefined" || req['brightness'] === null) {
      return;
     }
     SetBrightness(req['brightness']);
    }
  }
 } catch (error) {
   console.log("Error parsing JSON:", error);
 }
}

/**
 * @param {integer} brightness 0..100
 */
function SetBrightness(pbrightness) {
  let _ons = true;
  if (pbrightness<1) {
   _ons = false;
  }
  Shelly.call("Light.Set", {
    id: 0,
    on: _ons,
    brightness: pbrightness,
  });
}
