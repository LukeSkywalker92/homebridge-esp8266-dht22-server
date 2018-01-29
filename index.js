var server = require('./server')
var Accessory, Service, Characteristic, UUIDGen;

module.exports = function(homebridge) {
  console.log("homebridge API version: " + homebridge.version);

  // Accessory must be created from PlatformAccessory Constructor
  Accessory = homebridge.platformAccessory;

  // Service and Characteristic are from hap-nodejs
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  UUIDGen = homebridge.hap.uuid;

  // For platform plugin to be considered as dynamic platform plugin,
  // registerPlatform(pluginName, platformName, constructor, dynamic), dynamic must be true
  homebridge.registerPlatform("homebridge-esp8266-dht22-server", "Esp8266Dht22Server", Esp8266Dht22Server, true);
}

// Platform constructor
// config may be null
// api may be null if launched from old homebridge version
function Esp8266Dht22Server(log, config, api) {
  log("Esp8266Dht22Server init");
  var platform = this;
  this.log = log;
  this.config = config;
  this.accessories = [];

  server(log, platform, config.port);

  if (api) {
    // Save the API object as plugin needs to register new accessory via this object
    this.api = api;

    // Listen to event "didFinishLaunching", this means homebridge already finished loading cached accessories.
    // Platform Plugin should only register new accessory that doesn't exist in homebridge after this event.
    // Or start discover new accessories.
    this.api.on('didFinishLaunching', function() {
      platform.log("DidFinishLaunching");
    }.bind(this));
  }
}

// Function invoked when homebridge tries to restore cached accessory.
// Developer can configure accessory at here (like setup event handler).
// Update current value.
Esp8266Dht22Server.prototype.configureAccessory = function(accessory) {
  this.log(accessory.displayName, "Configure Accessory");
  var platform = this;

  // Set the accessory to reachable if plugin can currently process the accessory,
  // otherwise set to false and update the reachability later by invoking
  // accessory.updateReachability()
  accessory.reachable = true;

  accessory.on('identify', function(paired, callback) {
    platform.log(accessory.displayName, "Identify!!!");
    callback();
  });


  this.accessories.push(accessory);
}

// Sample function to show how developer can add accessory dynamically from outside event
Esp8266Dht22Server.prototype.addAccessory = function(accessoryName, temperature, humidity) {
  this.log("Add Accessory" + accessoryName);
  var platform = this;
  var uuid;

  uuid = UUIDGen.generate(accessoryName);

  var newAccessory = new Accessory(accessoryName, uuid);
  newAccessory.on('identify', function(paired, callback) {
    callback();
  });

  // Make sure you provided a name for service, otherwise it may not visible in some HomeKit apps
  newAccessory.addService(Service.TemperatureSensor, accessoryName + "-TemperatureSensor")
    .getCharacteristic(Characteristic.CurrentTemperature)
    .setProps({
      minValue: -30,
      maxValue: 50
    })

  newAccessory.addService(Service.HumiditySensor, accessoryName + "-HumiditySensor")
    .getCharacteristic(Characteristic.CurrentRelativeHumidity)
    .setProps({
      minValue: 0,
      maxValue: 100
    })

  newAccessory.getService(newAccessory.displayName + "-TemperatureSensor")
    .setCharacteristic(Characteristic.CurrentTemperature, temperature);

  newAccessory.getService(newAccessory.displayName + "-HumiditySensor")
    .setCharacteristic(Characteristic.CurrentRelativeHumidity, humidity);


  this.accessories.push(newAccessory);
  this.api.registerPlatformAccessories("homebridge-esp8266-dht22-server", "Esp8266Dht22Server", [newAccessory]);
}

Esp8266Dht22Server.prototype.updateAccessoriesReachability = function() {
  this.log("Update Reachability");
  for (var index in this.accessories) {
    var accessory = this.accessories[index];
    accessory.updateReachability(false);
  }
}

// Sample function to show how developer can remove accessory dynamically from outside event
Esp8266Dht22Server.prototype.removeAccessory = function() {
  this.log("Remove Accessory");
  this.api.unregisterPlatformAccessories("homebridge-esp8266-dht22-server", "Esp8266Dht22Server", this.accessories);

  this.accessories = [];
}

Esp8266Dht22Server.prototype.setTemperature = function(accessory, temperature, humidity) {
  accessory.getService(accessory.displayName + "-TemperatureSensor")
    .setCharacteristic(Characteristic.CurrentTemperature, temperature);

  accessory.getService(accessory.displayName + "-HumiditySensor")
    .setCharacteristic(Characteristic.CurrentRelativeHumidity, humidity);
}
