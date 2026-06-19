const CONFIG = {
  DURACION_ALERTA: 8000,
  DURACION_ANIMACION: 150
};

function obtenerHoraActual() {
  return new Date().toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

function actualizarEstado(mensaje, tipo = "") {
  const estado = document.getElementById("estado");
  if (!estado) return;

  estado.className = `estado ${tipo}`.trim();
  estado.innerHTML = mensaje;
}

function animarBotonSOS() {
  const boton = document.querySelector(".sos");
  if (!boton) return;

  boton.style.transform = "scale(0.95)";
  setTimeout(() => {
    boton.style.transform = "";
  }, CONFIG.DURACION_ANIMACION);
}

function actualizarContador() {
  const contador = document.getElementById("contador");
  if (!contador) return;

  const total = Number(localStorage.getItem("totalSOS")) || 0;
  contador.textContent = `SOS enviados: ${total}`;
}

function actualizarHistorial() {
  const lista = document.getElementById("listaHistorial");
  if (!lista) return;

  const historial = JSON.parse(localStorage.getItem("historialSOS")) || [];
  lista.innerHTML = "";

  historial.slice().reverse().forEach((item) => {
    const li = document.createElement("li");
    li.textContent = `${item.fecha} · ${item.hora}`;
    lista.appendChild(li);
  });
}

function guardarHistorial(hora) {
  const fecha = new Date().toLocaleDateString("es-PE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });

  const historial = JSON.parse(localStorage.getItem("historialSOS")) || [];
  historial.push({ fecha, hora });
  localStorage.setItem("historialSOS", JSON.stringify(historial));

  actualizarHistorial();
}

function enviarSOS() {
  const boton = document.querySelector(".sos");
  if (!boton) return;

  const hora = obtenerHoraActual();

  let total = Number(localStorage.getItem("totalSOS")) || 0;
  total += 1;
  localStorage.setItem("totalSOS", String(total));

  actualizarContador();
  guardarHistorial(hora);
  actualizarEstado(`🚨 Alerta SOS enviada a tu red · ${hora}`, "alerta");
  animarBotonSOS();

  boton.disabled = true;

  setTimeout(() => {
    actualizarEstado("✅ Sistema activo");
    boton.disabled = false;
  }, CONFIG.DURACION_ALERTA);
}

function inicializarApp() {
  actualizarContador();
  actualizarHistorial();

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const ubicacion = document.getElementById("ubicacion");
        if (ubicacion) {
          ubicacion.textContent = `📍 Lat: ${pos.coords.latitude.toFixed(4)} · Lon: ${pos.coords.longitude.toFixed(4)}`;
        }
      },
      () => {
        const ubicacion = document.getElementById("ubicacion");
        if (ubicacion) {
          ubicacion.textContent = "📍 Ubicación no disponible";
        }
      }
    );
  }

  try {
    const alarma = new Audio("alarma.mp3");
    alarma.play().catch(() => {});
  } catch (error) {
    console.warn("No se pudo reproducir la alarma:", error);
  }

  if ("Notification" in window) {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        new Notification("SOS enviado");
      }
    });
  }
}

inicializarApp();