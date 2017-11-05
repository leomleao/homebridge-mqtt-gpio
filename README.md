# homebridge-mqtt-gpio

[![NPM version][npm-image]][npm-url]

[npm-image]: http://img.shields.io/npm/v/homebridge-mqtt-gpio.svg
[npm-url]: https://npmjs.org/package/homebridge-mqtt-gpio

Homebridge-mqtt-gpio is a Plugin for Homebridge. The base is almost all on [homebridge-mqtt](https://github.com/cflurin/homebridge-mqtt). Please check their awesome work.

The motivation to do this is to add accessories that work exclusively with raspberry gpio dynamically.

The idea is to provide a bridge to add and control accessories with a mqtt API. 

[Node-RED](http://nodered.org/) is the perfect platform to use with homebridge-mqtt-gpio.

Note-RED is a visual tool for wiring together hardware devices, APIs and online services.

# TODO

*  ~~Add long lasting pi config - it vanishes at reboot ~~
*  ~~Add GPIO functionality :) ~~
* Add functionality for more than just switches and lamps.
* Add functionality for pulse, defining timing too.


### Installation

If you are new to Homebridge, please first read the Homebridge [documentation](https://www.npmjs.com/package/homebridge).

If you are running on a Raspberry, you will find a tutorial in the [homebridge-punt Wiki](https://github.com/cflurin/homebridge-punt/wiki/Running-Homebridge-on-a-Raspberry-Pi).

Install homebridge:
```sh
sudo npm install -g homebridge
```

Install homebridge-mqtt-gpio:
```sh
sudo npm install -g homebridge-mqtt-gpio
```

**Make sure rpio in working too **


### Configuration
Add the mqtt-platform in config.json in your home directory inside `.homebridge`.

```sh
{
  "platform": "mqtt",
  "name": "mqtt",
  "url": "mqtt://127.0.0.1",
  "topic_type": "multiple",
  "topic_prefix": "homebridge",
  "username": "foo",
  "password": "bar",
  "cert": "/path/to/certificate.pem",
  "key": "path/to/key.pem",
  "ca": "/path/to/ca_certificate.pem"
}

```

Replace `127.0.0.1` with the ip-address of your mqtt broker.

**Note:** 

topic_type `multiple`: the data is sent to all devices, e.g.
```sh
topic : homebridge/from/set
```
topic_type `single`: the data is sent to a single device, the accessory name is added to the topic, e.g.
```sh
topic : homebridge/from/set/flex_lamp
```

# mqtt GPIO API

You can add a new accessory like this:

### add accessory

**Note:** for GPIO functionality you can only add the following services:
* Switch
* Lightbulb
* Outlet


```sh
topic: homebridge/to/add
payload: {"name": "flex_lamp", "service_name": "light", "service": "Switch"}
```

the response should be:

```sh
topic: homebridge/from/response
payload: {"ack": true, "message": "accessory 'flex_lamp' service_name 'light' is added."}
```

Then to add GPIO functionality you have to have the characteristic:

**Note:** an accessory with the same `name` and `service_name` must be added before.

```sh
topic: homebridge/to/set
payload: {"name": "lights", "service_name": "teste", "characteristic": "GPIOPin",  "value": "[35]"}
```

The GPIO values **has** to be a valid JSON String. It can also contain multiple GPIOs, like `"[35,37]" ` 

*GPIO numering is based on physical GPIOs only P1 - P40*

You can already test your accessory with your iOS device or using the mqtt API to change the state of your accessory.


You can also add the characteristic `GPIOPinInverted` if needed:

**Note:** an accessory with the same `name` and `service_name` must be added before.

```sh
topic: homebridge/to/set
payload: {"name": "lights", "service_name": "teste", "characteristic": "GPIOPinInverted",  "value": true}
```


There's no response from `homebridge/to/set`, but you can check the current setting with `homebridge/to/get`, please check bellow for the HOWTO


---

# mqtt API

The data (payload) is sent/received in a JSON format using following topics:


* homebridge/to/add
* homebridge/to/add/service
* homebridge/to/remove
* homebridge/to/remove/service
* homebridge/to/get
* homebridge/to/set
* homebridge/to/set/reachability
* homebridge/to/set/accessoryinformation
* homebridge/from/get
* homebridge/from/set
* homebridge/from/response
* homebridge/from/identify

#
**Version 0.3.0** and higher supports `multliple services`. To handle multiple services a new property `service_name` has been introduced.

**Note:** To add a service to an existing accessory (created prior version 0.3.0) please first remove the accessory and add it again.

## Howto examples

### add service
**Note:** an accessory with the same `name` must be added before.


```sh
topic: homebridge/to/add/service
payload: {"name": "multi_sensor", "service_name": "humidity", "service": "HumiditySensor"}
```

response:

```sh
topic: homebridge/from/response
payload: {"ack": true, "message": "service_name 'humidity', service 'HumiditySensor' is added."}
```

### remove accessory

```sh
topic: homebridge/to/remove
payload: {"name": "flex_lamp"}
```

response:

```sh
topic: homebridge/from/response
payload: {"ack": true, "message": "accessory 'flex_lamp' is removed."}
```

### remove service

```sh
topic: homebridge/to/remove/service
payload: {"name": "multi_sensor", "service_name": "humidity"}
```

response:

```sh
topic: homebridge/from/response
payload: {"ack": true, "message": "accessory 'multi_sensor' service_name 'humidity' is removed."}
```

### get accessory/accessories

The purpose of this topic is to retrieve accessory configurations.
Use `homebridge/from/set` to control your devices.

```sh
topic: homebridge/to/get
payload: {"name": "outdoor_temp"}
```

homebridge sends the accessory configuration:

```sh
topic: homebridge/from/response
payload:
{
  "outdoor_temp": {
    "services": {
      "Temperature": "TemperatureSensor"
    },
    "characteristics": {
      "Temperature": {
        "CurrentTemperature": 13.4
      }
    }
  }
}
```

```sh
topic: homebridge/to/get
payload: {"name": "*"}
```

homebridge sends all accessory configurations:

```sh
topic: homebridge/from/response
payload:
{
  "node_switch": {
    "services": {
      "light": "Switch"
    },
    "characteristics": {
      "Light": {
        "On": true
      }
    }
  },
  "office_lamp": {
    "services": {
      "office_light": "Lightbulb"
    },
    "characteristics": {
      "office_light": {
        "On": "blank",
        "Brightness": 65
      }
    }
  },
  "living_temp": {
    "services": {
      "living_temperature": "TemperatureSensor"
    },
    "characteristics": {
      "living_temperature": {
        "CurrentTemperature": 19.6
      }
    }
  }
}
```

### set value (to homebridge)

```sh
topic: homebridge/to/set
payload: {"name": "flex_lamp", "service_name": "light", "characteristic": "On", "value": true}
```

### get value (from homebridge)

```sh
topic: homebridge/from/get
payload: {"name": "flex_lamp", "service_name": "light", "characteristic": "On"}
```

Homebridge-mqtt will return the cached value to HomeKit. Optionally you can publish the actual value using
`homebridge/to/set`.

### set value (from homebridge)

```sh
topic: homebridge/from/set
payload: {"name": "flex_lamp", "service_name": "light", "characteristic": "On", "value": true}
```

### set reachability

```sh
topic: homebridge/to/set/reachability
payload: {"name": "flex_lamp", "reachable": true}
or
payload: {"name": "flex_lamp", "reachable": false}
```

### set accessory information

```sh
topic: homebridge/to/set/accessoryinformation
payload: {"name": "flex_lamp", "manufacturer": "espressif", "model": "esp8266-12", "serialnumber": "4711", "firmwarerevision": "1.1.0"}
```

### identify accessory

```sh
topic: homebridge/from/identify
payload: {"name":"indoor_temp","manufacturer":"homebridge-mqtt","model":"v0.3.0","serialnumber":"2017-02-13T12:17"}
```

### define characterstic

The required characteristics are added with the default properties. If you need to change the default, define the characteristic-name with the properties. e.g.:

```sh
topic: homebridge/to/add
payload:
  {
    "name": "living_temp",
    "service_name": "temperature",
    "service": "TemperatureSensor",
    "CurrentTemperature": {"minValue": -20, "maxValue": 60, "minStep": 1}
  }
```

To add an optional charachteristic define the characteristic-name with "default" or with the properties. e.g.:

```sh
topic: homebridge/to/add
payload: 
  {
    "name": "living_lamp",
    "service_name": "light",
    "service": "Lightbulb",
    "Brightness": "default"
  }
```

```sh
topic: homebridge/to/add
payload:
  {
    "name": "bathroom_blind",
    "service_name": "blind",
    "service": "WindowCovering",
    "CurrentPosition": {"minStep": 5},
    "TargetPosition": {"minStep": 5},
    "CurrentHorizontalTiltAngle": {"minValue": 0, "minStep": 5},
    "TargetHorizontalTiltAngle": {"minValue": 0, "minStep": 5}
  }
```

[HomeKitTypes.js](https://github.com/KhaosT/HAP-NodeJS/blob/master/lib/gen/HomeKitTypes.js) describes all the predifined Services, Characteristcs, format and properties for the `value` e.g.:

```
/**
 * Service "Contact Sensor"
 */

Service.ContactSensor = function(displayName, subtype) {
  Service.call(this, displayName, '00000080-0000-1000-8000-0026BB765291', subtype);

  // Required Characteristics
  this.addCharacteristic(Characteristic.ContactSensorState);

  // Optional Characteristics
  this.addOptionalCharacteristic(Characteristic.StatusActive);
  this.addOptionalCharacteristic(Characteristic.StatusFault);
  this.addOptionalCharacteristic(Characteristic.StatusTampered);
  this.addOptionalCharacteristic(Characteristic.StatusLowBattery);
  this.addOptionalCharacteristic(Characteristic.Name);
};

/**
 * Characteristic "Contact Sensor State"
 */

Characteristic.ContactSensorState = function() {
  Characteristic.call(this, 'Contact Sensor State', '0000006A-0000-1000-8000-0026BB765291');
  this.setProps({
    format: Characteristic.Formats.UINT8,
    perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY]
  });
  this.value = this.getDefaultValue();
};

inherits(Characteristic.ContactSensorState, Characteristic);

Characteristic.ContactSensorState.UUID = '0000006A-0000-1000-8000-0026BB765291';

// The value property of ContactSensorState must be one of the following:
Characteristic.ContactSensorState.CONTACT_DETECTED = 0;
Characteristic.ContactSensorState.CONTACT_NOT_DETECTED = 1;
```

Derived from this:

```
service = ContactSensor
characteristic = ContactSensorState
format = UINT8
property = 0 or 1
```

#
# Node-red example

![node-red-mqtt](https://cloud.githubusercontent.com/assets/5056710/17394282/9ac0afbc-5a28-11e6-8d6e-01d2e1a32870.jpg)

For more examples take a look at the [wiki](https://github.com/cflurin/homebridge-mqtt/wiki)

