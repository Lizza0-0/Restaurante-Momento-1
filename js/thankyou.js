document.addEventListener('DOMContentLoaded', () => {
    const numeroPedidoEl = document.getElementById('numero-pedido-final');
    const tiempoEntregaEl = document.getElementById('tiempo-entrega');

    let numeroPedido = '#PED-' + Date.now().toString().slice(-6);
    const pedidoRecienteRaw = localStorage.getItem('pedidoReciente');

    if (pedidoRecienteRaw) {
        try {
            const pedido = JSON.parse(pedidoRecienteRaw);
            const idPedido = pedido.id_pedido ?? pedido.id;
            if (idPedido) {
                numeroPedido = `#PED-${String(idPedido).padStart(6, '0')}`;
            }
        } catch (_error) {
            // Mantener numero generado localmente.
        }
    }

    numeroPedidoEl.textContent = numeroPedido;

    const minutosBase = 25 + Math.floor(Math.random() * 20);
    tiempoEntregaEl.textContent = `${minutosBase}-${minutosBase + 15} minutos`;

    carritoStorage.limpiar();
    localStorage.removeItem('pedidoReciente');
});
