const sessionService = {
    // Guarda los datos del usuario en localStorage después del login
    guardar: (data) => localStorage.setItem('userLogin', JSON.stringify(data)),

    // Obtiene los datos del usuario activo desde localStorage
    obtener: () => JSON.parse(localStorage.getItem('userLogin')),

    // Elimina la sesión (logout)
    cerrar: () => localStorage.removeItem('userLogin'),

    // Retorna true si hay una sesión activa
    estaActivo: () => !!localStorage.getItem('userLogin'),

    // Protege una página: si no hay sesión redirige al login
    // Llamar al inicio de cada página del dashboard
    protegerPagina: () => {
        if (!localStorage.getItem('userLogin')) {
            window.location.href = 'login.html';
        }
    },
};