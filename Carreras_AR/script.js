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
  C_sistemas: {
    title: "Carrera: Ingeniería de Sistemas",
    content:
      "El programa de Ingeniería de Sistemas de la Universidad Popular del Cesar, seccional Aguachica, es un pregrado de formación profesional universitaria, presencial, en jornada única, con una duración de 10 semestres y un total de 170 créditos.\n Hace parte de la Facultad de Ingenierías y Tecnologías y recibe hasta 100 estudiantes por semestre con admisión semestral.\n Cuenta con Registro Calificado según la Resolución No. 24649 del 14 de noviembre de 2017, tiene código SNIES 19945, fue creado mediante acuerdo institucional y el programa se ofrece en la sede ubicada en Aguachica, departamento del Cesar. ",
  },
  C_agroindustrial: {
    title: "Carrera: Ingeniería Agroindustrial",
    content:
      "El programa de Ingeniería Agroindustrial de la Universidad Popular del Cesar, seccional Aguachica, es un pregrado de formación profesional universitaria, ofertado en modalidad presencial, jornada única y con una duración de 10 semestres.\n Consta de 171 créditos académicos y pertenece a la Facultad de Ingenierías y Tecnologías. Admite hasta 100 estudiantes por semestre, con admisión semestral.\n Cuenta con Registro Calificado mediante la Resolución No. 20545 del 5 de noviembre de 2021, está registrado en el SNIES con el código 104173 y fue creado mediante acuerdo institucional. ",
  },
  C_ambiental: {
    title: "Carrera: Ingeniería Ambiental y Sanitaria",
    content:
      "El programa de Ingeniería Ambiental y Sanitaria es un pregrado presencial de formación profesional universitaria, con jornada única y duración de 10 semestres.\n Tiene 170 créditos y pertenece a la Facultad de Ingenierías y Tecnologías de la Universidad Popular del Cesar, seccional Aguachica.\n Su capacidad máxima es de 80 estudiantes por semestre, y se ofrece con admisión semestral. Está avalado por Registro Calificado según la Resolución No. 10702 del 1 de junio de 2016, con código SNIES 105659. ",
  },
  C_agropecuario: {
    title: "Carrera: Ingeniería Agropecuria",
    content:
      "La Ingeniería Agropecuaria es un programa de pregrado profesional universitario, ofertado por la Universidad Popular del Cesar en su seccional Aguachica.\n Se imparte de manera presencial, en jornada única, con una duración de 9 semestres y un total de 155 créditos. Pertenece a la Facultad de Ingenierías y Tecnologías, tiene una capacidad máxima de 100 estudiantes por semestre y se ofrece con admisión semestral.\n Cuenta con Registro Calificado según la Resolución No. 2457 del 7 de marzo de 2024, su código SNIES es 116578. ",
  },
  C_administrador: {
    title: "Carrera: Administración de Empresas",
    content:
      "El programa de Administración de Empresas de la Universidad Popular del Cesar, seccional Aguachica, es un pregrado de formación profesional universitaria, ofrecido en modalidad presencial y con jornadas diurna y nocturna.\n Tiene una duración de 10 semestres, consta de 172 créditos académicos y pertenece a la Facultad de Ciencias Administrativas, Contables y Económicas.\n Admite un máximo de 100 estudiantes por semestre, con admisión semestral. Cuenta con Registro Calificado según la Resolución No. 13121 del 21 de julio de 2021, y está registrado en el SNIES con el código 103833.\n Su creación fue aprobada mediante norma expedida por el Consejo Superior. ",
  },
  C_contador: {
  title: "Carrera: Contaduría Pública",
  content:
    "El programa de Contaduría Pública de la Universidad Popular del Cesar, seccional Aguachica, es un pregrado de formación profesional universitaria, dictado de forma presencial y con jornadas diurna y nocturna.\n Tiene una duración de 10 semestres, un total de 163 créditos y pertenece a la Facultad de Ciencias Administrativas, Contables y Económicas.\n Su capacidad máxima de ingreso es de 100 estudiantes por semestre y cuenta con admisión semestral. Posee Registro Calificado según la Resolución No. 7570 del 3 de mayo de 2022, y su código SNIES es 104395.\n Fue creado mediante acta expedida por el Consejo Superior. ",
  }, 
  C_economista: {
    title: "Carrera: Economía",
    content:
      "El programa de Economía otorga el título de Economista, corresponde al nivel de pregrado y se ofrece como formación profesional universitaria bajo la metodología presencial y jornada única.\n  Tiene una duración de 10 semestres, con un total de 175 créditos académicos, y pertenece a la Facultad de Ciencias Administrativas, Contables y Económicas.\n El número máximo de estudiantes admitidos en primer semestre es de 100, con una periodicidad de admisión semestral. \n Cuenta con registro calificado, aprobado mediante la Resolución No. 2439 del 7 de marzo de 2024, y está identificado con el Código SNIES 105814. \n Su creación se rige por norma interna a través de un acuerdo, y el programa se ofrece en la sede ubicada en Aguachica, departamento del Cesar. ",
  },
  C_abogado: {
    title: "Carrera: Derecho",
    content:
      "El programa de Derecho de la Universidad Popular del Cesar, seccional Aguachica, es un pregrado de formación profesional universitaria, ofrecido en modalidad presencial y jornada única.\n Tiene una duración de 10 semestres, 166 créditos y pertenece a la Dirección Académica de la Seccional.\n Su cupo máximo por semestre es de 35 estudiantes y la admisión es semestral. Posee Registro Calificado mediante la Resolución No. 002545 del 14 de febrero de 2025. ",
  },
}

// Lista de IDs de modelos para reutilizar
const modelIds = ["C_sistemas", "C_agroindustrial", "C_ambiental", "C_agropecuario", "C_administrador", "C_contador", "C_economista", "C_abogado"]

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
