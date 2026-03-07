sessionService.protegerPagina();

const formUsuario = document.getElementById('formulario-usuario');

formUsuario.addEventListener('submit', async (event) => {
    event.preventDefault();

    const rol = document.getElementById('rol').value.trim().toLowerCase();
    const usuario = document.getElementById('usuario').value.trim();
    const contrasena = document.getElementById('contrasena').value.trim();
    const confirmar = document.getElementById('confirmar_contrasena').value.trim();

    if (!rol || !usuario || !contrasena || !confirmar) {
        alert('Completa todos los campos obligatorios.');
        return;
    }

    if (!['administrador', 'vendedor', 'cajero'].includes(rol)) {
        alert('Selecciona un rol valido.');
        return;
    }

    if (contrasena.length < 6) {
        alert('La contrasena debe tener minimo 6 caracteres.');
        return;
    }

    if (contrasena !== confirmar) {
        alert('Las contrasenas no coinciden.');
        return;
    }

    const boton = formUsuario.querySelector('button[type="submit"]');
    const textoOriginal = boton.textContent;
    boton.disabled = true;
    boton.textContent = 'Guardando...';

    try {
        await usuariosService.create({ rol, usuario, contrasena });
        alert('Usuario creado exitosamente.');
        window.location.href = 'listado-usuarios.html';
    } catch (error) {
        alert(`Error al crear usuario: ${error.message}`);
    } finally {
        boton.disabled = false;
        boton.textContent = textoOriginal;
    }
});
