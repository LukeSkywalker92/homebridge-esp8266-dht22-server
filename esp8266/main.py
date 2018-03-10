import machine
import dht
import utime
import urequests

led = machine.Pin(2, machine.Pin.OUT)
sensor = dht.DHT22(machine.Pin(12))

def do_connect():
    led.off()
    import network
    sta_if = network.WLAN(network.STA_IF)
    if not sta_if.isconnected():
        print('connecting to network...')
        sta_if.active(True)
        sta_if.connect('AP', 'PW')
        while not sta_if.isconnected():
            pass
    print('network config:', sta_if.ifconfig())
    led.on()
    start_logging()

def send_data():
    sensor.measure()
    urequests.post("http://192.168.178.15:2604/sendData", json={"displayName": "Pergola", "temperature": sensor.temperature(), "humidity": sensor.humidity()}, headers = {u'content-type': u'application/json'})

def start_logging():
    while True:
        led.off()
        send_data()
        led.on()
        utime.sleep(30)

do_connect()
