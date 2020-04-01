let tela_inicio = document.getElementById('tela-inicio');
let tela_menu = document.getElementById('tela-menu');
let tela_tutorial = document.getElementById('colocar-aqui-a-id-da-tela-tutorial');
let tela_comando = document.getElementById('colocar-aqui-a-id-da-tela-comando');
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
