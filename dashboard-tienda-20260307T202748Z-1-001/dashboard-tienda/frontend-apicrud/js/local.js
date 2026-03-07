// Proteger la página — redirige al login si no hay sesión activa
if (!localStorage.getItem('userLogin')) {
    window.location.href = 'login.html';
}

// Mostrar el nombre del usuario en el topbar (#nombre-usuario)
const _usuarioLocal = JSON.parse(localStorage.getItem('userLogin'));
const _elNombreUsuario = document.getElementById('nombre-usuario');
if (_elNombreUsuario && _usuarioLocal) {
    _elNombreUsuario.textContent = _usuarioLocal.usuario ?? 'Usuario';
}
