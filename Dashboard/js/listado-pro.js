// Proteger la página — redirige al login si no hay sesión
sessionService.protegerPagina();

// Variables globales
const usuarioActivo          = sessionService.obtener();
const rolActivo              = usuarioActivo?.rol ?? '';
const tablaProductos         = document.getElementById('tablaProductos');
const inputBuscador          = document.getElementById('inputBuscador');
const alertaMensaje          = document.getElementById('alertaMensaje');
const textoAlerta            = document.getElementById('textoAlerta');
const nombreProductoEliminar = document.getElementById('nombreProductoEliminar');
const btnConfirmarEliminar   = document.getElementById('btnConfirmarEliminar');
const nombreUsuarioTopbar    = document.getElementById('nombreUsuarioTopbar');
const btnLogout              = document.getElementById('btnLogout');

// Muestra el nombre del usuario en el topbar
nombreUsuarioTopbar.textContent = usuarioActivo?.usuario ?? 'Usuario';

// Evento logout — limpia localStorage y redirige al login
btnLogout.addEventListener('click', () => {
    sessionService.cerrar();
    window.location.href = 'login.html';
});

let productoIdEliminar = null;

// Muestra una alerta temporal de éxito o error
const mostrarAlerta = (mensaje, tipo = 'success') => {
    textoAlerta.textContent = mensaje;
    alertaMensaje.className = `alert alert-${tipo} mb-3`;
    alertaMensaje.classList.remove('d-none');
    setTimeout(() => alertaMensaje.classList.add('d-none'), 3500);
};

// Formatea precio en pesos colombianos
const formatearPrecio = (valor) =>
    new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
    }).format(valor);

const obtenerIdProducto = (producto) => producto.id_producto ?? producto.id;

// Proceso 2: Función para traer los datos de la BD (GET /api/productos)
// Guarda en localStorage como "datosTabla" para usarlos en editar/eliminar por posición
let getTableData = async () => {
    try {
        let tableData = await productosService.getAll();
        console.log(tableData);

        // Guardar en localStorage — el profe lo requiere para acceder por posición
        localStorage.setItem('datosTabla', JSON.stringify(tableData));

        renderTabla(tableData);
    } catch (error) {
        console.log(error);
        tablaProductos.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-danger py-4">
                    <i class="fas fa-exclamation-triangle mr-2"></i>
                    Error al cargar productos: ${error.message}
                </td>
            </tr>`;
    }
};

// Renderiza las filas de la tabla
// Proceso 3: si el usuario es vendedor, el botón eliminar aparece deshabilitado
let renderTabla = (productos) => {
    tablaProductos.innerHTML = '';

    if (!productos.length) {
        tablaProductos.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4 text-muted">
                    <i class="fas fa-box-open fa-2x mb-2 d-block"></i>
                    No se encontraron productos.
                </td>
            </tr>`;
        return;
    }

    // Proceso 3: verificar si el usuario activo es vendedor
    let esVendedor = rolActivo === 'vendedor';

    productos.forEach((d) => {
        const idProducto = obtenerIdProducto(d);
        let row = document.createElement('tr');
        row.dataset.nombre = d.nombre.toLowerCase();

        // Proceso 3: vendedor ve el botón deshabilitado, admin puede eliminar
        let btnEliminar = esVendedor
            ? `<button class="btn btn-sm btn-secondary" disabled title="Sin permiso">
                   <i class="fas fa-ban"></i>
               </button>`
            : `<button class="btn btn-sm btn-danger btn-eliminar"
                   onclick="abrirModalEliminar(${idProducto}, '${d.nombre.replace(/'/g, "\\'")}')">  
                   <i class="fas fa-trash"></i>
               </button>`;

        row.innerHTML = `
            <td>${idProducto}</td>
            <td><strong>${d.nombre}</strong></td>
            <td>${formatearPrecio(d.precio)}</td>
            <td>${d.descripcion || '—'}</td>
            <td>
                <button onclick="editDataTable(${idProducto})" class="btn btn-sm btn-warning mr-1">
                    <i class="fas fa-edit"></i>
                </button>
                ${btnEliminar}
            </td>
        `;
        tablaProductos.appendChild(row);
    });
};

// Proceso 3: Buscador — filtra los productos guardados en localStorage por nombre
inputBuscador.addEventListener('input', () => {
    let termino  = inputBuscador.value.trim().toLowerCase();
    let products = JSON.parse(localStorage.getItem('datosTabla')) || [];
    let filtrados = products.filter(p => p.nombre.toLowerCase().includes(termino));
    renderTabla(filtrados);
});

// Proceso 2: Editar — guarda el producto en localStorage y redirige a editar-pro.html
let editDataTable = (id) => {
    let products = JSON.parse(localStorage.getItem('datosTabla')) || [];
    let singleProduct = products.find(p => String(obtenerIdProducto(p)) === String(id));
    if (!singleProduct) return;

    // Guardar el producto a editar en localStorage — lo lee editar-pro.js
    localStorage.setItem('productEdit', JSON.stringify(singleProduct));

    // Redirigir a la página de edición con el id en la URL
    window.location.href = `editar-pro.html?id=${obtenerIdProducto(singleProduct)}`;
};

// Proceso 2: Abrir modal de confirmación de eliminación
let abrirModalEliminar = (id, nombre) => {
    productoIdEliminar = id;
    nombreProductoEliminar.textContent = nombre;
    $('#modalEliminar').modal('show');
};

// Proceso 2: Eliminar — DELETE /api/productos/:id al confirmar en el modal
btnConfirmarEliminar.addEventListener('click', async () => {
    if (!productoIdEliminar) return;

    btnConfirmarEliminar.disabled  = true;
    btnConfirmarEliminar.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Eliminando...';

    try {
        await productosService.remove(productoIdEliminar);
        $('#modalEliminar').modal('hide');
        mostrarAlerta('Producto eliminado exitosamente.');
        // Recargar la tabla con los datos actualizados
        await getTableData();
    } catch (error) {
        mostrarAlerta(`Error al eliminar: ${error.message}`, 'danger');
    } finally {
        btnConfirmarEliminar.disabled  = false;
        btnConfirmarEliminar.innerHTML = '<i class="fas fa-trash mr-1"></i> Eliminar';
        productoIdEliminar             = null;
    }
});

// Cargar productos al iniciar la página
document.addEventListener('DOMContentLoaded', () => {
    getTableData();
});