const anio = document.getElementById("anio");
anio.textContent = new Date().getFullYear();

const tarjetasProyecto = document.querySelectorAll(".tarjeta-proyecto");

tarjetasProyecto.forEach((tarjeta) => {
  tarjeta.addEventListener("mouseenter", () => {
    tarjeta.style.filter = "brightness(1.05)";
  });

  tarjeta.addEventListener("mouseleave", () => {
    tarjeta.style.filter = "brightness(1)";
  });
});