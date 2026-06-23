const API_URL = 'https://productsapi-9esw.onrender.com';

// Elementos del DOM
const contenedorProductos = document.getElementById('contenedor-productos');
const contenidoCarrito = document.getElementById('contenido-carrito');
const totalGeneralEl = document.getElementById('total-general');
const btnVaciar = document.getElementById('btn-vaciar');

// Al cargar la página, traer los datos
document.addEventListener('DOMContentLoaded', () => {
    obtenerProductos();
    obtenerCarrito();
});

// 1. Obtener y mostrar productos de la API
async function obtenerProductos() {
    try {
        const res = await fetch(`${API_URL}/api/products`);
        const { data } = await res.json();
        
        
        
        contenedorProductos.innerHTML = '';
        
        data.forEach(prod => {
            const card = document.createElement('div');
            card.classList.add('producto-card');
            card.innerHTML = `
                <div>
                    <h3>${prod.name}</h3>
                    <p class="precio">$${prod.price}</p>
                    <p style="font-size: 0.8rem; color: #64748b; margin-bottom: 1rem;">Stock: ${prod.stock}</p>
                </div>
                <button class="btn-agregar" onclick="agregarAlCarrito(${prod.id})">Agregar al carrito</button>
            `;
            contenedorProductos.appendChild(card);
        });

        const primerProducto = document.querySelector('#contenedor-productos .producto-card:nth-child(1) button');
        console.log(primerProducto);
    } catch (error) {
        contenedorProductos.innerHTML = '<p class="danger">Error al conectar con el servidor.</p>';
        console.error(error);
    }
}

// 2. Obtener y mostrar el carrito junto con el total
async function obtenerCarrito() {
    try {
        // Carrito actual
        const res = await fetch(`${API_URL}/api/carrito`);
        const carrito = await res.json();

        // El total del carrito
        const res2 = await fetch(`${API_URL}/api/carrito/total`);
        const {data: {total}} = await res2.json();

        contenidoCarrito.innerHTML = '';
        

        // Manejo de la estructura de respuesta que tiene la propiedad .productos
        const listaProductos = carrito.data || data;
        const total_general = total !== undefined ? total : 0;

        if (listaProductos.length === 0) {
            contenidoCarrito.innerHTML = '<p class="cargando">El carrito está vacío.</p>';
            totalGeneralEl.textContent = '0.00';
            return;
        }

        listaProductos.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('item-carrito');
            itemDiv.innerHTML = `
                <div class="item-detalles">
                    <h4>${item.name}</h4>
                    <p style="font-size: 0.85rem; color: #64748b;">$${item.price} c/u</p>
                </div>
                <div class="item-controles">
                    <input type="number" min="1" value="${item.cantidad}" 
                        onchange="actualizarCantidad(${item.carrito_id}, this.value)">
                    <button class="btn-eliminar" onclick="eliminarDelCarrito(${item.carrito_id})">🗑️</button>
                </div>
            `;
            contenidoCarrito.appendChild(itemDiv);
        });
        totalGeneralEl.textContent = total;

    } catch (error) {
        console.error("Error al obtener el carrito:", error);
    }
}

// 3. Agregar un producto al carrito (POST)
async function agregarAlCarrito(productoId) {
    try {
        const res = await fetch(`${API_URL}/api/carrito/agregar/${productoId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cantidad: 1 })
        });
        
        const data = await res.json();
        if (!res.ok) alert(data.error || 'No se pudo agregar');
        
        obtenerCarrito(); // Recargar vista del carrito
    } catch (error) {
        console.error(error);
    }
}

// 4. Actualizar cantidad (PUT)
async function actualizarCantidad(carritoId, nuevaCantidad) {
    if (nuevaCantidad <= 0) return;
    try {
        const res = await fetch(`${API_URL}/api/carrito/actualizar/${carritoId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cantidad: parseInt(nuevaCantidad) })
        });
        
        const data = await res.json();
        if (!res.ok) alert(data.error || 'No se pudo actualizar');
        
        obtenerCarrito();
    } catch (error) {
        console.error(error);
    }
}

// 5. Eliminar un producto del carrito (PUT)
async function eliminarDelCarrito(carritoId) {
    try {
        await fetch(`${API_URL}/api/carrito/eliminar/${carritoId}`, { method: 'PUT' });
        obtenerCarrito();
    } catch (error) {
        console.error(error);
    }
}

// 6. Vaciar todo el carrito (DELETE)
btnVaciar.addEventListener('click', async () => {
    if (!confirm('¿Estás seguro de que deseas vaciar el carrito?')) return;
    try {
        await fetch(`${API_URL}/api/carrito/vaciar`, { method: 'DELETE' });
        obtenerCarrito();
    } catch (error) {
        console.error(error);
    }
});