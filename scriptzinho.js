let tela_inicio = document.getElementById('tela-inicio');
let tela_menu = document.getElementById('tela-menu');
let tela_tutorial = document.getElementById('tela-tuto');
let tela_comando = document.getElementById('tela-com');
let tela_jogar = document.getElementById('tela-jogar');

setTimeout(function splash_screen() {
  document.querySelector('div.tela.active').classList.remove('active')
  tela_menu.classList.add('active')
  console.log(location.pathname)
}, 3000)

function menu() {
  document.querySelector('div.tela.active').classList.remove('active')
  tela_menu.classList.add('active')
  console.log(location.pathname)
}

function tutorial() {
  document.querySelector('div.tela.active').classList.remove('active')
  tela_tutorial.classList.add('active')
  console.log(location.pathname)
}

function comando() {
  document.querySelector('div.tela.active').classList.remove('active')
  tela_comando.classList.add('active')
  console.log(location.pathname)
}

function jogar() {
  document.querySelector('div.tela.active').classList.remove('active')
  tela_jogar.classList.add('active')
  console.log(location.pathname)
}

//Bluetooth

let deviceCache = null;
let characteristicCache = null;
let readBuffer = '';

function log(data) {
  console.log(data);
}

// EXPLICAR ESSA
let connect_bt = document.querySelector('#connect_bt');
connect_bt.addEventListener('click', function e() {
  connect();
  connect_bt.removeEventListener('click', e);
});


// EXPLICAR ESSA
function update_connect_bt(action_type) {
  if (action_type.toLowerCase() === 'connect') {
    connect_bt.classList.remove('off');
    connect_bt.querySelector('span.text').textContent = 'conectar';
    connect_bt.addEventListener('click', function e() { connect(); connect_bt.removeEventListener('click', e); });
  }
  else if (action_type.toLowerCase() === 'disconnect') {
    connect_bt.classList.add('on');
    connect_bt.querySelector('span.text').textContent = 'desconectar';
    connect_bt.addEventListener('click', function e() { disconnect(); connect_bt.removeEventListener('click', e); });
  }
}


function connect() {
  return (deviceCache ? Promise.resolve(deviceCache) :
    requestBluetoothDevice()).
    then(device => connectDeviceAndCacheCharacteristic(device)).
    then(characteristic => startNotifications(characteristic)).
    then(() => {
      update_connect_bt('disconnect');
      notification('Bluetooth connected to "' + deviceCache.name +'""');
    }).
    catch(error => log(error));
}

function requestBluetoothDevice() {
  log('Requesting bluetooth device...');

  return navigator.bluetooth.requestDevice({
    filters: [{ services: [0xFFE0]}]
  }).then(device => {
    log('"' + device.name + '" bluetooth device selected');
    deviceCache = device;

    deviceCache.addEventListener('gattserverdisconnected',
        handleDisconnection);

    return deviceCache;
  })
}

function connectDeviceAndCacheCharacteristic(device) {
  if (device.gatt.connected && characteristicCache) {
    return Promise.resolve(characteristicCache);
  }

  log('Connecting to GATT server...');

  return device.gatt.connect().
      then(server => {
        log('GATT server connected, getting service...');

        return server.getPrimaryService(0xFFE0);
      }).
      then(service => {
        log('Service found, getting characteristic...');

        return service.getCharacteristic(0xFFE1);
      }).
      then(characteristic => {
        log('Characteristic found');
        characteristicCache = characteristic;

        return characteristicCache;
      });
}

function startNotifications(characteristic) {
  log('Starting notifications...');

  return characteristic.startNotifications().
      then(() => {
        log('Notifications started');

        characteristic.addEventListener('characteristicvaluechanged',
          handleCharacteristicValueChanged);
      });
}

function handleCharacteristicValueChanged(event) {
  let value = new TextDecoder().decode(event.target.value);

  for (let c of value) {
    if (c === '\n') {
      let data = readBuffer.trim();
      readBuffer = '';

      if (data) {
        evaluateData(data);
      }
    }
    else {
      readBuffer += c;
    }
  }
}

//dados arduino
let pontuacao = document.querySelector('#points');
function sendData(data) {
  data = String(data);
  if (!data) {
    console.log('Nenhum dado a ser enviado');
    return;
  }
  else if (data.length > 20) {
    console.log('Mensagem deve ser limitada a 20 bytes');
    return;
  }
  // envia os dados para o device
  characteristicCache.writeValue(new TextEncoder().encode(data));
  console.log('Dados enviados: '+data)
  pontuacao.querySelector('span.ponto').textContent = data;
}

function disconnect() {
  if (deviceCache) {
    log('Disconnecting from "' + deviceCache.name + '" bluetooth device...');
    deviceCache.removeEventListener('gattserverdisconnected',
        handleDisconnection);

    if (deviceCache.gatt.connected) {
      deviceCache.gatt.disconnect();
      log('"' + deviceCache.name + '" bluetooth device disconnected');
    }
    else {
      log('"' + deviceCache.name +
          '" bluetooth device is already disconnected');
    }
  }

  if (characteristicCache) {
    characteristicCache.removeEventListener('characteristicvaluechanged',
        handleCharacteristicValueChanged);
    characteristicCache = null;
  }

  notification('Disconnected from ' + deviceCache.name)
  deviceCache = null;

  update_connect_bt('connect');
}

function handleDisconnection(event) {
  let device = event.target;

  log('"' + device.name +
      '" bluetooth device disconnected, trying to reconnect...');

  connectDeviceAndCacheCharacteristic(device).
      then(characteristic => startNotifications(characteristic)).
      catch(error => log(error));
}


