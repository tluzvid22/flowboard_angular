const FAQs = [
  {
    question: '¿Lo puedo integrar con otras herramientas?',
    answer:
      'De momento, no se integra con ninguna herramienta externa. Pronto anunciaremos más opciones de integración.',
  },
  {
    question: '¿Ofrecen soporte técnico?',
    answer: 'Si, disponemos de soporte al cliente 24/7 las 24hs del día',
  },
  {
    question: '¿Es gratis?',
    answer: 'Si, flowboard es completamente gratuito',
  },
  {
    question: '¿Quién desarrolla flowboard?',
    answer: 'Flowboard ha sido desarrollado por Tobías Luzuriaga Vidal',
  },
  {
    question: '¿Cómo puedo actualizar mi perfil?',
    answer:
      'Puedes actualizar tu perfil en la sección de configuración de tu cuenta. Allí encontrarás opciones para modificar tu información personal y preferencias.',
  },
  {
    question: '¿Se pueden compartir tableros con otros usuarios?',
    answer:
      'Sí, puedes compartir tus tableros con otros usuarios. Simplemente selecciona el tablero que deseas compartir y haz clic en la opción "Compartir".',
  },
  {
    question: '¿Qué navegadores son compatibles con Flowboard?',
    answer:
      'Flowboard es compatible con los principales navegadores web, incluyendo Chrome, Firefox, Safari y Edge.',
  },
  {
    question: '¿Puedo acceder a Flowboard desde mi dispositivo móvil?',
    answer:
      'Sí, Flowboard es compatible con dispositivos móviles. Puedes acceder a la aplicación desde tu navegador web en tu teléfono o tablet.',
  },
  {
    question: '¿Cómo puedo recuperar mi contraseña si la olvidé?',
    answer:
      'Si olvidaste tu contraseña, puedes restablecerla haciendo clic en el enlace "¿Olvidaste tu contraseña?" en la página de inicio de sesión. Se te enviará un correo electrónico con instrucciones para restablecer tu contraseña.',
  },
  {
    question:
      '¿Cuál es el tamaño máximo de los archivos que puedo cargar en Flowboard?',
    answer:
      'El tamaño máximo de los archivos que puedes cargar en Flowboard depende del plan que tengas. En general, los usuarios gratuitos tienen un límite de tamaño de archivo más bajo que los usuarios premium.',
  },
  {
    question: '¿Es posible exportar mis tableros de Flowboard?',
    answer:
      'Sí, puedes exportar tus tableros de Flowboard en varios formatos, incluyendo PDF y Excel. Esta función está disponible para usuarios premium.',
  },
  {
    question: '¿Flowboard tiene una versión para equipos?',
    answer:
      'Actualmente, Flowboard está disponible como una aplicación web. Estamos trabajando en una versión para equipos que estará disponible próximamente.',
  },
]

export function get4RandomQuestions() {
  const startIndex = Math.floor(Math.random() * (FAQs.length - 3))
  return FAQs.slice(startIndex, startIndex + 4)
}
