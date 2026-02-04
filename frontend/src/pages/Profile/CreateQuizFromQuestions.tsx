import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  RadioGroup,
  Radio,
  FormControl,
  FormLabel,
} from '@mui/material';



import {
  Quiz as QuizIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { createQuiz } from '../../services/quizzes';
import PriceSelector from '../../components/PriceSelector';

interface Question {
  text: string;
  options: string[];
  correct: number;
  category: string;
  label: string;
}

// Pre-existing pool of questions (creator questions to be rephrased for fans)
const questionPool: Question[] = [
  {
    text: "¿Cuál es tu ritual antes de grabar un video?",
    options: ["Tomar café o té", "Revisar mi look frente al espejo", "Escuchar música motivadora", "Improvisar sin plan"],
    correct: 0,
    category: "Preguntas Generales",
    label: "Ritual Pre-Grabación"
  },
  {
    text: "¿Qué haces primero al despertar?",
    options: ["Revisar redes", "Dormir un poco más", "Hacer ejercicio", "Tomar desayuno"],
    correct: 0,
    category: "Preguntas Generales",
    label: "Rutina Matutina"
  },
  {
    text: "¿Cuál es tu lugar favorito para crear contenido?",
    options: ["En casa", "En exteriores", "En un estudio", "Donde sea que surja la inspiración"],
    correct: 0,
    category: "Preguntas Generales",
    label: "Espacio de Trabajo"
  },
  {
    text: "¿Qué prefieres para tus videos?",
    options: ["Contenido planificado", "Contenido espontáneo"],
    correct: 0,
    category: "Preguntas Generales",
    label: "Estilo de Producción"
  },
  {
    text: "¿Cuál es tu snack favorito mientras trabajas en contenido?",
    options: ["Dulces", "Frutas", "Snacks salados", "Nada, prefiero concentrarme"],
    correct: 0,
    category: "Preguntas Generales",
    label: "Snacks de Trabajo"
  },
  {
    text: "¿Qué bebida acompaña mejor tus sesiones de creación?",
    options: ["Café", "Té", "Refresco / soda", "Agua"],
    correct: 0,
    category: "Preguntas Generales",
    label: "Bebida Favorita"
  },
  {
    text: "¿Cuál sería tu outfit \"firma\" para grabar?",
    options: ["Casual y cómodo", "Colorido y llamativo", "Elegante y estilizado", "Siempre depende del mood"],
    correct: 0,
    category: "Preguntas Generales",
    label: "Outfit de Grabación"
  },
  {
    text: "¿Qué accesorio nunca falta en tus videos?",
    options: ["Gafas de sol", "Gorra o sombrero", "Auriculares", "Ninguno"],
    correct: 0,
    category: "Preguntas Generales",
    label: "Accesorio Esencial"
  },
  {
    text: "¿Qué tipo de música te motiva mientras trabajas?",
    options: ["Pop", "Electrónica / dance", "Hip-hop", "Música tranquila / lo-fi"],
    correct: 0,
    category: "Preguntas Generales",
    label: "Música Motivadora"
  },
  {
    text: "Cuando algo no sale como quieres en un video, ¿cómo reaccionas?",
    options: ["Lo intento hasta que quede bien", "Me frustro un poco, luego sigo", "Ríe y lo hago parte del video", "Lo dejo y paso a otra cosa"],
    correct: 0,
    category: "Preguntas Generales",
    label: "Reacción a Errores"
  },
  {
    text: "¿Cuál es tu mayor fuente de inspiración para contenido?",
    options: ["Otros creadores", "Experiencias personales", "Tendencias", "Fans y seguidores"],
    correct: 0,
    category: "Preguntas Generales",
    label: "Fuente de Inspiración"
  },
  {
    text: "¿Prefieres crear contenido solo o con alguien más?",
    options: ["Solo", "Con amigos", "Con colaboradores", "Depende del tipo de video"],
    correct: 0,
    category: "Preguntas Generales",
    label: "Estilo de Colaboración"
  },
  {
    text: "¿Cuál es tu momento favorito del día para grabar?",
    options: ["Mañana", "Tarde", "Noche", "Cuando tengo tiempo libre"],
    correct: 0,
    category: "Preguntas Generales",
    label: "Horario Preferido"
  },
  {
    text: "¿Qué parte de crear contenido disfrutas más?",
    options: ["Grabar", "Editar", "Planear ideas", "Interactuar con fans"],
    correct: 0,
    category: "Preguntas Generales",
    label: "Parte Favorita"
  },
  {
    text: "¿Cuál es tu meta principal como creador ahora mismo?",
    options: ["Crecer en seguidores", "Crear contenido más auténtico", "Colaborar con marcas", "Mejorar mi estilo personal"],
    correct: 0,
    category: "Preguntas Generales",
    label: "Meta Principal"
  },
  {
    text: "¿Qué te hace reír más durante la creación de contenido?",
    options: ["Mis errores en cámara", "Comentarios divertidos de fans", "Bromas con amigos", "Memes y tendencias"],
    correct: 0,
    category: "Preguntas Generales",
    label: "Momento Más Divertido"
  },
  {
    text: "¿Qué harías si te quedas sin ideas para un día de grabación?",
    options: ["Improvisar algo rápido", "Tomar un descanso", "Buscar inspiración en otros creadores", "Pedir ideas a tus seguidores"],
    correct: 0,
    category: "Preguntas Generales",
    label: "Manejo de Bloqueo"
  },
  {
    text: "¿Cuál es tu guilty pleasure cuando nadie te ve grabando?",
    options: ["Ver memes infinitamente", "Comer algo prohibido", "Escuchar música ridícula", "Hacer baile tonto frente al espejo"],
    correct: 0,
    category: "Preguntas Generales",
    label: "Secreto Divertido"
  },
  {
    text: "Si pudieras describir tu estilo de contenido en una palabra, ¿cuál sería?",
    options: ["Divertido", "Inspirador", "Creativo", "Auténtico"],
    correct: 0,
    category: "Preguntas Generales",
    label: "Estilo en Una Palabra"
  },
  {
    text: "¿Para qué tipo de contenido eres más conocido?",
    options: ["Moda y estilo", "Fitness y salud", "Comedia y memes", "Tecnología y gadgets"],
    correct: 0,
    category: "Preguntas Generales",
    label: "Contenido Más Conocido"
  },
  {
    text: "¿Qué día de la semana sueles publicar contenido nuevo?",
    options: ["Lunes", "Miércoles", "Viernes", "Domingo"],
    correct: 0,
    category: "Preguntas Generales",
    label: "Día de Publicación"
  },
  {
    text: "¿Cuál es tu hábito o estilo más reconocible?",
    options: ["Siempre usas gafas de sol", "Publicas a horas específicas", "Usas ciertos filtros", "Tienes una pose característica"],
    correct: 0,
    category: "Preguntas Generales",
    label: "Hábito Reconocible"
  },
  {
    text: "¿Qué filtro o estilo de edición utilizas con más frecuencia?",
    options: ["Blanco y negro", "Brillante y vibrante", "Oscuro / moody", "Minimalista / neutro"],
    correct: 0,
    category: "Preguntas Generales",
    label: "Estilo de Edición"
  },
  {
    text: "¿Qué tipo de canción o audio usas más en tus Reels?",
    options: ["Canciones populares en tendencia", "Artista – Nombre de la canción", "Audio original", "Música con licencia"],
    correct: 0,
    category: "Preguntas Generales",
    label: "Audio en Reels"
  },
  {
    text: "¿De qué color era el outfit que llevabas en tu última publicación?",
    options: ["Rojo", "Azul", "Negro", "Blanco"],
    correct: 0,
    category: "Preguntas Generales",
    label: "Color de Outfit"
  },
  {
    text: "¿Cuál fue el tema principal de tu Reel más popular?",
    options: ["Cocina", "Viajes", "Sketch divertido", "Tutorial de moda"],
    correct: 0,
    category: "Preguntas Generales",
    label: "Reel Más Popular"
  },
  {
    text: "¿Cuál es tu hobby favorito que tu audiencia conoce?",
    options: ["Pintura", "Fitness", "Viajar", "Gaming"],
    correct: 0,
    category: "Preguntas Generales",
    label: "Hobby Público"
  },
  {
    text: "¿Cuál es tu objetivo principal en Instagram?",
    options: ["Crecer mi comunidad", "Vender productos/servicios", "Compartir mi estilo de vida", "Educar o informar"],
    correct: 0,
    category: "Preguntas Generales",
    label: "Objetivo Principal"
  },
  {
    text: "¿Qué tono representa mejor tu contenido en Instagram?",
    options: ["Divertido", "Inspirador", "Profesional", "Casual"],
    correct: 0,
    category: "Preguntas Generales",
    label: "Tono de Contenido"
  },
  {
    text: "¿Con qué frecuencia respondes a los comentarios?",
    options: ["Rara vez", "A veces", "A menudo", "Siempre"],
    correct: 0,
    category: "Preguntas Generales",
    label: "Frecuencia de Respuestas"
  },
  {
    text: "¿Recientemente colaboraste con una marca grande?",
    options: ["Sí", "No", "No estoy seguro", "Ocurrió recientemente"],
    correct: 0,
    category: "Preguntas Generales",
    label: "Colaboración Reciente"
  },
  {
    text: "¿Qué emoji usas más cuando respondes a tus seguidores?",
    options: ["❤️", "😂", "😎", "🙌", "Ninguno"],
    correct: 0,
    category: "Preguntas Generales",
    label: "Emoji Favorito"
  },
  {
    text: "¿Recientemente hiciste un Q&A (Preguntas y respuestas) en tus historias?",
    options: ["Sí", "No", "No aplica", "Recientemente"],
    correct: 0,
    category: "Preguntas Generales",
    label: "Q&A en Historias"
  },
  {
    text: "¿Cuántos seguidores tienes aproximadamente?",
    options: ["Menos de 100k", "100k–500k", "500k–1M", "Más de 1M"],
    correct: 0,
    category: "Preguntas Generales",
    label: "Número de Seguidores"
  },
  {
    text: "¿Quién aparece más seguido en tus publicaciones?",
    options: ["Tu mejor amigo", "Un colaborador frecuente", "Un familiar", "Otro creador"],
    correct: 0,
    category: "Preguntas Generales",
    label: "Colaborador Frecuente"
  },
  {
    text: "¿Cuántas publicaciones sueles subir por semana?",
    options: ["1", "2–3", "4–5", "6 o más"],
    correct: 0,
    category: "Preguntas Generales",
    label: "Posts por Semana"
  },
  {
    text: "Ordena tus tipos de contenido de más frecuente a menos frecuente:",
    options: ["Moda > Viajes > Comedia > Fitness", "Viajes > Moda > Fitness > Comedia", "Comedia > Fitness > Moda > Viajes", "Fitness > Comedia > Viajes > Moda"],
    correct: 0,
    category: "Preguntas Generales",
    label: "Frecuencia de Contenido"
  },
  {
    text: "¿Cuál fue el tema de tu primera publicación pública?",
    options: ["Viajes", "Selfie", "Tu mascota", "Comida"],
    correct: 0,
    category: "Preguntas Generales",
    label: "Primera Publicación"
  },
  {
    text: "¿Qué tipo de colaboración haces más frecuentemente?",
    options: ["Intercambio de producto", "Colaboraciones pagadas", "Colabs orgánicas con otros creadores"],
    correct: 0,
    category: "Preguntas Generales",
    label: "Tipo de Colaboración"
  },
  {
    text: "¿Qué es lo primero que piensas justo antes de empezar a grabar?",
    options: ["\"Vamos con todo\"", "\"Ojalá salga bien\"", "\"Solo sé tú mismo\"", "\"A ver qué ocurre hoy\""],
    correct: 0,
    category: "Preguntas un poco personales",
    label: "Pensamiento Pre-Grabación"
  },
  {
    text: "¿Qué parte de ti crees que más conecta con tu audiencia?",
    options: ["Tu sentido del humor", "Tu autenticidad", "Tu estilo", "Tu forma de expresarte"],
    correct: 0,
    category: "Preguntas un poco personales",
    label: "Conexión con Audiencia"
  },
  {
    text: "¿Qué te motiva a seguir creando incluso en días difíciles?",
    options: ["Mi comunidad", "Mis metas personales", "Mi amor por crear", "La disciplina"],
    correct: 0,
    category: "Preguntas un poco personales",
    label: "Motivación en Días Difíciles"
  },
  {
    text: "¿Cuál es tu mayor \"manía\" al grabar?",
    options: ["Repetir tomas varias veces", "Ajustar todo antes de grabar", "Controlar ángulos y luz", "Practicar una frase antes de decirla"],
    correct: 0,
    category: "Preguntas un poco personales",
    label: "Manía al Grabar"
  },
  {
    text: "¿Qué parte de tu proceso como creador te da más orgullo?",
    options: ["Las ideas", "La edición", "La constancia", "Mi crecimiento"],
    correct: 0,
    category: "Preguntas un poco personales",
    label: "Parte Más Orgullosa"
  },
  {
    text: "¿Qué emoción te gustaría que la gente sienta al ver tu contenido?",
    options: ["Inspiración", "Alegría", "Calma", "Motivación"],
    correct: 0,
    category: "Preguntas un poco personales",
    label: "Emoción Deseada"
  },
  {
    text: "¿Qué sueles pensar cuando lees un comentario positivo?",
    options: ["\"Valió la pena\"", "\"No me lo esperaba\"", "\"Tengo la mejor comunidad\"", "\"Esto me motiva a seguir\""],
    correct: 0,
    category: "Preguntas un poco personales",
    label: "Pensamiento en Comentarios Positivos"
  },
  {
    text: "¿Qué te ayuda más a tener ideas nuevas?",
    options: ["Salir a caminar", "Hablar con amigos", "Ver otros creadores", "Escuchar música"],
    correct: 0,
    category: "Preguntas un poco personales",
    label: "Ayuda para Ideas Nuevas"
  },
  {
    text: "¿Qué parte de ti intentas transmitir siempre en tus videos?",
    options: ["Tu energía", "Tu creatividad", "Tu honestidad", "Tu humor"],
    correct: 0,
    category: "Preguntas un poco personales",
    label: "Parte Transmitida"
  },
  {
    text: "¿Qué te gustaría que la gente recordara de ti como creador?",
    options: ["Mi estilo", "Mi autenticidad", "Mi crecimiento", "Mi impacto positivo"],
    correct: 0,
    category: "Preguntas un poco personales",
    label: "Recuerdo Deseado"
  },
  {
    text: "¿Qué es lo que más te sorprende de tu propio crecimiento como creador?",
    options: ["La disciplina que desarrollé", "Las oportunidades que aparecieron", "La respuesta de mi audiencia", "Mi creatividad"],
    correct: 0,
    category: "Preguntas un poco personales",
    label: "Sorpresa en Crecimiento"
  },
  {
    text: "¿Qué momento del proceso creativo te da más paz?",
    options: ["Preparar el ambiente", "Grabar", "Editar", "Publicar"],
    correct: 0,
    category: "Preguntas un poco personales",
    label: "Momento de Paz"
  },
  {
    text: "¿Qué te impulsa a mejorar tu contenido cada día?",
    options: ["Curiosidad", "Ambición", "Inspiración externa", "Mi comunidad"],
    correct: 0,
    category: "Preguntas un poco personales",
    label: "Impulso para Mejorar"
  },
  {
    text: "¿Qué suele ser tu mayor distracción al crear?",
    options: ["Redes sociales", "Mensajes", "Perfeccionismo", "Pensar demasiado"],
    correct: 0,
    category: "Preguntas un poco personales",
    label: "Mayor Distracción"
  },
  {
    text: "¿Qué te hace sentir que un contenido \"sí quedó perfecto\"?",
    options: ["Cuando refleja mi estilo", "Cuando me hace sonreír", "Cuando fluye sin esfuerzo", "Cuando sé que ayudará a alguien"],
    correct: 0,
    category: "Preguntas un poco personales",
    label: "Sentimiento de Perfección"
  },
  {
    text: "¿Cuál es el pensamiento que más te acompaña mientras creas?",
    options: ["\"Hazlo a tu manera\"", "\"No te sobrepienses\"", "\"Diviértete\"", "\"Sigue mejorando\""],
    correct: 0,
    category: "Preguntas un poco personales",
    label: "Pensamiento Acompañante"
  },
  {
    text: "¿Qué aspecto personal te gustaría mostrar más en tu contenido?",
    options: ["Mi humor", "Mi vida diaria", "Mi vulnerabilidad", "Mi lado creativo"],
    correct: 0,
    category: "Preguntas un poco personales",
    label: "Aspecto Personal a Mostrar"
  },
  {
    text: "¿Qué parte de tu rutina diaria sientes que te inspira más?",
    options: ["Las mañanas", "El gym o actividad física", "Mis conversaciones", "Mis momentos solos"],
    correct: 0,
    category: "Preguntas un poco personales",
    label: "Rutina Inspiradora"
  },
  {
    text: "¿Qué te ayuda a recuperar motivación cuando te sientes bloqueado?",
    options: ["Descansar", "Ver creadores favoritos", "Hablar con alguien cercano", "Revisar mis objetivos"],
    correct: 0,
    category: "Preguntas un poco personales",
    label: "Recuperación de Motivación"
  },
  {
    text: "¿Qué es lo que más valoras de tu audiencia?",
    options: ["Su apoyo", "Su energía", "Su lealtad", "Su autenticidad"],
    correct: 0,
    category: "Preguntas un poco personales",
    label: "Valor en Audiencia"
  }
];

const CreateQuizFromQuestions: React.FC = () => {
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<number[]>([]);
  const [quizTitle, setQuizTitle] = useState('');
  const [success, setSuccess] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentStep, setCurrentStep] = useState<'select' | 'answer'>('select');
  const [creatorAnswers, setCreatorAnswers] = useState<{ [questionId: number]: number }>({});
  const [selectedCategory, setSelectedCategory] = useState<'generales' | 'personales'>('generales');
  const [answerPrice, setAnswerPrice] = useState<number | null>(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  const filteredQuestions = questionPool.filter(question =>
    selectedCategory === 'generales' ? question.category === 'Preguntas Generales' : question.category === 'Preguntas un poco personales'
  );

  const toggleQuestionSelection = (questionId: number) => {
    setSelectedQuestionIds(prev =>
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleCreatorAnswer = (questionId: number, answerIndex: number) => {
    setCreatorAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleCreateQuiz = () => {
    if (!quizTitle.trim()) {
      setErrorMessage('Por favor ingresa un título para el cuestionario.');
      setErrorDialogOpen(true);
      return;
    }
    saveQuiz();
  };

  const saveQuiz = async () => {
    if (selectedQuestionIds.length === 0) {
      setErrorMessage('Por favor selecciona al menos una pregunta.');
      setErrorDialogOpen(true);
      return;
    }

    // Check if all selected questions have been answered
    const unansweredQuestions = selectedQuestionIds.filter(id => creatorAnswers[id] === undefined);
    if (unansweredQuestions.length > 0) {
      setErrorMessage('Por favor responde todas las preguntas seleccionadas antes de crear el cuestionario.');
      setErrorDialogOpen(true);
      return;
    }

    // Generate fan quiz questions using creator's answers
    const fanQuestions = selectedQuestionIds.map(questionId => {
      const originalQuestion = questionPool[questionId];
      const creatorAnswerIndex = creatorAnswers[questionId];

      return {
        ...originalQuestion,
        text: originalQuestion.text,
        correct: creatorAnswerIndex
      };
    });

    const quiz = {
      title: quizTitle,
      posts: [], // No posts for question-based quizzes
      questions: fanQuestions,
      creatorId: user?.id,
      creatorName: user?.username,
      creatorStripeAccountId: user?.stripeAccountId,
      answerPrice: answerPrice, // Price to unlock creator's answers
    };
    try {
      await createQuiz(quiz);
      setSuccess('¡Cuestionario creado exitosamente!');
      setSnackbarOpen(true);
      setTimeout(() => {
        navigate('/profile', { state: { tab: 0 } });
      }, 1500);
    } catch (saveError) {
      console.error('Failed to save quiz:', saveError);
      setErrorMessage('No se pudo guardar el cuestionario. Intenta de nuevo.');
      setErrorDialogOpen(true);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Preguntas Generales': 'primary',
      'Preguntas un poco personales': 'secondary'
    };
    return colors[category] || 'default';
  };

  const getLabelColor = (index: number) => {
    const colors = ['primary', 'secondary', 'success', 'warning', 'error'];
    return colors[index % colors.length];
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight={600}>
        Crear Cuestionario desde Banco de Preguntas
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Selecciona preguntas de nuestro diverso banco de preguntas preexistentes
      </Typography>

      {/* Quiz Title */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            label="Título del Cuestionario"
            value={quizTitle}
            onChange={(e) => setQuizTitle(e.target.value)}
            placeholder="Ingresa un título atractivo para tu cuestionario"
            required
          />
        </CardContent>
      </Card>

      {/* Step Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <Button
          variant={currentStep === 'select' ? 'contained' : 'outlined'}
          onClick={() => setCurrentStep('select')}
          sx={{ mr: 2 }}
        >
          1. Seleccionar Preguntas
        </Button>
        <Button
          variant={currentStep === 'answer' ? 'contained' : 'outlined'}
          onClick={() => {
            if (selectedQuestionIds.length === 0) {
              setErrorMessage('Por favor selecciona al menos una pregunta.');
              setErrorDialogOpen(true);
              return;
            }
            if (!quizTitle.trim()) {
              setErrorMessage('Por favor ingresa un título para el cuestionario antes de continuar.');
              setErrorDialogOpen(true);
              return;
            }
            setCurrentStep('answer');
          }}
        >
          2. Responder Preguntas
        </Button>
      </Box>

      {currentStep === 'select' && (
        <>
          {/* Category Selection */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
            <Button
              variant={selectedCategory === 'generales' ? 'contained' : 'outlined'}
              onClick={() => setSelectedCategory('generales')}
            >
              Preguntas Generales
            </Button>
            <Button
              variant={selectedCategory === 'personales' ? 'contained' : 'outlined'}
              onClick={() => setSelectedCategory('personales')}
            >
              Preguntas un poco personales
            </Button>
          </Box>

          {/* Question Pool */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Preguntas Disponibles ({filteredQuestions.length})
                </Typography>
                <Chip
                  label={`${selectedQuestionIds.length} seleccionadas`}
                  color="primary"
                  variant="outlined"
                />
              </Box>

              <Grid container spacing={2}>
                {filteredQuestions.map((question, filteredIndex) => {
                  const originalIndex = questionPool.findIndex(q => q === question);
                  return (
                    <Grid size={{xs:12,sm:6 ,md:4}} key={originalIndex}>
                      <Card variant="outlined" sx={{ sp: 2, height: '100%' }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={selectedQuestionIds.includes(originalIndex)}
                              onChange={() => toggleQuestionSelection(originalIndex)}
                            />
                          }
                          label={
                            <Box sx={{ width: '100%' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Chip
                                  label={question.label}
                                  size="small"
                                  color={getLabelColor(filteredIndex) as any}
                                  variant="outlined"
                                />
                                <Typography variant="body2" color="text.secondary">
                                  Question {originalIndex + 1}
                                </Typography>
                              </Box>
                              <Typography variant="body1" sx={{ mb: 1 }}>
                                {question.text}
                              </Typography>
                              <Box sx={{ pl: 2 }}>
                                {question.options.map((option, optIndex) => (
                                  <Typography
                                    key={optIndex}
                                    variant="body2"
                                    color={optIndex === question.correct ? 'success.main' : 'text.secondary'}
                                    sx={{
                                      display: 'block',
                                      fontWeight: optIndex === question.correct ? 600 : 400
                                    }}
                                  >
                                    {String.fromCharCode(65 + optIndex)}. {option}
                                    {optIndex === question.correct && ' ✓'}
                                  </Typography>
                                ))}
                              </Box>
                            </Box>
                          }
                          sx={{ width: '100%', alignItems: 'flex-start' }}
                        />
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>

          {/* Next Button */}
          {selectedQuestionIds.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setQuizTitle('');
                  setSelectedQuestionIds([]);
                }}
              >
                Reiniciar
              </Button>
              <Button
                variant="contained"
                size="large"
                onClick={() => {
                  if (!quizTitle.trim()) {
                    setErrorMessage('Por favor ingresa un título para el cuestionario antes de continuar.');
                    setErrorDialogOpen(true);
                    return;
                  }
                  setCurrentStep('answer');
                }}
              >
                Siguiente: Responder Preguntas ({selectedQuestionIds.length})
              </Button>
            </Box>
          )}
        </>
      )}

      {currentStep === 'answer' && (
        <>
          {/* Answer Questions */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Responde las preguntas seleccionadas
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Tus respuestas se usarán para generar preguntas para tus fans.
              </Typography>

              <Stack spacing={3}>
                {selectedQuestionIds.map((questionId, index) => {
                  const question = questionPool[questionId];
                  return (
                    <Box key={questionId}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Chip
                          label={question.category}
                          size="small"
                          color={getCategoryColor(question.category) as any}
                        />
                        <Chip
                          label={question.label}
                          size="small"
                          color={getLabelColor(index) as any}
                          variant="outlined"
                        />
                        <Typography variant="body2" color="text.secondary">
                          Pregunta {index + 1}
                        </Typography>
                      </Box>
                      <Typography variant="h6" gutterBottom>
                        {question.text}
                      </Typography>
                      <FormControl component="fieldset">
                        <FormLabel component="legend">Selecciona tu respuesta:</FormLabel>
                        <RadioGroup
                          value={creatorAnswers[questionId] ?? ''}
                          onChange={(e) => handleCreatorAnswer(questionId, parseInt(e.target.value))}
                        >
                          {question.options.map((option, optIndex) => (
                            <FormControlLabel
                              key={optIndex}
                              value={optIndex}
                              control={<Radio />}
                              label={`${String.fromCharCode(65 + optIndex)}. ${option}`}
                            />
                          ))}
                        </RadioGroup>
                      </FormControl>
                    </Box>
                  );
                })}
              </Stack>
            </CardContent>
          </Card>

          {/* Price Selection */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Configuración de Precio
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Establece un precio para que los seguidores puedan desbloquear tus respuestas (opcional)
              </Typography>
              <PriceSelector
                value={answerPrice}
                onChange={setAnswerPrice}
              />
            </CardContent>
          </Card>

          {/* Save Button */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => setCurrentStep('select')}
            >
              Atrás: Seleccionar Preguntas
            </Button>
            <Button
              variant="contained"
              size="large"
              onClick={handleCreateQuiz}
              startIcon={<QuizIcon />}
            >
              Crear Cuestionario
            </Button>
          </Box>
        </>
      )}

      <Dialog
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
      >
        <DialogTitle>Éxito</DialogTitle>
        <DialogContent>
          <Typography>{success}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSnackbarOpen(false)} color="primary">
            Aceptar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={errorDialogOpen}
        onClose={() => setErrorDialogOpen(false)}
      >
        <DialogTitle>Error</DialogTitle>
        <DialogContent>
          <Typography>{errorMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setErrorDialogOpen(false)} color="primary">
            Aceptar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CreateQuizFromQuestions;
