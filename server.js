var express = require('express');

module.exports = function(log, platform) {
  var app = express();
  app.use(express.json());
  var platform = platform;

  app.post('/sendData', function(req, res) {
    var displayName = req.body.displayName;
    var temperature = req.body.temperature;
    var humidity = req.body.humidity;

    var isAccessory = false;
    for (var i in platform.accessories) {
      if (platform.accessories[i].displayName == displayName) {
        isAccessory = true;
        platform.setTemperature(platform.accessories[i], temperature, humidity);
        break;
      }
    }
    if (!isAccessory) {
      platform.addAccessory(displayName, temperature, humidity);
    }
    res.send(204)

  });

  app.listen(2604, function() {
    log('Temperature and humidity server listening at 2604!');
  });
}
