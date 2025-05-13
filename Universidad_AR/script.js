// Variables globales optimizadas
const synth = window.speechSynthesis
let isSpeaking = false
let isLoading = false
let activeMarker = null
let isProcessingMarker = false
let persistentMode = false
let lastScannedModelId = null
const animatedModels = {}

// Referencias DOM
const playBtn = document.getElementById("play-btn")
const stopBtn = document.getElementById("stop-btn")
const scanNewBtn = document.getElementById("scan-new-btn")
const playText = document.getElementById("play-text")
const loadingText = document.getElementById("loading-text")
const textElement = document.getElementById("valor-text")
const titleElement = document.getElementById("title")
const instructionMessage = document.getElementById("instruction-message")
const desktopWarning = document.getElementById("desktop-warning")
const landscapeWarning = document.getElementById("landscape-warning")
const container = document.getElementById("container")

// Posición original de los modelos
const originalModelPosition = "0 -1.5 0"

// Datos de contenido
const texts = {
  historia: {
    title: "Universidad: HISTORIA",
    content:
      "La Universidad Popular del Cesar, Seccional Aguachica, es una institución de educación superior dedicada a la formación integral del ser humano, con énfasis en la docencia, la investigación y la proyección social.\n\nEn sus más de 20 años de historia, ha contribuido al desarrollo educativo, científico, cultural y social del sur del Cesar y su área de influencia. Cuenta con un campus moderno, laboratorios, salas de cómputo y Biblioteca.\n\nActualmente ofrece 8 programas de pregrado: Ingeniería de Sistemas, Ingeniería Agroindustrial, Ingeniería Ambiental y Sanitaria, Administración de Empresas, Contaduría, Economía, Derecho e Ingeniería Agropecuaria, además de especializaciones, y avanza en la apertura de nuevas carreras. ",
  },
  mision: {
    title: "Universidad: MISIÓN",
    content:
      "La Universidad Popular del Cesar, como institución de educación superior oficial del orden nacional, forma personas responsables social y culturalmente; con una educación de calidad, integral e inclusiva, rigor científico y tecnológico; mediante las diferentes modalidades y metodologías de educación, a través de programas pertinentes al contexto, dentro de la diversidad de campos disciplinares, en un marco de libertad de pensamiento; que consolide la construcción de saberes, para contribuir a la solución de problemas y conflictos, en un ambiente sostenible, con visibilidad nacional e internacional.",
  },
  vision: {
    title: "Universidad: VISIÓN",
    content:
      "En el año 2025, la Universidad Popular del Cesar será una Institución de Educación Superior de alta calidad, incluyente y transformadora; comprometida en el desarrollo sustentable de la Región, con visibilidad nacional y alcance internacional. ",
  },
  escudo: {
    title: "Universidad: ESCUDO",
    content:
      "El escudo de la Universidad Popular del Cesar simboliza el conocimiento y la superación. El diamante representa la luz de la educación, mientras que el azul y el negro reflejan la búsqueda de la verdad y la lucha contra la ignorancia.\n\n Inspirado en la mitología griega, el fuego de Prometeo simboliza la inteligencia, y los laureles representan los logros culturales y académicos. \n\n El escudo se enmarca con el lema -Educación y Futuro-, destacando el compromiso de la universidad con el desarrollo y la formación integral. ",
  },
  bandera: {
    title: "Universidad: BANDERA",
    content:
      "Tiene un diseño muy sobrio pero inconfundible, porque le podemos reconocer a lo lejos que es nuestra bandera. Representa el todo y la parte, la esperanza y la blancura impoluta y guarda uniformidad con el ESCUDO ya que se haya estampado en el centro. ",
  },
  himno: {
  title: "Universidad: HIMNO",
  content:
    "El himno de la Universidad Popular del Cesar, escrito y musicalizado por la docente Martha Esther Guerra Muñoz, es una expresión poética del espíritu académico, cultural y humano de la institución.\n\n Su letra exalta valores como el humanismo, la libertad, el conocimiento y la diversidad, resaltando la importancia de la educación como faro de esperanza y transformación.\n\n Con un tono solemne y emotivo, el himno rinde homenaje a la historia, el entorno natural, y el compromiso de estudiantes y docentes con la construcción de un futuro mejor. ",
  }, 
  logo: {
    title: "Universidad: LOGO",
    content:
      "La marca gráfica es el principal signo identificador de la Universidad Popular del Cesar y está conformada por un símbolo con las letras UPC y la representación del ser humano, y el logotipo.\n\nEs la firma de la institución en la cual se manifiestan sus valores, principios y personalidad, originando un impacto y un reconocimiento en la memoria.",
  },
}

// Lista de IDs de modelos para reutilizar
const modelIds = ["historia", "mision", "vision", "escudo", "bandera", "himno", "logo"]

