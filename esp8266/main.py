
import machine
import utime
import urequests

pin = machine.Pin(5, machine.Pin.OUT)

def do_connect():
    pin.on()
    utime.sleep(1)
    pin.off()
    import network
    sta_if = network.WLAN(network.STA_IF)
    if not sta_if.isconnected():
        print('connecting to network...')
        sta_if.active(True)
        sta_if.connect('FRITZ!Box Fon WLAN 7390', '7621879448851266')
        while not sta_if.isconnected():
            pass
    print('network config:', sta_if.ifconfig())
    pin.on()
    utime.sleep(1)
    pin.off()
    utime.sleep(1)
    response = urequests.post("http://192.168.178.104:3000/", json={"Kacka": "Mistscheisse"}, headers = {u'content-type': u'application/json'})
    pin.on()
    utime.sleep(1)
    pin.off()

do_connect()
