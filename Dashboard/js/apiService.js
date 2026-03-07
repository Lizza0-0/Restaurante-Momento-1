const apiBaseUrl = 'http://localhost:3000/api';

// Headers estándar para todas las peticiones
const buildHeaders = () => ({ 'Content-Type': 'application/json' });

// Maneja la respuesta: si no es ok lanza error con el mensaje del servidor
const handleResponse = async (response) => {
    const rawText = await response.text();
    let data = {};

    try {
        data = rawText ? JSON.parse(rawText) : {};
    } catch (_error) {
        data = { message: rawText || 'Respuesta no valida del servidor' };
    }

    if (!response.ok) {
        const serverMessage = data.message || data.error || '';

        if (response.status === 404) {
            throw new Error(serverMessage || 'Recurso no encontrado (404).');
        }

        if (response.status >= 500) {
            throw new Error(serverMessage || 'Error interno del servidor (500).');
        }

        throw new Error(serverMessage || `Error HTTP ${response.status}`);
    }

    return data;
};

// ── Autenticación ─────────────────────────────────────────────
const authService = {
    // POST /api/login — recibe usuario y contraseña, devuelve datos del usuario
    login: (usuario, contrasena) =>
        fetch(`${apiBaseUrl}/login`, {
            method: 'POST',
            headers: buildHeaders(),
            body: JSON.stringify({ usuario, contrasena }),
        }).then(handleResponse),
};

// ── Usuarios ──────────────────────────────────────────────────
const usuariosService = {
    getAll: () =>
        fetch(`${apiBaseUrl}/usuarios`, { headers: buildHeaders() }).then(handleResponse),

    getById: (id) =>
        fetch(`${apiBaseUrl}/usuarios/${id}`, { headers: buildHeaders() }).then(handleResponse),

    // POST /api/usuarios — para registro y creación desde el dashboard
    create: (data) =>
        fetch(`${apiBaseUrl}/usuarios`, {
            method: 'POST',
            headers: buildHeaders(),
            body: JSON.stringify(data),
        }).then(handleResponse),

    update: (id, data) =>
        fetch(`${apiBaseUrl}/usuarios/${id}`, {
            method: 'PUT',
            headers: buildHeaders(),
            body: JSON.stringify(data),
        }).then(handleResponse),

    remove: (id) =>
        fetch(`${apiBaseUrl}/usuarios/${id}`, {
            method: 'DELETE',
            headers: buildHeaders(),
        }).then(handleResponse),
};

// ── Productos ─────────────────────────────────────────────────
const productosService = {
    getAll: () =>
        fetch(`${apiBaseUrl}/productos`, { headers: buildHeaders() }).then(handleResponse),

    getById: (id) =>
        fetch(`${apiBaseUrl}/productos/${id}`, { headers: buildHeaders() }).then(handleResponse),

    create: (data) =>
        fetch(`${apiBaseUrl}/productos`, {
            method: 'POST',
            headers: buildHeaders(),
            body: JSON.stringify(data),
        }).then(handleResponse),

    update: (id, data) =>
        fetch(`${apiBaseUrl}/productos/${id}`, {
            method: 'PUT',
            headers: buildHeaders(),
            body: JSON.stringify(data),
        }).then(handleResponse),

    remove: (id) =>
        fetch(`${apiBaseUrl}/productos/${id}`, {
            method: 'DELETE',
            headers: buildHeaders(),
        }).then(handleResponse),
};

// ── Clientes ──────────────────────────────────────────────────
const clientesService = {
    getAll: () =>
        fetch(`${apiBaseUrl}/clientes`, { headers: buildHeaders() }).then(handleResponse),

    getById: (id) =>
        fetch(`${apiBaseUrl}/clientes/${id}`, { headers: buildHeaders() }).then(handleResponse),

    create: (data) =>
        fetch(`${apiBaseUrl}/clientes`, {
            method: 'POST',
            headers: buildHeaders(),
            body: JSON.stringify(data),
        }).then(handleResponse),

    update: (id, data) =>
        fetch(`${apiBaseUrl}/clientes/${id}`, {
            method: 'PUT',
            headers: buildHeaders(),
            body: JSON.stringify(data),
        }).then(handleResponse),

    remove: (id) =>
        fetch(`${apiBaseUrl}/clientes/${id}`, {
            method: 'DELETE',
            headers: buildHeaders(),
        }).then(handleResponse),
};

// ── Pedidos ───────────────────────────────────────────────────
const pedidosService = {
    getAll: () =>
        fetch(`${apiBaseUrl}/pedidos`, { headers: buildHeaders() }).then(handleResponse),

    getById: (id) =>
        fetch(`${apiBaseUrl}/pedidos/${id}`, { headers: buildHeaders() }).then(handleResponse),

    create: (data) =>
        fetch(`${apiBaseUrl}/pedidos`, {
            method: 'POST',
            headers: buildHeaders(),
            body: JSON.stringify(data),
        }).then(handleResponse),

    update: (id, data) =>
        fetch(`${apiBaseUrl}/pedidos/${id}`, {
            method: 'PUT',
            headers: buildHeaders(),
            body: JSON.stringify(data),
        }).then(handleResponse),

    updateEstado: (id, estado) =>
        fetch(`${apiBaseUrl}/pedidos/${id}/estado`, {
            method: 'PATCH',
            headers: buildHeaders(),
            body: JSON.stringify({ estado }),
        }).then(handleResponse),

    remove: (id) =>
        fetch(`${apiBaseUrl}/pedidos/${id}`, {
            method: 'DELETE',
            headers: buildHeaders(),
        }).then(handleResponse),
};