// Función para animar la caída del modelo desde arriba (optimizada)
function animateModelFall(modelEntity) {
  if (!modelEntity) return

  const currentPosition = modelEntity.getAttribute("position")
  const startY = 5
  const endY = currentPosition.y
  const duration = 1000
  const startTime = Date.now()

  modelEntity.setAttribute("position", `${currentPosition.x} ${startY} ${currentPosition.z}`)

  function animate() {
    const elapsedTime = Date.now() - startTime
    const progress = Math.min(elapsedTime / duration, 1)
    const easeOutQuad = (t) => t * (2 - t)
    const currentY = startY - (startY - endY) * easeOutQuad(progress)

    modelEntity.setAttribute("position", `${currentPosition.x} ${currentY} ${currentPosition.z}`)

    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }

  animate()
}

// Funciones de UI optimizadas
function updateButtonState() {
  // Ocultar todos los botones primero
  playBtn.classList.add("hidden")
  stopBtn.classList.add("hidden")
  scanNewBtn.classList.add("hidden")

  // Solo mostrar botones si hay un marcador activo
  if (activeMarker) {
    if (isSpeaking) {
      stopBtn.classList.remove("hidden")
    } else {
      playBtn.classList.remove("hidden")
      if (!isLoading) {
        playText.classList.remove("hidden")
        loadingText.classList.add("hidden")
      }
    }

    if (persistentMode) {
      scanNewBtn.classList.remove("hidden")
    }
  }
}

function showLoadingState() {
  isLoading = true
  playText.classList.add("hidden")
  loadingText.classList.remove("hidden")
  playBtn.disabled = true
}

function hideLoadingState() {
  isLoading = false
  playText.classList.remove("hidden")
  loadingText.classList.add("hidden")
  playBtn.disabled = false
}

function stopSpeaking() {
  synth.cancel()
  isSpeaking = false
  hideLoadingState()
  updateButtonState()
}

// Función para hacer que un modelo permanezca visible
function makeModelPersistent(markerId) {
  const markerKey = markerId.replace("marker-", "")
  const marker = document.querySelector(`#${markerId}`)

  lastScannedModelId = markerKey
  persistentMode = true

  if (marker) {
    const modelEntity = marker.querySelector(`#${markerKey}-model`)
    if (modelEntity) {
      modelEntity.setAttribute("visible", "true")

      if (!animatedModels[markerKey]) {
        animatedModels[markerKey] = true
        animateModelFall(modelEntity)
      }

      modelEntity.setAttribute("animation__filter", {
        property: "position",
        dur: 100,
        easing: "linear",
        loop: false,
      })

      modelEntity.classList.remove("hidden-model")
      marker.setAttribute("emitevents", "true")
      updateButtonState()
    }
  }
}

// Función para restablecer solo la posición del modelo
function resetModelPosition(markerId) {
  const markerKey = markerId.replace("marker-", "")
  const marker = document.querySelector(`#${markerId}`)

  if (marker) {
    const modelEntity = marker.querySelector(`#${markerKey}-model`)
    if (modelEntity) {
      modelEntity.setAttribute("position", originalModelPosition)
    }
  }
}

// Función para mostrar el contenido del marcador (optimizada)
function showMarkerContent(markerId) {
  if (isProcessingMarker && activeMarker && activeMarker !== markerId) {
    return
  }

  isProcessingMarker = true

  if (isSpeaking && activeMarker && activeMarker !== markerId) {
    stopSpeaking()
  }

  const markerKey = markerId.replace("marker-", "")

  // Ocultar modelo anterior si existe
  if (activeMarker && activeMarker !== markerId && lastScannedModelId) {
    const previousModelId = activeMarker.replace("marker-", "")
    const previousModel = document.querySelector(`#${previousModelId}-model`)
    if (previousModel) {
      previousModel.setAttribute("visible", "false")
    }
  }

  // Actualizar UI
  instructionMessage.classList.add("hidden")
  titleElement.classList.remove("hidden")
  textElement.classList.remove("hidden")
  titleElement.innerText = texts[markerKey].title
  textElement.innerText = texts[markerKey].content

  activeMarker = markerId

  // Solo restablecer la posición, mantener la escala original
  resetModelPosition(markerId)
  makeModelPersistent(markerId)

  setTimeout(() => {
    isProcessingMarker = false
  }, 500)
}

// Función para ocultar el contenido cuando se pierde un marcador
function hideMarkerContent(markerId) {
  if (persistentMode) return

  if (activeMarker === markerId) {
    titleElement.classList.add("hidden")
    textElement.classList.add("hidden")
    instructionMessage.classList.remove("hidden")
    activeMarker = null
    updateButtonState()
  }
}

