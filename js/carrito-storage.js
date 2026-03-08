const carritoStorage = (() => {
    const KEY = 'carrito';

    const normalizarItem = (item) => ({
        id: Number(item.id),
        nombre: String(item.nombre || ''),
        precio: Number(item.precio) || 0,
        cantidad: Math.max(1, Number(item.cantidad) || 1),
        imagen: String(item.imagen || ''),
    });

    const leer = () => {
        try {
            const data = JSON.parse(localStorage.getItem(KEY)) || [];
            if (!Array.isArray(data)) return [];
            return data.map(normalizarItem).filter((item) => Number.isFinite(item.id));
        } catch (_error) {
            return [];
        }
    };

    const guardar = (carrito) => {
        localStorage.setItem(KEY, JSON.stringify(carrito));
    };

    const contar = () => leer().reduce((acc, item) => acc + (Number(item.cantidad) || 0), 0);

    const agregar = (producto) => {
        const carrito = leer();
        const productoNormalizado = normalizarItem({ ...producto, cantidad: 1 });
        if (!Number.isFinite(productoNormalizado.id)) return carrito;

        const existente = carrito.find((item) => String(item.id) === String(productoNormalizado.id));

        if (existente) {
            existente.cantidad += 1;
        } else {
            carrito.push(productoNormalizado);
        }

        guardar(carrito);
        return carrito;
    };

    const eliminar = (idProducto) => {
        const carrito = leer().filter((item) => String(item.id) !== String(idProducto));
        guardar(carrito);
        return carrito;
    };

    const actualizarCantidad = (idProducto, cantidad) => {
        const carrito = leer();
        const index = carrito.findIndex((item) => String(item.id) === String(idProducto));
        if (index === -1) return carrito;

        if (cantidad <= 0) {
            carrito.splice(index, 1);
        } else {
            carrito[index].cantidad = cantidad;
        }

        guardar(carrito);
        return carrito;
    };

    const limpiar = () => localStorage.removeItem(KEY);

    return {
        key: KEY,
        leer,
        guardar,
        contar,
        agregar,
        eliminar,
        actualizarCantidad,
        limpiar,
    };
})();
