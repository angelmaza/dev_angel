"use client";

import React, { useState } from "react";
import "./vane.css";

interface Product {
  id: string;
  name: string;
  category: "clothing" | "accessories";
  price: string;
  image: string;
  alt: string;
}

const PRODUCTS: Product[] = [
  {
    id: "mochila",
    name: "Mochila Vane",
    category: "accessories",
    price: "189€",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600&auto=format&fit=crop",
    alt: "mochila de diseño"
  },
  {
    id: "abrigo",
    name: "Abrigo Lana",
    category: "clothing",
    price: "420€",
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=600&auto=format&fit=crop",
    alt: "abrigo de corte clásico"
  },
  {
    id: "cartera",
    name: "Cartera Cuero",
    category: "accessories",
    price: "95€",
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=600&auto=format&fit=crop",
    alt: "cartera de mano"
  }
];

export default function VanePage() {
  const [filter, setFilter] = useState<"all" | "clothing" | "accessories">("all");
  const [cart, setCart] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedItem] = useState<Product | null>(null);
  
  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [size, setSize] = useState("M");
  const [msg, setMsg] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleReserveClick(product: Product) {
    setSelectedItem(product);
    setIsModalOpen(true);
  }

  function handleGenericReserve() {
    setSelectedItem(null);
    setIsModalOpen(true);
  }

  function handleAddToCart(product: Product, e: React.MouseEvent) {
    e.stopPropagation();
    if (!cart.some(item => item.id === product.id)) {
      setCart([...cart, product]);
    }
  }

  function handleRemoveFromCart(productId: string) {
    setCart(cart.filter(item => item.id !== productId));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim() && email.trim()) {
      setSubmitted(true);
      setTimeout(() => {
        // Reset states
        setName("");
        setEmail("");
        setMsg("");
        setSubmitted(false);
        setIsModalOpen(false);
        
        // Add to cart as reserved if product was selected
        if (selectedProduct && !cart.some(item => item.id === selectedProduct.id)) {
          setCart(prev => [...prev, selectedProduct]);
        }
      }, 2500);
    }
  }

  return (
    <div className="vane-body min-h-screen">
      
      {/* Navigation Header */}
      <nav className="navhead">
        <a href="#" className="nav-brand">VANE</a>
        
        <div className="nav-links">
          <div className="navdiv"><a href="#">Home</a></div>
          <div className="navdiv">
            <button onClick={handleGenericReserve} className="cart-icon-btn" style={{ textTransform: "uppercase" }}>
              Reserva
            </button>
          </div>
          <div className="navdiv">
            <button onClick={() => setIsCartOpen(true)} className="cart-icon-btn">
              Bolsa <span className="cart-count">{cart.length}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Separator
      <div className="separadorblack" style={{ marginTop: "60px" }}></div> */}

      {/* Hero Banner Section */}
      <header className="seccionhead">
        <h1>LA VANE</h1>
      </header>

      {/* Modern Catalog Filter Controls */}
      <div className="filter-tabs">
        <button 
          onClick={() => setFilter("all")} 
          className={`filter-btn ${filter === "all" ? "active" : ""}`}
        >
          Todo
        </button>
        <button 
          onClick={() => setFilter("clothing")} 
          className={`filter-btn ${filter === "clothing" ? "active" : ""}`}
        >
          Ropa
        </button>
        <button 
          onClick={() => setFilter("accessories")} 
          className={`filter-btn ${filter === "accessories" ? "active" : ""}`}
        >
          Accesorios
        </button>
      </div>

      {/* Alternate Grid Section */}
      <section className="grid">
        
        {/* Box 1: Mochila (Visible when all or accessories) */}
        {(filter === "all" || filter === "accessories") ? (
          <div className="bg-blanco gridimg">
            <div className="gridimg-inner">
              <img src={PRODUCTS[0].image} alt={PRODUCTS[0].alt} className="product-img" />
              <div className="product-overlay">
                <h3 className="product-overlay-title">{PRODUCTS[0].name}</h3>
                <span className="product-overlay-price">{PRODUCTS[0].price}</span>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button onClick={() => handleReserveClick(PRODUCTS[0])} className="reserve-btn">Reservar</button>
                  <button onClick={(e) => handleAddToCart(PRODUCTS[0], e)} className="reserve-btn" style={{ background: "transparent", color: "white", border: "1px solid white" }}>Añadir</button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-negro gridtxt">Exclusividad en cada detalle.</div>
        )}

        {/* Box 2: Text 1 (Black Bg) */}
        <div className="bg-negro gridtxt">
          Diseñamos para quienes entienden el estilo.
        </div>

        {/* Box 3: Text 2 (Black Bg) */}
        <div className="bg-negro gridtxt">
          Cada pieza está pensada para durar más allá de una temporada. No seguimos tendencias: construimos identidad.
        </div>

        {/* Box 4: Abrigo (Visible when all or clothing) */}
        {(filter === "all" || filter === "clothing") ? (
          <div className="bg-blanco gridimg">
            <div className="gridimg-inner">
              <img src={PRODUCTS[1].image} alt={PRODUCTS[1].alt} className="product-img" />
              <div className="product-overlay">
                <h3 className="product-overlay-title">{PRODUCTS[1].name}</h3>
                <span className="product-overlay-price">{PRODUCTS[1].price}</span>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button onClick={() => handleReserveClick(PRODUCTS[1])} className="reserve-btn">Reservar</button>
                  <button onClick={(e) => handleAddToCart(PRODUCTS[1], e)} className="reserve-btn" style={{ background: "transparent", color: "white", border: "1px solid white" }}>Añadir</button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-negro gridtxt">Sostenibilidad y calidad.</div>
        )}

        {/* Box 5: Cartera (Visible when all or accessories) */}
        {(filter === "all" || filter === "accessories") ? (
          <div className="bg-blanco gridimg">
            <div className="gridimg-inner">
              <img src={PRODUCTS[2].image} alt={PRODUCTS[2].alt} className="product-img" />
              <div className="product-overlay">
                <h3 className="product-overlay-title">{PRODUCTS[2].name}</h3>
                <span className="product-overlay-price">{PRODUCTS[2].price}</span>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button onClick={() => handleReserveClick(PRODUCTS[2])} className="reserve-btn">Reservar</button>
                  <button onClick={(e) => handleAddToCart(PRODUCTS[2], e)} className="reserve-btn" style={{ background: "transparent", color: "white", border: "1px solid white" }}>Añadir</button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-negro gridtxt">Lorem ipsum dolor, sit amet consectetur adipisicing elit. In nobis atque id praesentium.</div>
        )}

        {/* Box 6: Text 3 (Black Bg) */}
        <div className="bg-negro gridtxt">
          Lorem ipsum dolor, sit amet consectetur adipisicing elit. In nobis atque id praesentium.
        </div>

      </section>

      <footer className="vane-footer">
        <div>
          © {new Date().getFullYear()} THE VANE. ALL RIGHTS RESERVED.
        </div>
      </footer>

      {/* Form Reserva */}
      {isModalOpen && (
        <div className="vane-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="vane-modal" onClick={(e) => e.stopPropagation()}>
            <button className="vane-modal-close" onClick={() => setIsModalOpen(false)}>
              ×
            </button>
            
            <div className="vane-modal-content">
              {submitted ? (
                <div className="success-state">
                  <span className="success-state-icon">✓</span>
                  <h3 className="vane-modal-title">¡Reserva Completada!</h3>
                  <p style={{ fontFamily: "var(--font-sans)", color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                    Hemos recibido tus datos con éxito. Te enviaremos un correo electrónico de confirmación a la brevedad.
                  </p>
                </div>
              ) : (
                <>
                  <h2 className="vane-modal-title">
                    {selectedProduct ? `Reservar ${selectedProduct.name}` : "Solicitar Reserva"}
                  </h2>
                  <p className="vane-modal-subtitle">
                    {selectedProduct ? `${selectedProduct.category} · ${selectedProduct.price}` : "Servicio de sastrería y asesoría privada"}
                  </p>

                  <form className="vane-form" onSubmit={handleSubmit}>
                    <div className="vane-form-group">
                      <label htmlFor="vane-name">Nombre Completo</label>
                      <input 
                        type="text" 
                        id="vane-name" 
                        className="vane-input" 
                        required 
                        placeholder="Ej. Pepe Bótica"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

                    {selectedProduct && selectedProduct.category === "clothing" && (
                      <div className="vane-form-group">
                        <label htmlFor="vane-size">Talla sugerida</label>
                        <select 
                          id="vane-size" 
                          className="vane-select"
                          value={size}
                          onChange={(e) => setSize(e.target.value)}
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
                        value={msg}
                        onChange={(e) => setMsg(e.target.value)}
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
      {isCartOpen && (
        <div className="vane-modal-overlay" onClick={() => setIsCartOpen(false)}>
          <div className="vane-modal" onClick={(e) => e.stopPropagation()}>
            <button className="vane-modal-close" onClick={() => setIsCartOpen(false)}>
              ×
            </button>
            
            <div className="vane-modal-content">
              <h2 className="vane-modal-title">Mi Bolsa de Reserva</h2>
              <p className="vane-modal-subtitle">Prendas seleccionadas ({cart.length})</p>

              {cart.length === 0 ? (
                <p style={{ fontFamily: "var(--font-sans)", color: "var(--text-secondary)", textAlign: "center", padding: "2rem 0" }}>
                  Tu bolsa de reserva está vacía. Navega por el catálogo y añade productos.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginBottom: "2rem" }}>
                  {cart.map((item) => (
                    <div key={item.id} style={{ display: "flex", gap: "1rem", alignItems: "center", borderBottom: "1px solid var(--color-blanco-soft)", paddingBottom: "1rem" }}>
                      <img src={item.image} alt={item.alt} style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "2px" }} />
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, fontFamily: "var(--font-serif-body)", fontSize: "1.1rem" }}>{item.name}</h4>
                        <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.85rem", color: "var(--color-accent)" }}>{item.price}</span>
                      </div>
                      <button 
                        onClick={() => handleRemoveFromCart(item.id)} 
                        style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem", color: "#ef4444" }}
                        title="Eliminar"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  
                  <button 
                    onClick={() => {
                      setIsCartOpen(false);
                      setIsModalOpen(true);
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
