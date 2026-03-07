sessionService.protegerPagina();

const tablaPedidos = document.getElementById('tabla-pedidos');
const buscadorPedidos = document.getElementById('inputBuscadorPedidos');
const estadosValidos = ['pendiente', 'procesando', 'completado', 'cancelado'];
let pedidosCache = [];

const formatCOP = (value) =>
    new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
    }).format(Number(value) || 0);

const obtenerIdPedido = (pedido) => pedido.id_pedido ?? pedido.id;

const badgeEstado = (estado) => {
    if (estado === 'completado') return 'success';
    if (estado === 'cancelado') return 'danger';
    if (estado === 'procesando') return 'info';
    return 'warning';
};

const renderPedidos = (pedidos) => {
    if (!pedidos.length) {
        tablaPedidos.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-muted">No hay pedidos registrados.</td></tr>';
        return;
    }

    tablaPedidos.innerHTML = '';

    pedidos.forEach((pedido) => {
        const idPedido = obtenerIdPedido(pedido);
        const estado = (pedido.estado || 'pendiente').toLowerCase();
        const clienteNombre = pedido.cliente_nombre || pedido.nombre || '';
        const clienteApellido = pedido.cliente_apellido || pedido.apellido || '';
        const cliente = clienteNombre || clienteApellido
            ? `${clienteNombre} ${clienteApellido}`.trim()
            : `Cliente #${pedido.id_cliente ?? '-'}`;
        const fecha = pedido.fecha ? new Date(pedido.fecha).toLocaleDateString('es-CO') : '—';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${idPedido}</td>
            <td>${cliente}</td>
            <td>${pedido.email ?? '—'}</td>
            <td>${fecha}</td>
            <td>${formatCOP(pedido.total)}</td>
            <td>
                <span class="badge badge-${badgeEstado(estado)} mr-2">${estado}</span>
                <button class="btn btn-sm btn-outline-secondary" data-action="state" data-id="${idPedido}" data-estado="${estado}">
                    <i class="fas fa-sync"></i>
                </button>
            </td>
            <td>
                <button class="btn btn-sm btn-danger" data-action="delete" data-id="${idPedido}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>`;
        tablaPedidos.appendChild(tr);
    });
};

const cargarPedidos = async () => {
    try {
        const payload = await pedidosService.getAll();
        pedidosCache = Array.isArray(payload) ? payload : payload.data || [];
        renderPedidos(pedidosCache);
    } catch (error) {
        tablaPedidos.innerHTML = `<tr><td colspan="7" class="text-center text-danger py-4"><i class="fas fa-exclamation-triangle mr-2"></i>${error.message}</td></tr>`;
    }
};

const cambiarEstadoPedido = async (idPedido, estadoActual) => {
    const nuevoEstado = prompt(`Estado actual: ${estadoActual}.\nNuevo estado (pendiente, procesando, completado, cancelado):`, estadoActual);
    if (nuevoEstado === null) return;

    const estadoNormalizado = nuevoEstado.trim().toLowerCase();
    if (!estadosValidos.includes(estadoNormalizado)) {
        alert('Estado no valido. Usa: pendiente, procesando, completado o cancelado.');
        return;
    }

    try {
        await pedidosService.updateEstado(idPedido, estadoNormalizado);
        alert('Estado actualizado correctamente.');
        await cargarPedidos();
    } catch (error) {
        alert(`Error al actualizar estado: ${error.message}`);
    }
};

tablaPedidos.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;

    const action = button.dataset.action;
    const idPedido = button.dataset.id;

    if (action === 'delete') {
        if (!confirm(`¿Eliminar el pedido #${idPedido}?`)) return;
        try {
            await pedidosService.remove(idPedido);
            await cargarPedidos();
        } catch (error) {
            alert(`Error al eliminar pedido: ${error.message}`);
        }
        return;
    }

    if (action === 'state') {
        await cambiarEstadoPedido(idPedido, button.dataset.estado || 'pendiente');
    }
});

if (buscadorPedidos) {
    buscadorPedidos.addEventListener('input', () => {
        const termino = buscadorPedidos.value.trim().toLowerCase();
        const filtrados = pedidosCache.filter((pedido) => {
            const texto = `${pedido.id_pedido ?? pedido.id ?? ''} ${pedido.nombre ?? ''} ${pedido.apellido ?? ''} ${pedido.email ?? ''} ${pedido.estado ?? ''}`.toLowerCase();
            return texto.includes(termino);
        });
        renderPedidos(filtrados);
    });
}

document.addEventListener('DOMContentLoaded', cargarPedidos);
