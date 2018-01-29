import machine
import utime
import urequests

led = machine.Pin(2, machine.Pin.OUT)

temps = [31, -10, 15, 5, 12, 13, 21, -14]
hums = [99, 80, 50, 66, 75, 90, 100, 99]
i = 0

print(i)

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
    global i
    urequests.post("http://192.168.178.79:2604/sendData", json={"displayName": "NodeMCU", "temperature": temps[i], "humidity": hums[i]}, headers = {u'content-type': u'application/json'})
    if i < 7:
        i += 1
    else:
        i = 0

def start_logging():
    while True:
        led.off()
        send_data()
        led.on()
        utime.sleep(5)

do_connect()
