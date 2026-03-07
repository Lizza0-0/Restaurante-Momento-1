sessionService.protegerPagina();

const tablaClientes = document.getElementById('tabla-clientes');
const buscadorClientes = document.getElementById('inputBuscadorClientes');
let clientesCache = [];

const obtenerIdCliente = (cliente) => cliente.id_cliente ?? cliente.id;

const renderClientes = (clientes) => {
    if (!clientes.length) {
        tablaClientes.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">No hay clientes registrados.</td></tr>';
        return;
    }

    tablaClientes.innerHTML = '';
    clientes.forEach((cliente) => {
        const idCliente = obtenerIdCliente(cliente);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${idCliente}</td>
            <td>${cliente.nombre ?? ''}</td>
            <td>${cliente.apellido ?? ''}</td>
            <td>${cliente.email ?? ''}</td>
            <td>${cliente.celular ?? ''}</td>
            <td>
                <button class="btn btn-sm btn-warning mr-1" data-action="edit" data-id="${idCliente}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" data-action="delete" data-id="${idCliente}" data-name="${(cliente.nombre ?? '').replace(/"/g, '&quot;')} ${(cliente.apellido ?? '').replace(/"/g, '&quot;')}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>`;
        tablaClientes.appendChild(tr);
    });
};

const cargarClientes = async () => {
    try {
        const payload = await clientesService.getAll();
        clientesCache = Array.isArray(payload) ? payload : payload.data || [];
        renderClientes(clientesCache);
    } catch (error) {
        tablaClientes.innerHTML = `<tr><td colspan="6" class="text-center text-danger py-4"><i class="fas fa-exclamation-triangle mr-2"></i>${error.message}</td></tr>`;
    }
};

const editarClienteRapido = async (idCliente) => {
    const cliente = clientesCache.find((item) => String(obtenerIdCliente(item)) === String(idCliente));
    if (!cliente) {
        alert('No se encontro el cliente seleccionado.');
        return;
    }

    const nombre = prompt('Nombre:', cliente.nombre ?? '');
    if (nombre === null) return;

    const apellido = prompt('Apellido:', cliente.apellido ?? '');
    if (apellido === null) return;

    const email = prompt('Email:', cliente.email ?? '');
    if (email === null) return;

    const celular = prompt('Celular:', cliente.celular ?? '');
    if (celular === null) return;

    const direccion = prompt('Direccion:', cliente.direccion ?? '');
    if (direccion === null) return;

    const direccion2 = prompt('Direccion 2 (opcional):', cliente.direccion2 ?? '');
    if (direccion2 === null) return;

    const descripcion = prompt('Descripcion (opcional):', cliente.descripcion ?? '');
    if (descripcion === null) return;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        alert('El email no es valido.');
        return;
    }

    try {
        await clientesService.update(idCliente, {
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            email: email.trim(),
            celular: celular.trim(),
            direccion: direccion.trim(),
            direccion2: direccion2.trim(),
            descripcion: descripcion.trim(),
        });
        alert('Cliente actualizado correctamente.');
        await cargarClientes();
    } catch (error) {
        alert(`Error al actualizar cliente: ${error.message}`);
    }
};

tablaClientes.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;

    const action = button.dataset.action;
    const idCliente = button.dataset.id;

    if (action === 'delete') {
        const nombre = button.dataset.name || 'cliente';
        if (!confirm(`¿Eliminar al cliente "${nombre}"?`)) return;
        try {
            await clientesService.remove(idCliente);
            await cargarClientes();
        } catch (error) {
            alert(`Error al eliminar cliente: ${error.message}`);
        }
        return;
    }

    if (action === 'edit') {
        await editarClienteRapido(idCliente);
    }
});

if (buscadorClientes) {
    buscadorClientes.addEventListener('input', () => {
        const termino = buscadorClientes.value.trim().toLowerCase();
        const filtrados = clientesCache.filter((cliente) => {
            const texto = `${obtenerIdCliente(cliente) ?? ''} ${cliente.nombre ?? ''} ${cliente.apellido ?? ''} ${cliente.email ?? ''} ${cliente.celular ?? ''}`.toLowerCase();
            return texto.includes(termino);
        });
        renderClientes(filtrados);
    });
}

document.addEventListener('DOMContentLoaded', cargarClientes);