// Funciones para gestionar modelos
function hideAllModels() {
  modelIds.forEach((id) => {
    const model = document.querySelector(`#${id}-model`)
    if (model) {
      model.setAttribute("visible", "false")
      model.classList.add("hidden-model")
    }
  })
}

function resetModelsForDetection() {
  modelIds.forEach((id) => {
    const model = document.querySelector(`#${id}-model`)
    if (model) {
      model.setAttribute("position", originalModelPosition)
      model.classList.remove("hidden-model")
      model.setAttribute("visible", "false")
      animatedModels[id] = false
    }
  })
}

// Función para resetear al modo de escaneo
function resetToScanMode() {
  hideAllModels()
  resetModelsForDetection()

  persistentMode = false
  lastScannedModelId = null

  titleElement.classList.add("hidden")
  textElement.classList.add("hidden")
  instructionMessage.classList.remove("hidden")

  activeMarker = null
  stopSpeaking()
  updateButtonState()
}

// Configurar eventos para todos los marcadores
modelIds.forEach((id) => {
  const marker = document.querySelector(`#marker-${id}`)
  if (marker) {
    marker.addEventListener("markerFound", () => showMarkerContent(`marker-${id}`))
    marker.addEventListener("markerLost", () => hideMarkerContent(`marker-${id}`))
  }
})

// Eventos de botones
playBtn.addEventListener("click", () => {
  if (textElement.innerText && !isLoading) {
    showLoadingState()

    const utterance = new SpeechSynthesisUtterance(textElement.innerText)
    utterance.lang = "es-ES"
    utterance.rate = 1.0
    utterance.pitch = 1.0

    const loadingTimeout = setTimeout(hideLoadingState, 5000)

    utterance.onstart = () => {
      clearTimeout(loadingTimeout)
      isSpeaking = true
      hideLoadingState()
      updateButtonState()
    }

    utterance.onend = () => {
      isSpeaking = false
      updateButtonState()
    }

    synth.speak(utterance)
  }
})

stopBtn.addEventListener("click", stopSpeaking)
scanNewBtn.addEventListener("click", resetToScanMode)

// Prevenir zoom en dispositivos iOS
document.addEventListener("gesturestart", (e) => e.preventDefault())

// Detección de dispositivo y orientación
function isMobileDevice() {
  return (
    window.innerWidth <= 768 ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  )
}

function isPortraitOrientation() {
  return window.innerHeight > window.innerWidth
}

function checkDeviceAndOrientation() {
  // Verificar si es un dispositivo móvil
  const isMobile = isMobileDevice()

  // Verificar si está en orientación vertical (portrait)
  const isPortrait = isPortraitOrientation()

  // Mostrar advertencia de escritorio si no es un dispositivo móvil
  if (!isMobile) {
    desktopWarning.style.display = "flex"
    landscapeWarning.style.display = "none"
    container.style.display = "none"
    return
  }

  // Mostrar advertencia de orientación si está en horizontal (landscape)
  if (!isPortrait) {
    desktopWarning.style.display = "none"
    landscapeWarning.style.display = "flex"
    container.style.display = "none"
    return
  }

  // Si es móvil y está en vertical, mostrar la aplicación
  desktopWarning.style.display = "none"
  landscapeWarning.style.display = "none"
  container.style.display = "flex"
}

// Añadir función para prevenir desplazamiento horizontal
function preventHorizontalScroll(event) {
  // Si el elemento tiene desplazamiento horizontal
  if (event.currentTarget.scrollWidth > event.currentTarget.clientWidth) {
    // Prevenir el desplazamiento horizontal
    if (event.deltaX !== 0) {
      event.preventDefault()
    }
  }
}

// Inicialización
window.addEventListener("DOMContentLoaded", () => {
  // Precarga de voces
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices()
  }

  // Preparar modelos para detección
  resetModelsForDetection()

  // Prevenir desplazamiento horizontal en el contenedor de texto
  const infoBox = document.getElementById("info-box")
  if (infoBox) {
    infoBox.addEventListener("wheel", preventHorizontalScroll, { passive: false })
    infoBox.addEventListener(
      "touchmove",
      (e) => {
        if (Math.abs(e.touches[0].clientX) > Math.abs(e.touches[0].clientY)) {
          e.preventDefault()
        }
      },
      { passive: false },
    )
  }
})

// Verificar dispositivo y orientación al cargar y cuando cambie el tamaño/orientación
window.addEventListener("load", checkDeviceAndOrientation)
window.addEventListener("resize", checkDeviceAndOrientation)
window.addEventListener("orientationchange", checkDeviceAndOrientation)

// Configurar botón de regreso
document.getElementById("back-btn").addEventListener("click", () => window.history.back())

// Añadir estilos globales para prevenir desplazamiento horizontal
document.addEventListener("DOMContentLoaded", () => {
  document.body.style.overflowX = "hidden"
  document.documentElement.style.overflowX = "hidden"
})
