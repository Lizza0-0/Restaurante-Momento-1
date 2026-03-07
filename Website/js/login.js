// Si ya hay sesión activa, no mostrar el login
if (sessionService.estaActivo()) window.location.href = 'index.html';

// Variables del formulario
const formularioLogin = document.getElementById('formularioLogin');
const inputUsuario    = document.getElementById('inputUsuario');
const inputContrasena = document.getElementById('inputContrasena');
const alertaError     = document.getElementById('alertaError');
const mensajeError    = document.getElementById('mensajeError');
const btnLogin        = document.getElementById('btnLogin');
const textoBtn        = document.getElementById('textoBtn');
const loadingBtn      = document.getElementById('loadingBtn');

// Muestra/oculta el spinner del botón mientras se hace la petición
const toggleLoading = (activo) => {
    btnLogin.disabled = activo;
    textoBtn.classList.toggle('d-none', activo);
    loadingBtn.classList.toggle('d-none', !activo);
};

// Muestra el mensaje de error en la alerta visual (no con alert())
const mostrarError = (mensaje) => {
    mensajeError.textContent = mensaje;
    alertaError.classList.remove('d-none');
};

// Evento submit del formulario — valida, hace POST y guarda sesión
formularioLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    alertaError.classList.add('d-none');

    const usuario    = inputUsuario.value.trim();
    const contrasena = inputContrasena.value.trim();

    if (!usuario || !contrasena) {
        mostrarError('Por favor completa todos los campos.');
        return;
    }

    toggleLoading(true);

    try {
        // POST /api/login — authService está en apiService.js
        const data = await authService.login(usuario, contrasena);
        // Guardar datos del usuario en localStorage para usar en todo el sistema
        sessionService.guardar(data);
        window.location.href = 'index.html';
    } catch (error) {
        mostrarError(error.message || 'Credenciales incorrectas.');
    } finally {
        toggleLoading(false);
    }
});

