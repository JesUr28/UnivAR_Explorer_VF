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
  sistemas: {
    title: "Perfil: Ingeniero de Sistemas",
    content:
      "El Ingeniero de sistemas será un profesional con sentido ético en cada labor que desempeñe, con capacidades para el trabajo en equipos interdisciplinarios lo que le permitirá desarrollar y aplicar diversas soluciones a través de las tecnologías de la información y la comunicación de manera asertiva con un enfoque global.\n Aplicará técnicas y tecnologías a la resolución de problemas relacionados con la representación, almacenamiento, gestión y comunicación de la información y del conocimiento con una visión sistémica y de respeto por el medio ambiente. ",
  },
  agroindustrial: {
    title: "Perfil: Ingeniero Agroindustrial",
    content:
      "El Ingeniero Agroindustrial de la UPCSA está en la capacidad de:\n\n Diseñar y aplicar procesos de transformación de materias primas de origen biológico procedentes del sector primario para la obtención de productos industriales y su comercialización. \n Formular y liderar proyectos productivos, de investigación y transferencia tecnológica. \n\ Generar soluciones a la problemática agroindustrial de la región. \n Promover el desarrollo sostenible y ambiental, en concordancia con las políticas económicas nacionales e      internacionales. \n Comprender los sistemas integrados de gestión. \n Desarrollar su espíritu investigativo en los procesos agroindustriales. ",
  },
  ambiental: {
    title: "Perfil: Ingeneiro Ambiental y Sanitario",
    content:
      "El Ingeniero Ambiental y Sanitario egresado de la UPC seccional Aguachica, es integral con pensamiento crítico, reflexivo y creativo, de espíritu emprendedor e investigativo, capaz de asumir el liderazgo en procesos de gestión ambiental y alternativas sostenibles asociadas a los modelos económicos de desarrollo, quien basado en el principio de precaución y el funcionamiento sistémico los procesos naturales, promueven la solución a problemas generados por los sistemas de producción, saneamiento básico e impacto de la globalización; con capacidad de trabajo en equipo, comunicación asertiva, visión  holística coherente con la ética, el civismo y la moral, responsable y legalmente. ",
  },
  agropecuario: {
    title: "Perfil: Ingeniero/a Agropecurio",
    content:
      "El Ingeniero Agropecuario de la UPCSA, será un profesional con capacidades científicas, tecnológicas y de la ingeniería aplicada propia del campo de conocimiento que le permitirán Diseñar, Desarrollar, Implementar y Liderar sistemas de producción agropecuarios con responsabilidad ambiental, social y ética; promoviendo soluciones y alternativas sustentables a problemáticas contextuales de seguridad e independencia alimentaria mediante la aplicación de estrategias innovadoras y de emprendimiento. ",
  },
  administrador: {
    title: "Perfil: Administrador de Empresas",
    content:
      "El Administrador de la Universidad Popular del Cesar deberá ser un hombre crítico, creativo, innovador, inconforme, humanista, solidario y democrático, con valores que trasciendan los límites de la organización para que las acciones que desarrolle en cualquier actividad profesional y personal, se caractericen por su transparencia, honestidad, equidad, responsabilidad y respeto por sí y por los demás.\n\n Deberá tener una serie de características propias que permitan generar nuevas ideas que lleven a emprender y desarrollar la formación de empresas, poseer carácter de triunfador, con una disciplina férrea para adquirir nuevos conocimientos,  un mejoramiento continuo a través del esfuerzo, un alto nivel de superación que concluya en un progreso académico y laboral, no conformarse con los parámetros entregados en sus clases, sino investigar y formar su propio criterio profesional, la búsqueda de la propia realización personal y profesional.   Deberá ser un profesional capaz de identificar problemas claves en las distintas áreas del conocimiento, de las organizaciones y de la sociedad, abstraerlos de la realidad, convertirlos en materia de investigación y encontrarles soluciones específicas. ",
  },
  contador: {
  title: "Perfil: Contador Público",
  content:
    "El Contador Público egresado de la Universidad Popular del Cesar está en capacidad de desarrollar un conjunto de conocimientos, destrezas, habilidades y actitudes necesarios para su ejercicio profesional dentro de las organizaciones y fuera de ellas, ampliando y profundizando las actuales áreas del conocimiento disciplinar y de la profesión contable y creando aquellas requeridas para hacer frente a los cambios que impone la nueva sociedad.\n\n  Su formación integral le permite un claro conocimiento en su entorno social, político, económico y cultural, para desarrollar un conjunto de actividades hacia el cambio, la innovación y la investigación que lo inducen a asumir el compromiso social de contribuir a conmover el desarrollo del país ejerciendo un liderazgo efectivo en su campo de acción. Así pues, las características de nuestro egresado son: creativo, innovador, internacional, líder, recursivo, crítico, prospectivo y multidisciplinario, filosófico-epistemológico. ",
  }, 
  economista: {
    title: "Perfil: Economista",
    content:
      "El Economista de la Universidad Popular del Cesar, seccional Aguachica se caracteriza por poseer habilidades en la compresión lectora así como de habilidades de comunicación verbal y escrita; dominio de las matemáticas y el pensamiento crítico, basando su actuaciones en principio éticos y morales, que le permiten aportar de manera creativa e innovadora al desarrollo de valor a las organizaciones del ámbito público y privado, así como generación de emprendimientos siendo capaz de atender a las necesidades y tendencias del mercado. ",
  },
  abogado: {
    title: "Perfil: Abogado",
    content:
      "El egresado del  Programa de Derecho de la Universidad Popular del Cesar seccional Aguachica será un abogado integral, capaz de responder a los desafíos de la sociedad, dotado de herramientas conceptuales, hermenéuticas, argumentativas, investigativas que le permita interpretar y aplicar la Legislación vigente en el ejercicio eficaz de su profesión; generando estrategias orientadas a la comprensión y apropiación de la ciencia, la tecnología y la innovación,  espíritu de paz, compromiso social y comunitario, generando soluciones responsables a los conflictos en virtud de la construcción de paz para la humanidad. ",
  },
}

// Lista de IDs de modelos para reutilizar
const modelIds = ["sistemas", "agroindustrial", "ambiental", "agropecuario", "administrador", "contador", "economista", "abogado"]

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