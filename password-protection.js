// Función para proteger el enlace de Perfiles Profesionales con contraseña
document.addEventListener("DOMContentLoaded", () => {
  // Seleccionar el enlace específico de Perfiles Profesionales
  const perfilesLink = document.querySelector('a[href="Perfiles_AR/ar-viewer.html"]')

  if (perfilesLink) {
    // Reemplazar el comportamiento predeterminado del enlace
    perfilesLink.addEventListener("click", function (event) {
      event.preventDefault()

      // Solicitar contraseña
      const password = prompt("Esta sección está en desarrollo. Por favor, ingrese la contraseña para acceder:")

      // Verificar contraseña (puedes cambiar 'acceso123' por la contraseña que prefieras)
      if (password === "acceso123") {
        // Si la contraseña es correcta, redirigir a la página
        window.location.href = this.getAttribute("href")
      } else if (password !== null) {
        // Si la contraseña es incorrecta (y el usuario no canceló)
        alert("Contraseña incorrecta. Acceso denegado.")
      }
    })

    // Opcional: Añadir un indicador visual de que está protegido
    const lockIcon = document.createElement("i")
    lockIcon.className = "fas fa-lock"
    lockIcon.style.marginLeft = "5px"
    perfilesLink.appendChild(lockIcon)
  }
})
