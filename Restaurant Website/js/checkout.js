const API_BASE = 'http://localhost:3000/api';

const formCheckout = document.getElementById('form-checkout');
const detalleProductosCheckout = document.getElementById('detalle-productos-checkout');
const totalCheckout = document.getElementById('total-checkout');

const formatCOP = (value) =>
    new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
    }).format(Number(value) || 0);

const emailValido = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const obtenerMetodoPagoRaw = () => {
    const selected = document.querySelector('input[name="metodo-pago"]:checked');
    return selected ? selected.value : 'contra-entrega';
};

const calcularTotalCheckout = () => {
    const carrito = carritoStorage.leer();
    const subtotal = carrito.reduce((acc, item) => acc + Number(item.precio) * Number(item.cantidad), 0);

    const metodoRaw = obtenerMetodoPagoRaw();
    const aumentoMetodo = metodoRaw === 'contra-entrega' ? subtotal * 0.05 : 0;
    const descuento = subtotal >= 100000 ? subtotal * 0.1 : 0;
    const domicilio = carrito.length ? 4000 : 0;
    const total = Math.max(0, subtotal + domicilio + aumentoMetodo - descuento);

    totalCheckout.textContent = formatCOP(total);

    return {
        subtotal,
        descuento,
        domicilio,
        aumento: aumentoMetodo,
        total,
    };
};

const renderResumenCheckout = () => {
    const carrito = carritoStorage.leer();

    if (!carrito.length) {
        detalleProductosCheckout.innerHTML = '<p class="lead">No hay productos en el carrito.</p>';
        totalCheckout.textContent = formatCOP(0);
        return;
    }

    detalleProductosCheckout.innerHTML = '';

    carrito.forEach((item) => {
        const linea = document.createElement('div');
        const subtotal = Number(item.precio) * Number(item.cantidad);
        linea.className = 'd-flex justify-content-between align-items-center mb-3';
        linea.innerHTML = `
            <p class="lead color-black mb-0">${item.nombre} x${item.cantidad}</p>
            <p class="lead mb-0">${formatCOP(subtotal)}</p>`;
        detalleProductosCheckout.appendChild(linea);
    });

    calcularTotalCheckout();
};

const jsonRequest = async (url, options = {}) => {
    const response = await fetch(url, options);
    const text = await response.text();
    let data = {};

    try {
        data = text ? JSON.parse(text) : {};
    } catch (_error) {
        data = { message: text || 'Respuesta no valida del servidor' };
    }

    if (!response.ok) {
        throw new Error(data.message || data.error || `Error HTTP ${response.status}`);
    }

    return data;
};

const crearClienteSiNoExiste = async (payloadCliente) => {
    try {
        const payload = await jsonRequest(`${API_BASE}/clientes`);
        const clientes = Array.isArray(payload) ? payload : payload.data || [];
        const existente = clientes.find((cliente) =>
            (cliente.email || '').toLowerCase() === payloadCliente.email.toLowerCase()
        );
        if (existente) {
            return existente.id_cliente ?? existente.id;
        }
    } catch (_error) {
        // Si falla la consulta, intenta crear el cliente directamente.
    }

    const creado = await jsonRequest(`${API_BASE}/clientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadCliente),
    });

    if (creado.id_cliente || creado.id) {
        return creado.id_cliente ?? creado.id;
    }

    const payloadClientesRecientes = await jsonRequest(`${API_BASE}/clientes`);
    const clientesRecientes = Array.isArray(payloadClientesRecientes)
        ? payloadClientesRecientes
        : payloadClientesRecientes.data || [];
    const match = clientesRecientes.find((cliente) =>
        (cliente.email || '').toLowerCase() === payloadCliente.email.toLowerCase()
    );

    if (!match) {
        throw new Error('No fue posible identificar el cliente para crear el pedido.');
    }

    return match.id_cliente ?? match.id;
};

formCheckout.addEventListener('submit', async (event) => {
    event.preventDefault();

    const carrito = carritoStorage.leer();
    if (!carrito.length) {
        alert('Tu carrito esta vacio.');
        return;
    }

    const nombres = document.getElementById('nombres-checkout').value.trim();
    const apellidos = document.getElementById('apellidos-checkout').value.trim();
    const email = document.getElementById('email-checkout').value.trim();
    const celular = document.getElementById('celular-checkout').value.trim();
    const direccion = document.getElementById('direccion-checkout').value.trim();
    const direccion2 = document.getElementById('direccion2-checkout').value.trim();
    if (!nombres || !apellidos || !email || !celular || !direccion) {
        alert('Completa todos los campos obligatorios.');
        return;
    }

    if (!emailValido(email)) {
        alert('Ingresa un email valido.');
        return;
    }

    const metodoPago = obtenerMetodoPagoRaw();
    const totales = calcularTotalCheckout();

    const payloadCliente = {
        nombre: nombres,
        apellido: apellidos,
        email,
        celular,
        direccion,
        direccion2,
        descripcion: 'Cliente creado desde checkout web',
    };

    const boton = formCheckout.querySelector('button[type="submit"]');
    const textoOriginal = boton.textContent;
    boton.disabled = true;
    boton.textContent = 'Procesando...';

    try {
        const idCliente = await crearClienteSiNoExiste(payloadCliente);

        const payloadPedido = {
            id_cliente: Number(idCliente),
            metodo_pago: metodoPago,
            estado: 'pendiente',
            total: Number(totales.total.toFixed(2)),
            notas: document.getElementById('notas-checkout').value.trim(),
            productos: carrito.map((item) => ({
                id_producto: Number(item.id),
                cantidad: Number(item.cantidad),
                precio: Number(item.precio),
            })),
        };

        // Facilita depuración en navegador cuando un POST falle.
        localStorage.setItem('ultimoPayloadPedido', JSON.stringify(payloadPedido));

        const pedidoCreado = await jsonRequest(`${API_BASE}/pedidos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payloadPedido),
        });

        localStorage.setItem('pedidoReciente', JSON.stringify(pedidoCreado));
        window.location.href = 'thankyou.html';
    } catch (error) {
        console.error('Error creando pedido:', error);
        alert(`No se pudo procesar el pedido: ${error.message}`);
    } finally {
        boton.disabled = false;
        boton.textContent = textoOriginal;
    }
});

document.querySelectorAll('input[name="metodo-pago"]').forEach((inputRadio) => {
    inputRadio.addEventListener('change', calcularTotalCheckout);
});

document.addEventListener('DOMContentLoaded', renderResumenCheckout);
