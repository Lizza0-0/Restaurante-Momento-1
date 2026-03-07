sessionService.protegerPagina();

const tablaUsuarios = document.getElementById('tabla-usuarios');
const buscadorUsuarios = document.getElementById('inputBuscadorUsuarios');
let usuariosCache = [];

const obtenerIdUsuario = (usuario) => usuario.id_usuario ?? usuario.id;

const renderUsuarios = (usuarios) => {
    if (!usuarios.length) {
        tablaUsuarios.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-muted">No hay usuarios registrados.</td></tr>';
        return;
    }

    tablaUsuarios.innerHTML = '';

    usuarios.forEach((usuario) => {
        const idUsuario = obtenerIdUsuario(usuario);
        const fechaCreado = usuario.creado_en
            ? new Date(usuario.creado_en).toLocaleDateString('es-CO')
            : '—';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${idUsuario}</td>
            <td><strong>${usuario.usuario ?? ''}</strong></td>
            <td><span class="badge badge-${usuario.rol === 'administrador' ? 'primary' : 'secondary'}">${usuario.rol ?? 'sin rol'}</span></td>
            <td>${fechaCreado}</td>
            <td>
                <button class="btn btn-sm btn-warning mr-1" data-action="edit" data-id="${idUsuario}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" data-action="delete" data-id="${idUsuario}" data-name="${(usuario.usuario ?? '').replace(/"/g, '&quot;')}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>`;
        tablaUsuarios.appendChild(tr);
    });
};

const cargarUsuarios = async () => {
    try {
        const payload = await usuariosService.getAll();
        usuariosCache = Array.isArray(payload) ? payload : payload.data || [];
        renderUsuarios(usuariosCache);
    } catch (error) {
        tablaUsuarios.innerHTML = `<tr><td colspan="5" class="text-center text-danger py-4"><i class="fas fa-exclamation-triangle mr-2"></i>${error.message}</td></tr>`;
    }
};

const editarUsuarioRapido = async (idUsuario) => {
    const usuarioActual = usuariosCache.find((item) => String(obtenerIdUsuario(item)) === String(idUsuario));
    if (!usuarioActual) {
        alert('No se encontro el usuario seleccionado.');
        return;
    }

    const nuevoUsuario = prompt('Usuario:', usuarioActual.usuario ?? '');
    if (nuevoUsuario === null) return;

    const nuevoRol = prompt('Rol (administrador, vendedor, cajero):', usuarioActual.rol ?? 'vendedor');
    if (nuevoRol === null) return;

    const rolNormalizado = nuevoRol.trim().toLowerCase();
    if (!['administrador', 'vendedor', 'cajero'].includes(rolNormalizado)) {
        alert('Rol invalido.');
        return;
    }

    const nuevaContrasena = prompt('Nueva contrasena (opcional, minimo 6):', '');
    if (nuevaContrasena !== null && nuevaContrasena.trim() && nuevaContrasena.trim().length < 6) {
        alert('La contrasena debe tener minimo 6 caracteres.');
        return;
    }

    const payload = {
        usuario: nuevoUsuario.trim(),
        rol: rolNormalizado,
    };

    if (nuevaContrasena && nuevaContrasena.trim()) {
        payload.contrasena = nuevaContrasena.trim();
    }

    try {
        await usuariosService.update(idUsuario, payload);
        alert('Usuario actualizado correctamente.');
        await cargarUsuarios();
    } catch (error) {
        alert(`Error al actualizar usuario: ${error.message}`);
    }
};

tablaUsuarios.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;

    const action = button.dataset.action;
    const idUsuario = button.dataset.id;

    if (action === 'delete') {
        const nombre = button.dataset.name || 'usuario';
        if (!confirm(`¿Eliminar al usuario "${nombre}"?`)) return;

        try {
            await usuariosService.remove(idUsuario);
            await cargarUsuarios();
        } catch (error) {
            alert(`Error al eliminar usuario: ${error.message}`);
        }
        return;
    }

    if (action === 'edit') {
        await editarUsuarioRapido(idUsuario);
    }
});

if (buscadorUsuarios) {
    buscadorUsuarios.addEventListener('input', () => {
        const termino = buscadorUsuarios.value.trim().toLowerCase();
        const filtrados = usuariosCache.filter((usuario) => {
            const texto = `${obtenerIdUsuario(usuario) ?? ''} ${usuario.usuario ?? ''} ${usuario.rol ?? ''} ${usuario.creado_en ?? ''}`.toLowerCase();
            return texto.includes(termino);
        });
        renderUsuarios(filtrados);
    });
}

document.addEventListener('DOMContentLoaded', cargarUsuarios);
