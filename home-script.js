document.addEventListener("DOMContentLoaded", () => {
  // Menú móvil toggle
  const menuToggle = document.querySelector(".menu-toggle")
  const navMenu = document.querySelector("nav ul")

  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active")

      // Cambiar icono del menú
      const icon = menuToggle.querySelector("i")
      if (icon.classList.contains("fa-bars")) {
        icon.classList.remove("fa-bars")
        icon.classList.add("fa-times")
      } else {
        icon.classList.remove("fa-times")
        icon.classList.add("fa-bars")
      }
    })
  }

  // Cerrar menú al hacer clic en un enlace
  const navLinks = document.querySelectorAll("nav a")
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("active")

      // Restaurar icono del menú
      const icon = menuToggle.querySelector("i")
      icon.classList.remove("fa-times")
      icon.classList.add("fa-bars")
    })
  })

  // Animación de scroll suave para enlaces internos
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault()

      const targetId = this.getAttribute("href")
      if (targetId === "#") return

      const targetElement = document.querySelector(targetId)
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 70,
          behavior: "smooth",
        })
      }
    })
  })

  // Tabs de facultades y otras secciones
  const allTabs = document.querySelectorAll(".faculty-tab")
  const allContents = document.querySelectorAll(".faculty-content")

  allTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      // Obtener el grupo de tabs al que pertenece este tab
      const parentContainer = tab.closest(".container")

      // Remover clase active de todos los tabs en este grupo
      const siblingTabs = parentContainer.querySelectorAll(".faculty-tab")
      siblingTabs.forEach((t) => t.classList.remove("active"))

      // Añadir clase active al tab clickeado
      tab.classList.add("active")

      // Ocultar todos los contenidos en este grupo
      const siblingContents = parentContainer.querySelectorAll(".faculty-content")
      siblingContents.forEach((content) => content.classList.remove("active"))

      // Mostrar el contenido correspondiente
      const faculty = tab.getAttribute("data-faculty")
      const contentElement = document.getElementById(`${faculty}-content`)
      if (contentElement) {
        contentElement.classList.add("active")
      }
    })
  })

  // Funcionalidad de búsqueda
  const searchForm = document.getElementById("search-form")
  const searchInput = document.getElementById("search-input")

  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault()
      const searchTerm = searchInput.value.toLowerCase().trim()

      if (searchTerm.length < 2) {
        alert("Por favor ingresa al menos 2 caracteres para buscar.")
        return
      }

      // Implementar la búsqueda
      searchContent(searchTerm)
    })
  }

  function searchContent(term) {
    // Obtener todos los elementos de contenido
    const contentCards = document.querySelectorAll(".content-card, .experience-card")
    let resultsFound = false

    // Si el término de búsqueda está vacío, mostrar todas las tarjetas
    if (term.length === 0) {
      contentCards.forEach((card) => {
        card.style.display = "block"
      })
      return
    }

    // Recorrer cada tarjeta y verificar si contiene el término de búsqueda
    contentCards.forEach((card) => {
      const title = card.querySelector("h3").textContent.toLowerCase()
      const description = card.querySelector("p") ? card.querySelector("p").textContent.toLowerCase() : ""

      if (title.includes(term) || description.includes(term)) {
        card.style.display = "block"
        resultsFound = true

        // Resaltar la sección correspondiente
        const sectionId = findParentSectionId(card)
        if (sectionId) {
          const section = document.getElementById(sectionId)
          if (section) {
            setTimeout(() => {
              section.scrollIntoView({ behavior: "smooth" })
            }, 300)
          }
        }
      } else {
        card.style.display = "none"
      }
    })

    if (!resultsFound) {
      alert("No se encontraron resultados para: " + term)
      // Restaurar la visualización de todas las tarjetas
      contentCards.forEach((card) => {
        card.style.display = "block"
      })
    }
  }

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const searchTerm = searchInput.value.toLowerCase().trim()
      searchContent(searchTerm)
    })
  }

  function findParentSectionId(element) {
    let current = element
    while (current) {
      const parent = current.parentElement
      if (
        parent &&
        parent.id &&
        (parent.id === "universidad" ||
          parent.id === "valores" ||
          parent.id === "carreras" ||
          parent.id === "perfiles" ||
          parent.id === "experiencias")
      ) {
        return parent.id
      }
      current = parent
    }
    return null
  }

  // Animación al hacer scroll
  const animateOnScroll = () => {
    const elements = document.querySelectorAll(".content-card, .feature-card, .instruction-card, .experience-card")

    elements.forEach((element) => {
      const elementPosition = element.getBoundingClientRect().top
      const screenPosition = window.innerHeight / 1.3

      if (elementPosition < screenPosition) {
        element.style.opacity = "1"
        element.style.transform = "translateY(0)"
      }
    })
  }

  // Inicializar animaciones
  window.addEventListener("scroll", animateOnScroll)
  window.addEventListener("load", animateOnScroll)

  // Detectar si es un dispositivo móvil para optimizaciones
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

  if (isMobile) {
    document.body.classList.add("mobile-device")
  }

  // Añadir manejo de clics en marcadores protegidos
  const protectedMarkers = document.querySelectorAll(".marker-protection")

  protectedMarkers.forEach((marker) => {
    marker.addEventListener("click", (e) => {
      // Evitar que el clic se propague a otros elementos
      e.stopPropagation()

      // Mostrar mensaje informativo
      const sectionId = findParentSectionId(marker)
      let downloadLink = "#"

      // Determinar qué enlace de descarga corresponde a esta sección
      if (sectionId === "universidad") {
        downloadLink = "docs/marcadores-universidad.pdf"
      } else if (sectionId === "valores") {
        downloadLink = "docs/marcadores-valores.pdf"
      } else if (sectionId === "carreras") {
        downloadLink = "docs/marcadores-carreras.pdf"
      } else if (sectionId === "perfiles") {
        downloadLink = "docs/marcadores-perfiles.pdf"
      }

      // Preguntar si desea descargar los marcadores
      if (
        confirm(
          "Esta es solo una vista previa del marcador. Para usar la experiencia AR, necesitas descargar e imprimir los marcadores. ¿Deseas descargar los marcadores ahora?",
        )
      ) {
        window.location.href = downloadLink
      }
    })
  })

  // Añadir variación aleatoria a la rotación de los marcadores
  const protectedMarkersImg = document.querySelectorAll(".marker-protection img")

  protectedMarkersImg.forEach((markerImg) => {
    // Asignar un retraso aleatorio a cada marcador para que no roten todos sincronizados
    const randomDelay = Math.random() * 2 // Retraso entre 0 y 2 segundos
    markerImg.style.animationDelay = `${randomDelay}s`

    // Asignar una duración ligeramente diferente a cada marcador
    const randomDuration = 2.5 + Math.random() * 1 // Duración entre 2.5 y 3.5 segundos
    markerImg.style.animationDuration = `${randomDuration}s`
  })
})
