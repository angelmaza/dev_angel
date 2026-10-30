"use client";

import React, { useState } from "react";
import "./vane.css";

interface Producto {
  id: string;
  nombre: string;
  categoria: "clothing" | "accessories";
  precio: string;
  imagen: string;
  textoAlt: string;
}

const PRODUCTOS: Producto[] = [
  {
    id: "mochila",
    nombre: "Mochila Vane",
    categoria: "accessories",
    precio: "189€",
    imagen: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600&auto=format&fit=crop",
    textoAlt: "mochila de diseño"
  },
  {
    id: "abrigo",
    nombre: "Abrigo Lana",
    categoria: "clothing",
    precio: "420€",
    imagen: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=600&auto=format&fit=crop",
    textoAlt: "abrigo de corte clásico"
  },
  {
    id: "cartera",
    nombre: "Cartera Cuero",
    categoria: "accessories",
    precio: "95€",
    imagen: "https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=600&auto=format&fit=crop",
    textoAlt: "cartera de mano"
  }
];

export default function PaginaVane() {
  const [filtro, setFiltro] = useState<"all" | "clothing" | "accessories">("all");
  const [bolsa, setBolsa] = useState<Producto[]>([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [bolsaAbierta, setBolsaAbierta] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  
  // Estado del formulario
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [talla, setTalla] = useState("M");
  const [mensaje, setMensaje] = useState("");
  const [enviado, setEnviado] = useState(false);

  function manejarClicReservar(producto: Producto) {
    setProductoSeleccionado(producto);
    setModalAbierto(true);
  }

  function manejarReservaGenerica() {
    setProductoSeleccionado(null);
    setModalAbierto(true);
  }

  function agregarABolsa(producto: Producto, e: React.MouseEvent) {
    e.stopPropagation();
    if (!bolsa.some(elemento => elemento.id === producto.id)) {
      setBolsa([...bolsa, producto]);
    }
  }

  function quitarDeBolsa(idProducto: string) {
    setBolsa(bolsa.filter(elemento => elemento.id !== idProducto));
  }

  function manejarEnvio(e: React.FormEvent) {
    e.preventDefault();
    if (nombre.trim() && correo.trim()) {
      setEnviado(true);
      setTimeout(() => {
        // Reiniciar el estado
        setNombre("");
        setCorreo("");
        setMensaje("");
        setEnviado(false);
        setModalAbierto(false);
        
        // Si había un producto elegido, se añade a la bolsa como reservado
        if (productoSeleccionado && !bolsa.some(elemento => elemento.id === productoSeleccionado.id)) {
          setBolsa(anterior => [...anterior, productoSeleccionado]);
        }
      }, 2500);
    }
  }

  return (
    <div className="vane-body min-h-screen">
      
      {/* Cabecera de navegación */}
      <nav className="navhead">
        <a href="#" className="nav-brand">VANE</a>
        
        <div className="nav-links">
          <div className="navdiv"><a href="#">Home</a></div>
          <div className="navdiv">
            <button onClick={manejarReservaGenerica} className="cart-icon-btn" style={{ textTransform: "uppercase" }}>
              Reserva
            </button>
          </div>
          <div className="navdiv">
            <button onClick={() => setBolsaAbierta(true)} className="cart-icon-btn">
              Bolsa <span className="cart-count">{bolsa.length}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Separator
      <div className="separadorblack" style={{ marginTop: "60px" }}></div> */}

      {/* Portada */}
      <header className="seccionhead">
        <h1>LA VANE</h1>
      </header>

      {/* Filtros del catálogo */}
      <div className="filter-tabs">
        <button 
          onClick={() => setFiltro("all")} 
          className={`filter-btn ${filtro === "all" ? "active" : ""}`}
        >
          Todo
        </button>
        <button 
          onClick={() => setFiltro("clothing")} 
          className={`filter-btn ${filtro === "clothing" ? "active" : ""}`}
        >
          Ropa
        </button>
        <button 
          onClick={() => setFiltro("accessories")} 
          className={`filter-btn ${filtro === "accessories" ? "active" : ""}`}
        >
          Accesorios
        </button>
      </div>

      {/* Rejilla alterna */}
      <section className="grid">
        
        {/* Caja 1: Mochila (visible con "todo" o "accesorios") */}
        {(filtro === "all" || filtro === "accessories") ? (
          <div className="bg-blanco gridimg">
            <div className="gridimg-inner">
              <img src={PRODUCTOS[0].imagen} alt={PRODUCTOS[0].textoAlt} className="product-img" />
              <div className="product-overlay">
                <h3 className="product-overlay-title">{PRODUCTOS[0].nombre}</h3>
                <span className="product-overlay-price">{PRODUCTOS[0].precio}</span>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button onClick={() => manejarClicReservar(PRODUCTOS[0])} className="reserve-btn">Reservar</button>
                  <button onClick={(e) => agregarABolsa(PRODUCTOS[0], e)} className="reserve-btn" style={{ background: "transparent", color: "white", border: "1px solid white" }}>Añadir</button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-negro gridtxt">Exclusividad en cada detalle.</div>
        )}

        {/* Caja 2: texto 1 (fondo negro) */}
        <div className="bg-negro gridtxt">
          Diseñamos para quienes entienden el estilo.
        </div>

        {/* Caja 3: texto 2 (fondo negro) */}
        <div className="bg-negro gridtxt">
          Cada pieza está pensada para durar más allá de una temporada. No seguimos tendencias: construimos identidad.
        </div>

        {/* Caja 4: Abrigo (visible con "todo" o "ropa") */}
        {(filtro === "all" || filtro === "clothing") ? (
          <div className="bg-blanco gridimg">
            <div className="gridimg-inner">
              <img src={PRODUCTOS[1].imagen} alt={PRODUCTOS[1].textoAlt} className="product-img" />
              <div className="product-overlay">
                <h3 className="product-overlay-title">{PRODUCTOS[1].nombre}</h3>
                <span className="product-overlay-price">{PRODUCTOS[1].precio}</span>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button onClick={() => manejarClicReservar(PRODUCTOS[1])} className="reserve-btn">Reservar</button>
                  <button onClick={(e) => agregarABolsa(PRODUCTOS[1], e)} className="reserve-btn" style={{ background: "transparent", color: "white", border: "1px solid white" }}>Añadir</button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-negro gridtxt">Sostenibilidad y calidad.</div>
        )}

        {/* Caja 5: Cartera (visible con "todo" o "accesorios") */}
        {(filtro === "all" || filtro === "accessories") ? (
          <div className="bg-blanco gridimg">
            <div className="gridimg-inner">
              <img src={PRODUCTOS[2].imagen} alt={PRODUCTOS[2].textoAlt} className="product-img" />
              <div className="product-overlay">
                <h3 className="product-overlay-title">{PRODUCTOS[2].nombre}</h3>
                <span className="product-overlay-price">{PRODUCTOS[2].precio}</span>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button onClick={() => manejarClicReservar(PRODUCTOS[2])} className="reserve-btn">Reservar</button>
                  <button onClick={(e) => agregarABolsa(PRODUCTOS[2], e)} className="reserve-btn" style={{ background: "transparent", color: "white", border: "1px solid white" }}>Añadir</button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-negro gridtxt">Lorem ipsum dolor, sit amet consectetur adipisicing elit. In nobis atque id praesentium.</div>
        )}

        {/* Caja 6: texto 3 (fondo negro) */}
        <div className="bg-negro gridtxt">
          Lorem ipsum dolor, sit amet consectetur adipisicing elit. In nobis atque id praesentium.
        </div>

      </section>

      <footer className="vane-footer">
        <div>
          © {new Date().getFullYear()} THE VANE. ALL RIGHTS RESERVED.
        </div>
      </footer>

      {/* Formulario de reserva */}
      {modalAbierto && (
        <div className="vane-modal-overlay" onClick={() => setModalAbierto(false)}>
          <div className="vane-modal" onClick={(e) => e.stopPropagation()}>
            <button className="vane-modal-close" onClick={() => setModalAbierto(false)}>
              ×
            </button>
            
            <div className="vane-modal-content">
              {enviado ? (
                <div className="success-state">
                  <span className="success-state-icon">✓</span>
                  <h3 className="vane-modal-title">¡Reserva Completada!</h3>
                  <p style={{ fontFamily: "var(--font-sans)", color: "var(--texto-secundario)", fontSize: "0.95rem" }}>
                    Hemos recibido tus datos con éxito. Te enviaremos un correo electrónico de confirmación a la brevedad.
                  </p>
                </div>
              ) : (
                <>
                  <h2 className="vane-modal-title">
                    {productoSeleccionado ? `Reservar ${productoSeleccionado.nombre}` : "Solicitar Reserva"}
                  </h2>
                  <p className="vane-modal-subtitle">
                    {productoSeleccionado ? `${productoSeleccionado.categoria} · ${productoSeleccionado.precio}` : "Servicio de sastrería y asesoría privada"}
                  </p>

                  <form className="vane-form" onSubmit={manejarEnvio}>
                    <div className="vane-form-group">
                      <label htmlFor="vane-name">Nombre Completo</label>
                      <input 
                        type="text" 
                        id="vane-name" 
                        className="vane-input" 
                        required 
                        placeholder="Ej. Pepe Bótica"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                      />
                    </div>

                    <div className="vane-form-group">
                      <label htmlFor="vane-email">Correo Electrónico</label>
                      <input 
                        type="email" 
                        id="vane-email" 
                        className="vane-input" 
                        required 
                        placeholder="ejemplo@correo.com"
                        value={correo}
                        onChange={(e) => setCorreo(e.target.value)}
                      />
                    </div>

                    {productoSeleccionado && productoSeleccionado.categoria === "clothing" && (
                      <div className="vane-form-group">
                        <label htmlFor="vane-size">Talla sugerida</label>
                        <select 
                          id="vane-size" 
                          className="vane-select"
                          value={talla}
                          onChange={(e) => setTalla(e.target.value)}
                        >
                          <option value="XS">XS</option>
                          <option value="S">S</option>
                          <option value="M">M</option>
                          <option value="L">L</option>
                          <option value="XL">XL</option>
                        </select>
                      </div>
                    )}

                    <div className="vane-form-group">
                      <label htmlFor="vane-msg">Mensaje o especificaciones</label>
                      <textarea 
                        id="vane-msg" 
                        className="vane-textarea" 
                        placeholder="Indícanos si necesitas algún ajuste a medida o notas de entrega..."
                        value={mensaje}
                        onChange={(e) => setMensaje(e.target.value)}
                      />
                    </div>

                    <button type="submit" className="vane-submit-btn">
                      Confirmar Reserva
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Carrito */}
      {bolsaAbierta && (
        <div className="vane-modal-overlay" onClick={() => setBolsaAbierta(false)}>
          <div className="vane-modal" onClick={(e) => e.stopPropagation()}>
            <button className="vane-modal-close" onClick={() => setBolsaAbierta(false)}>
              ×
            </button>
            
            <div className="vane-modal-content">
              <h2 className="vane-modal-title">Mi Bolsa de Reserva</h2>
              <p className="vane-modal-subtitle">Prendas seleccionadas ({bolsa.length})</p>

              {bolsa.length === 0 ? (
                <p style={{ fontFamily: "var(--font-sans)", color: "var(--texto-secundario)", textAlign: "center", padding: "2rem 0" }}>
                  Tu bolsa de reserva está vacía. Navega por el catálogo y añade productos.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginBottom: "2rem" }}>
                  {bolsa.map((elemento) => (
                    <div key={elemento.id} style={{ display: "flex", gap: "1rem", alignItems: "center", borderBottom: "1px solid var(--color-blanco-suave)", paddingBottom: "1rem" }}>
                      <img src={elemento.imagen} alt={elemento.textoAlt} style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "2px" }} />
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, fontFamily: "var(--fuente-serif-cuerpo)", fontSize: "1.1rem" }}>{elemento.nombre}</h4>
                        <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", color: "var(--color-dorado)" }}>{elemento.precio}</span>
                      </div>
                      <button 
                        onClick={() => quitarDeBolsa(elemento.id)} 
                        style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem", color: "#ef4444" }}
                        title="Eliminar"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  
                  <button 
                    onClick={() => {
                      setBolsaAbierta(false);
                      setModalAbierto(true);
                    }} 
                    className="vane-submit-btn"
                  >
                    Completar Reserva de la Bolsa
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
