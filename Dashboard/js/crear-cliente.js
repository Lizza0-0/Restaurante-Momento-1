sessionService.protegerPagina();

const formularioCliente = document.getElementById('formulario-cliente');

const emailEsValido = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

formularioCliente.addEventListener('submit', async (event) => {
    event.preventDefault();

    const boton = formularioCliente.querySelector('button[type="submit"]');
    const textoOriginal = boton.textContent;

    const payload = {
        nombre: document.getElementById('nombre-cli').value.trim(),
        apellido: document.getElementById('apellido-cli').value.trim(),
        email: document.getElementById('email-cli').value.trim(),
        celular: document.getElementById('celular-cli').value.trim(),
        direccion: document.getElementById('direccion-cli').value.trim(),
        direccion2: document.getElementById('direccion2-cli').value.trim(),
        descripcion: document.getElementById('descripcion-cli').value.trim(),
    };

    if (!payload.nombre || !payload.apellido || !payload.email || !payload.celular || !payload.direccion) {
        alert('Completa todos los campos obligatorios.');
        return;
    }

    if (!emailEsValido(payload.email)) {
        alert('Ingresa un email valido.');
        return;
    }

    boton.disabled = true;
    boton.textContent = 'Guardando...';

    try {
        await clientesService.create(payload);
        alert('Cliente creado exitosamente.');
        window.location.href = 'listado-clientes.html';
    } catch (error) {
        alert(`Error al crear cliente: ${error.message}`);
    } finally {
        boton.disabled = false;
        boton.textContent = textoOriginal;
    }
});
