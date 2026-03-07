sessionService.protegerPagina();

const formPedido = document.getElementById('formulario-pedido');
const selectCliente = document.getElementById('id_cliente');
const selectMetodoPago = document.getElementById('metodo_pago');
const tbodyProductos = document.querySelector('#tabla-carrito tbody');
const inputDescuento = document.getElementById('descuento');
const inputAumento = document.getElementById('aumento');
const totalPedidoEl = document.getElementById('total-pedido');

let carritoPedido = [];

const formatCOP = (value) =>
    new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
    }).format(Number(value) || 0);

const obtenerIdProducto = (producto) => producto.id_producto ?? producto.id;

const normalizarMetodoPago = (metodo) => {
    if (metodo === 'contra-entrega') return 'contra-entrega';
    return metodo;
};

const recalcularTotal = () => {
    const subtotal = carritoPedido.reduce((acc, item) => acc + item.subtotal, 0);
    const descuento = Number(inputDescuento.value) || 0;
    const aumento = Number(inputAumento.value) || 0;
    const total = Math.max(0, subtotal - descuento + aumento);
    totalPedidoEl.textContent = formatCOP(total);
    return total;
};

const actualizarLinea = (idProducto, precio, inputCantidad) => {
    const cantidad = Number(inputCantidad.value) || 0;
    const subtotal = precio * cantidad;
    const subtotalEl = document.getElementById(`sub-${idProducto}`);
    subtotalEl.textContent = formatCOP(subtotal);

    const index = carritoPedido.findIndex((item) => String(item.id_producto) === String(idProducto));

    if (cantidad <= 0) {
        if (index !== -1) carritoPedido.splice(index, 1);
    } else if (index !== -1) {
        carritoPedido[index].cantidad = cantidad;
        carritoPedido[index].precio = precio;
        carritoPedido[index].subtotal = subtotal;
    } else {
        carritoPedido.push({ id_producto: idProducto, cantidad, precio, subtotal });
    }

    recalcularTotal();
};

const cargarClientes = async () => {
    const payload = await clientesService.getAll();
    const clientes = Array.isArray(payload) ? payload : payload.data || [];
    clientes.forEach((cliente) => {
        const idCliente = cliente.id_cliente ?? cliente.id;
        const option = document.createElement('option');
        option.value = idCliente;
        option.textContent = `${cliente.nombre ?? ''} ${cliente.apellido ?? ''}`.trim();
        selectCliente.appendChild(option);
    });
};

const cargarProductos = async () => {
    const payload = await productosService.getAll();
    const productos = Array.isArray(payload) ? payload : payload.data || [];
    if (!productos.length) {
        tbodyProductos.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No hay productos disponibles.</td></tr>';
        return;
    }

    tbodyProductos.innerHTML = '';

    productos.forEach((producto) => {
        const idProducto = obtenerIdProducto(producto);
        const precio = Number(producto.precio) || 0;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${producto.nombre ?? `Producto #${idProducto}`}</td>
            <td>${formatCOP(precio)}</td>
            <td>
                <input
                    type="number"
                    min="0"
                    value="0"
                    class="form-control form-control-sm"
                    style="width:80px"
                    data-id="${idProducto}"
                    data-precio="${precio}"
                />
            </td>
            <td id="sub-${idProducto}">$0</td>
            <td><small class="text-muted">Stock: ${producto.stock ?? '-'}</small></td>`;
        tbodyProductos.appendChild(tr);
    });
};

tbodyProductos.addEventListener('input', (event) => {
    const input = event.target.closest('input[data-id]');
    if (!input) return;

    const idProducto = input.dataset.id;
    const precio = Number(input.dataset.precio) || 0;
    actualizarLinea(idProducto, precio, input);
});

inputDescuento.addEventListener('input', recalcularTotal);
inputAumento.addEventListener('input', recalcularTotal);

formPedido.addEventListener('submit', async (event) => {
    event.preventDefault();

    const idCliente = selectCliente.value;
    const metodoPago = selectMetodoPago.value;

    if (!idCliente) {
        alert('Selecciona un cliente.');
        return;
    }

    if (!metodoPago) {
        alert('Selecciona un metodo de pago.');
        return;
    }

    const productos = carritoPedido
        .filter((item) => item.cantidad > 0)
        .map((item) => ({
            id_producto: item.id_producto,
            precio: item.precio,
            cantidad: item.cantidad,
            subtotal: Number((item.precio * item.cantidad).toFixed(2)),
        }));

    if (!productos.length) {
        alert('Agrega al menos un producto al pedido.');
        return;
    }

    const boton = formPedido.querySelector('button[type="submit"]');
    const textoOriginal = boton.textContent;

    boton.disabled = true;
    boton.textContent = 'Guardando...';

    const totalCalculado = recalcularTotal();

    const payload = {
        id_cliente: Number(idCliente),
        metodo_pago: normalizarMetodoPago(metodoPago),
        estado: 'pendiente',
        total: Number(totalCalculado.toFixed(2)),
        descuento: Number(inputDescuento.value) || 0,
        aumento: Number(inputAumento.value) || 0,
        productos,
    };

    try {
        await pedidosService.create(payload);
        alert('Pedido creado exitosamente.');
        window.location.href = 'listado-pedidos.html';
    } catch (error) {
        alert(`Error al crear pedido: ${error.message}`);
    } finally {
        boton.disabled = false;
        boton.textContent = textoOriginal;
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await Promise.all([cargarClientes(), cargarProductos()]);
        recalcularTotal();
    } catch (error) {
        console.error(error);
        alert(`Error al cargar formulario de pedido: ${error.message}`);
    }
});
