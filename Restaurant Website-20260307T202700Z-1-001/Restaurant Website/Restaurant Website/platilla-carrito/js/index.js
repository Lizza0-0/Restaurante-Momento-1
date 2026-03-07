const API_BASE = 'http://localhost:3000/api';

const contadorCarrito = document.querySelector('.contar-pro');
const iconoCarrito = document.querySelector('.carrito');
const listCartBody = document.querySelector('.list-cart tbody');
const notificacion = document.createElement('div');

notificacion.style.position = 'fixed';
notificacion.style.top = '20px';
notificacion.style.right = '20px';
notificacion.style.background = '#28a745';
notificacion.style.color = '#fff';
notificacion.style.padding = '10px 14px';
notificacion.style.borderRadius = '8px';
notificacion.style.boxShadow = '0 6px 18px rgba(0,0,0,.2)';
notificacion.style.display = 'none';
notificacion.style.zIndex = '9999';
document.body.appendChild(notificacion);

const formatUSD = (value) => `$${Number(value || 0).toFixed(2)}`;

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
        throw new Error(data.message || `Error HTTP ${response.status}`);
    }

    return data;
};

const mostrarNotificacion = (mensaje) => {
    notificacion.textContent = mensaje;
    notificacion.style.display = 'block';
    setTimeout(() => {
        notificacion.style.display = 'none';
    }, 1400);
};

const actualizarContador = () => {
    if (contadorCarrito) {
        contadorCarrito.textContent = carritoStorage.contar();
    }
};

const renderMiniCarrito = () => {
    if (!listCartBody) return;

    const carrito = carritoStorage.leer();
    if (!carrito.length) {
        listCartBody.innerHTML = '<tr><td colspan="4" class="text-center">Sin productos</td></tr>';
        return;
    }

    listCartBody.innerHTML = '';
    carrito.slice(0, 5).forEach((item, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <th scope="row">${index + 1}</th>
            <td><img src="${item.imagen}" alt="${item.nombre}" style="width:40px;height:40px;object-fit:cover;border-radius:4px;"></td>
            <td>${item.nombre}</td>
            <td>${formatUSD(item.precio)}</td>`;
        listCartBody.appendChild(tr);
    });
};

const agregarProductoDesdeCard = (card) => {
    if (!card) return;

    const id = card.dataset.id;
    const nombre = card.dataset.name;
    const precio = Number(card.dataset.price);
    const imagen = card.dataset.image;

    if (!id || !nombre || Number.isNaN(precio)) {
        return;
    }

    carritoStorage.agregar({ id, nombre, precio, imagen });
    actualizarContador();
    renderMiniCarrito();
    mostrarNotificacion(`${nombre} agregado al carrito`);
};

const asegurarClaseBtnProduct = () => {
    document.querySelectorAll('.card.producto').forEach((card) => {
        const boton = card.querySelector('.btn-product') || card.querySelector('h5 span');
        if (!boton) return;
        boton.classList.add('btn-product');
    });
};

const enlazarEventosDeCatalogo = () => {
    asegurarClaseBtnProduct();

    document.querySelectorAll('.card.producto').forEach((card) => {
        const boton = card.querySelector('.btn-product');
        if (!boton) return;

        boton.style.cursor = 'pointer';
        boton.addEventListener('click', (event) => {
            event.preventDefault();
            agregarProductoDesdeCard(card);
        });
    });
};

const renderCatalogoDesdeAPI = async () => {
    const burgerContainers = document.querySelectorAll('#burger');
    const contenedor = burgerContainers[0];
    if (!contenedor) {
        enlazarEventosDeCatalogo();
        return;
    }

    try {
        const payload = await jsonRequest(`${API_BASE}/productos`);
        const productos = Array.isArray(payload) ? payload : payload.data || [];

        if (!productos.length) {
            enlazarEventosDeCatalogo();
            return;
        }

        const existentes = contenedor.querySelectorAll('.col-md-3.py-3.py-md-0');
        existentes.forEach((item) => item.remove());

        const filaPrincipal = document.createElement('div');
        filaPrincipal.className = 'row';
        filaPrincipal.style.marginTop = '30px';

        productos.forEach((producto, index) => {
            const idProducto = producto.id_producto ?? producto.id;
            const nombre = producto.nombre || `Producto ${index + 1}`;
            const precio = Number(producto.precio) || 0;
            const imagen = producto.imagen || './images/b1.png';
            const descripcion = producto.descripcion || 'Producto disponible';

            const col = document.createElement('div');
            col.className = 'col-md-3 py-3 py-md-0';
            col.innerHTML = `
                <div class="card producto" data-id="${idProducto}" data-price="${precio}" data-name="${nombre}" data-image="${imagen}">
                    <img src="${imagen}" alt="${nombre}">
                    <div class="card-body">
                        <h3>${nombre}</h3>
                        <p>${descripcion}</p>
                        <h5>${formatUSD(precio)} <span class="btn-product"><i class="fa-solid fa-basket-shopping"></i></span></h5>
                    </div>
                </div>`;
            filaPrincipal.appendChild(col);
        });

        contenedor.appendChild(filaPrincipal);
        enlazarEventosDeCatalogo();
    } catch (error) {
        console.error('No se pudo cargar catalogo desde la API:', error);
        mostrarNotificacion('No se pudo cargar el catalogo desde BD');
        enlazarEventosDeCatalogo();
    }
};

if (iconoCarrito) {
    iconoCarrito.style.cursor = 'pointer';
    iconoCarrito.addEventListener('click', () => {
        window.location.href = 'cart.html';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    actualizarContador();
    renderMiniCarrito();
    renderCatalogoDesdeAPI();
});
