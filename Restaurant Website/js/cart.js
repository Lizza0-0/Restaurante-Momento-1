const carritoItems = document.getElementById('carrito-items');
const subtotalResumen = document.getElementById('subtotal-resumen');
const domicilioResumen = document.getElementById('domicilio-resumen');
const descuentoResumen = document.getElementById('descuento-resumen');
const totalResumen = document.getElementById('total-resumen');

const COSTO_DOMICILIO = 4000;

const formatMoney = (value) => `$${Number(value || 0).toFixed(2)}`;

const calcularResumen = (carrito) => {
    const subtotal = carrito.reduce((acc, item) => acc + Number(item.precio) * Number(item.cantidad), 0);
    const descuento = subtotal >= 100000 ? subtotal * 0.1 : 0;
    const domicilio = carrito.length ? COSTO_DOMICILIO : 0;
    const total = Math.max(0, subtotal + domicilio - descuento);

    subtotalResumen.textContent = formatMoney(subtotal);
    domicilioResumen.textContent = formatMoney(domicilio);
    descuentoResumen.textContent = `-${formatMoney(descuento)}`;
    totalResumen.textContent = formatMoney(total);
};

const renderCarrito = () => {
    const carrito = carritoStorage.leer();

    if (!carrito.length) {
        carritoItems.innerHTML = '<tr><td colspan="6" class="text-center py-4">Tu carrito esta vacio.</td></tr>';
        calcularResumen([]);
        return;
    }

    carritoItems.innerHTML = '';

    carrito.forEach((item) => {
        const subtotal = Number(item.precio) * Number(item.cantidad);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <img src="${item.imagen}" alt="${item.nombre}" style="width:60px;height:60px;object-fit:cover;border-radius:8px;">
            </td>
            <td><p class="lead color-black mb-0">${item.nombre}</p></td>
            <td><p class="lead color-black mb-0">${formatMoney(item.precio)}</p></td>
            <td>
                <input type="number" min="1" class="form-control" style="max-width:100px" data-action="qty" data-id="${item.id}" value="${item.cantidad}">
            </td>
            <td><h6 class="mb-0">${formatMoney(subtotal)}</h6></td>
            <td>
                <button class="btn btn-sm btn-danger" data-action="remove" data-id="${item.id}">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>`;
        carritoItems.appendChild(tr);
    });

    calcularResumen(carrito);
};

carritoItems.addEventListener('click', (event) => {
    const removeBtn = event.target.closest('[data-action="remove"]');
    if (!removeBtn) return;

    event.preventDefault();
    carritoStorage.eliminar(removeBtn.dataset.id);
    renderCarrito();
});

carritoItems.addEventListener('input', (event) => {
    const qtyInput = event.target.closest('[data-action="qty"]');
    if (!qtyInput) return;

    const cantidad = Number(qtyInput.value) || 1;
    carritoStorage.actualizarCantidad(qtyInput.dataset.id, cantidad);
    renderCarrito();
});

document.addEventListener('DOMContentLoaded', renderCarrito);
