// Proteger la página
sessionService.protegerPagina();

// Variables
const usuarioActivo        = sessionService.obtener();
const params               = new URLSearchParams(window.location.search);
const productoId           = params.get('id');
const formularioEditar     = document.getElementById('formularioEditar');
const inputNombre          = document.getElementById('inputNombre');
const inputDescripcion     = document.getElementById('inputDescripcion');
const inputPrecio          = document.getElementById('inputPrecio');
const inputStock           = document.getElementById('inputStock');
const inputImagen          = document.getElementById('inputImagen');
const previsualizacion     = document.getElementById('previsualizacionImagen');
const alertaError          = document.getElementById('alertaError');
const alertaExito          = document.getElementById('alertaExito');
const mensajeError         = document.getElementById('mensajeError');
const mensajeExito         = document.getElementById('mensajeExito');
const btnGuardar           = document.getElementById('btnGuardar');
const textoBtn             = document.getElementById('textoBtn');
const loadingBtn           = document.getElementById('loadingBtn');
const contenedorCarga      = document.getElementById('contenedorCarga');
const contenedorFormulario = document.getElementById('contenedorFormulario');
const nombreUsuarioTopbar  = document.getElementById('nombreUsuarioTopbar');
const btnLogout            = document.getElementById('btnLogout');

const obtenerIdProducto = (producto) => producto.id_producto ?? producto.id;

nombreUsuarioTopbar.textContent = usuarioActivo?.usuario ?? 'Usuario';

// Logout
btnLogout.addEventListener('click', () => {
    sessionService.cerrar();
    window.location.href = 'login.html';
});

// Spinner del botón
const toggleLoading = (activo) => {
    btnGuardar.disabled = activo;
    textoBtn.classList.toggle('d-none', activo);
    loadingBtn.classList.toggle('d-none', !activo);
};

const mostrarError = (mensaje) => {
    mensajeError.textContent = mensaje;
    alertaError.classList.remove('d-none');
    alertaExito.classList.add('d-none');
};

const mostrarExito = (mensaje) => {
    mensajeExito.textContent = mensaje;
    alertaExito.classList.remove('d-none');
    alertaError.classList.add('d-none');
};

// Preview de imagen en tiempo real
inputImagen.addEventListener('input', () => {
    const url = inputImagen.value.trim();
    previsualizacion.src     = url || 'https://placehold.co/300x250?text=Sin+imagen';
    previsualizacion.onerror = () => {
        previsualizacion.src = 'https://placehold.co/300x250?text=URL+no+v%C3%A1lida';
    };
});

// Carga los datos del producto al entrar a la página
// Primero intenta desde localStorage (productEdit guardado por editDataTable)
// Si no, hace GET a la API con el id de la URL
const cargarProducto = async () => {
    if (!productoId) {
        contenedorCarga.innerHTML = `
            <div class="alert alert-danger">
                No se especificó un producto. <a href="listado-pro.html">Volver al listado</a>.
            </div>`;
        return;
    }

    try {
        // Intentar cargar desde localStorage primero (más rápido)
        let producto = JSON.parse(localStorage.getItem('productEdit'));

        // Si el localStorage no coincide con el id de la URL, ir a la API
        if (!producto || String(obtenerIdProducto(producto)) !== String(productoId)) {
            producto = await productosService.getById(productoId);
        }

        // Llenar el formulario con los datos del producto
        inputNombre.value      = producto.nombre;
        inputDescripcion.value = producto.descripcion ?? '';
        inputPrecio.value      = producto.precio;
        inputStock.value       = producto.stock ?? producto.disponible ?? 0;
        inputImagen.value      = producto.imagen ?? '';

        if (producto.imagen) previsualizacion.src = producto.imagen;

        // Mostrar el formulario y ocultar el spinner de carga
        contenedorCarga.classList.add('d-none');
        contenedorFormulario.classList.remove('d-none');
    } catch (error) {
        contenedorCarga.innerHTML = `
            <div class="alert alert-danger">
                Error al cargar el producto: ${error.message}.
                <a href="listado-pro.html">Volver al listado</a>.
            </div>`;
    }
};

// Evento submit — valida y hace PUT a /api/productos/:id
formularioEditar.addEventListener('submit', async (e) => {
    e.preventDefault();
    alertaError.classList.add('d-none');
    alertaExito.classList.add('d-none');

    const productoActualizado = {
        nombre:      inputNombre.value.trim(),
        descripcion: inputDescripcion.value.trim(),
        precio:      parseFloat(inputPrecio.value),
        stock:       parseInt(inputStock.value, 10),
        disponible:  (parseInt(inputStock.value, 10) || 0) > 0 ? 1 : 0,
        imagen:      inputImagen.value.trim(),
    };

    // Validaciones
    if (!productoActualizado.nombre) {
        mostrarError('El nombre del producto es obligatorio.');
        return;
    }
    if (isNaN(productoActualizado.precio) || productoActualizado.precio < 0) {
        mostrarError('El precio debe ser un número válido.');
        return;
    }

    toggleLoading(true);

    try {
        // PUT /api/productos/:id — productosService está en apiService.js
        await productosService.update(productoId, productoActualizado);
        mostrarExito('¡Producto actualizado! Redirigiendo...');
        setTimeout(() => { window.location.href = 'listado-pro.html'; }, 2000);
    } catch (error) {
        mostrarError(error.message || 'Error al actualizar el producto.');
    } finally {
        toggleLoading(false);
    }
});

// Cargar datos al iniciar
cargarProducto();