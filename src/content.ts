// Todo el texto de la página de la Dra. Verónica Montoya.

export const WA = '573104130083';
export const WA_SHOW = '310 413 0083';
export const wa = (text: string) => `https://wa.me/${WA}?text=${encodeURIComponent(text)}`;
export const media = (file: string) => `${import.meta.env.BASE_URL}media/${file}`;

export const views = [
  {id: 'inicio', label: 'Inicio'},
  {id: 'tratamientos', label: 'Tratamientos'},
  {id: 'doctora', label: 'La doctora'},
  {id: 'cita', label: 'Tu primera cita'},
  {id: 'preguntas', label: 'Preguntas'},
] as const;
export type View = (typeof views)[number]['id'] | 'agenda' | 'resultados' | 'privacidad';

export const brand = {
  name: 'Dra. Verónica Montoya',
  short: 'Verónica Montoya',
  tag: 'Medicina estética',
  contact: 'WhatsApp',
  app: 'Agendar',
};

export const hero = {
  eyebrow: 'Medicina estética · Armenia, Quindío',
  lead: 'Tu piel,',
  accent: 'por fin',
  tail: 'entendida.',
  sub: 'La Dra. Verónica Montoya valora tu piel con calma y diseña un plan médico para que te veas descansada, nunca transformada.',
  cta: 'Agenda tu valoración',
  card: {
    title: 'Valoración facial',
    done: 'Valoración completa',
    rows: [
      {label: 'hidratación', value: 'Revisada'},
      {label: 'textura y poros', value: 'Revisada'},
      {label: 'tu plan', value: 'A tu medida'},
    ],
  },
};

/**
 * Anillos sobre el video. Sus posiciones por cuadro vienen de track.json,
 * en el mismo orden. `side` es hacia dónde cuelga la etiqueta.
 */
export const scans = [
  {name: 'Luminosidad', value: 'Alta', side: 'left'},
  {name: 'Líneas', value: 'Suaves', side: 'right'},
  {name: 'Poros', value: 'Refinados', side: 'left'},
] as const;

export const split = {
  eyebrow: 'El método de la Dra. Verónica',
  title: ['Medicina', '*con* *calma*'],
  body: 'La Dra. Verónica no persigue la perfección. Escucha, valora y te explica con claridad, para tratar solo lo que tu piel realmente necesita.',
  steps: [
    {n: '01', title: 'Escuchar', text: 'Qué te molesta, qué esperas y qué no quieres cambiar.'},
    {n: '02', title: 'Valorar', text: 'Revisión médica de tu piel, antecedentes y medicamentos.'},
    {n: '03', title: 'Tratar', text: 'Un plan a tu medida, con tiempos y cuidados claros.'},
  ],
  title2: ['Tú, *descansada*'],
  body2: 'Te acompañamos después del tratamiento con controles, para cuidar tu resultado.',
  pills: [
    {label: 'Hidratación', x: 58, y: 16},
    {label: 'Colágeno', x: 30, y: 52},
    {label: 'Luminosidad', x: 54, y: 82},
  ],
};

export const statement = {
  eyebrow: 'Nuestra promesa',
  tokens: [
    'La', 'Dra.', 'Verónica', 'te', 'ayuda', 'a', {img: 'eyes'}, 'entender', 'y', 'cuidar', 'tu', 'piel', 'como', 'nunca', 'antes.',
    'Medicina', 'estética', 'con', 'criterio', 'médico', {img: 'gel'}, 'y', 'ciencia', 'amable,', 'para', 'tu', 'piel', 'más',
    '*tranquila,*', 'más', '*luminosa*', {img: 'freckles'}, 'y', 'más', 'tuya.',
  ] as (string | {img: string})[],
  chips: [
    {label: 'Natural', icon: 'heart', at: 'cuidar', x: 74, y: 13, r: 6},
    {label: 'Segura', icon: 'star', at: 'nunca', x: 84, y: 34, r: -5},
    {label: 'Hidratada', icon: 'dew', at: 'amable,', x: 6, y: 80, r: 4},
    {label: 'Tranquila', icon: 'leaf', at: '*tranquila,*', x: 58, y: 84, r: -3},
    {label: 'Radiante', icon: 'sun', at: '*luminosa*', x: 80, y: 74, r: 5},
  ] as const,
};

type Item = {n: string; d: string; p: string; s: string; e: string};

export const treatments: {id: string; label: string; short: string; intro: string; items: Item[]}[] = [
  {
    id: 'facial',
    label: 'Facial',
    short: 'Facial',
    intro: 'Rejuvenecimiento y calidad de piel con resultados naturales: que te veas descansada, no diferente.',
    items: [
      {n: 'Bótox', d: 'Suaviza las arrugas de frente, entrecejo y patas de gallo sin congelar tu expresión. También se usa para el bruxismo y la sudoración excesiva (hiperhidrosis).', p: 'Arrugas, bruxismo e hiperhidrosis', s: '20–30 min', e: 'Visible en 3 a 7 días'},
      {n: 'Bioestimuladores de colágeno', d: 'Hidroxiapatita de calcio y ácido poliláctico que estimulan tu propio colágeno. Se aplican en rostro, zona genital y manos.', p: 'Flacidez y calidad de la piel', s: '40 min', e: 'Progresivo en semanas'},
      {n: 'Ácido hialurónico', d: 'Devuelve volumen e hidratación en labios, ojeras, pómulos o surcos, respetando tus proporciones.', p: 'Pérdida de volumen', s: '30–45 min', e: 'Inmediato'},
      {n: 'Skinbooster', d: 'Microinyecciones de hidratación profunda que dan luminosidad, elasticidad y una textura más uniforme.', p: 'Piel apagada o deshidratada', s: '30 min', e: 'Plan por sesiones'},
      {n: 'Exosomas', d: 'Tratamiento regenerativo que ayuda a mejorar la calidad, la textura y la recuperación de la piel.', p: 'Rejuvenecimiento y recuperación', s: '30–45 min', e: 'Plan por sesiones'},
      {n: 'Peeling', d: 'Renueva la superficie de la piel para tratar manchas, melasma, marcas de acné y poros.', p: 'Manchas y textura', s: '30 min', e: 'Plan por sesiones'},
      {n: 'Dermapen', d: 'Microagujas que estimulan la renovación de la piel y mejoran cicatrices, poros y líneas finas.', p: 'Cicatrices de acné y poros', s: '45 min', e: 'Plan por sesiones'},
    ],
  },
  {
    id: 'intimo',
    label: 'Íntimo',
    short: 'Íntimo',
    intro: 'Un espacio privado y respetuoso para hablar de comodidad y confianza íntima. La consulta es confidencial.',
    items: [
      {n: 'Bioestimuladores íntimos', d: 'Estimulan colágeno en la zona genital para mejorar la firmeza y la calidad del tejido.', p: 'Flacidez y cambios por edad o partos', s: '30–40 min', e: 'Progresivo en semanas'},
      {n: 'Ácido hialurónico en labios mayores', d: 'Devuelve volumen e hidratación a los labios mayores, con un resultado natural y armónico.', p: 'Pérdida de volumen', s: '30–40 min', e: 'Inmediato'},
      {n: 'Peeling genital', d: 'Unifica el tono de la piel de la zona íntima con protocolos seguros y graduales.', p: 'Cambios de pigmentación', s: '30 min', e: 'Plan por sesiones'},
      {n: 'Skinbooster íntimo', d: 'Hidratación profunda del tejido íntimo para mayor confort y elasticidad.', p: 'Resequedad', s: '30 min', e: 'Plan por sesiones'},
      {n: 'Hilos íntimos', d: 'Hilos que estimulan colágeno y aportan firmeza al tejido de la zona íntima.', p: 'Laxitud del tejido', s: '40 min', e: 'Según valoración'},
    ],
  },
  {
    id: 'regen',
    label: 'Medicina regenerativa',
    short: 'Regenerativa',
    intro: 'Tratamientos para el dolor, la recuperación y el bienestar de tu cuerpo, siempre con valoración médica previa.',
    items: [
      {n: 'Biopuntura', d: 'Aplicación de medicamentos biológicos en puntos específicos para apoyar el manejo del dolor y la inflamación.', p: 'Dolor muscular y articular', s: '30 min', e: 'Plan por sesiones'},
      {n: 'Bioinfusión', d: 'Infusión intravenosa de vitaminas, minerales y antioxidantes según tus necesidades.', p: 'Cansancio y bienestar general', s: '45–60 min', e: 'Plan por sesiones'},
      {n: 'Exosomas', d: 'Terapia regenerativa que apoya los procesos de reparación del cuerpo, indicada tras valoración médica.', p: 'Recuperación de tejidos', s: 'Según protocolo', e: 'Según valoración'},
      {n: 'Células madre', d: 'Terapia regenerativa avanzada, indicada solo después de una valoración médica completa.', p: 'Casos seleccionados', s: 'Según protocolo', e: 'Según valoración'},
      {n: 'Aplicaciones intraarticulares', d: 'Aplicación de medicamentos dentro de la articulación para aliviar el dolor y mejorar la movilidad.', p: 'Dolor articular', s: '30 min', e: 'Según valoración'},
      {n: 'Ácido hialurónico en rodillas', d: 'Lubrica la articulación de la rodilla para disminuir el dolor y mejorar el movimiento.', p: 'Desgaste de rodilla (artrosis)', s: '30 min', e: 'Según valoración'},
    ],
  },
];

export const doctor = {
  title: ['Conoce a la', '*Dra.* *Verónica*'],
  body: 'Médica general con enfoque en medicina estética, en Armenia. Su consulta se basa en una idea sencilla: que te veas descansada y luminosa, nunca transformada. Escucha primero, explica cada opción con claridad y diseña un plan a tu medida.',
  facts: [
    ['Formación', 'Médica general con enfoque en medicina estética'],
    ['Enfoque', 'Estética facial, íntima y medicina regenerativa'],
    ['Consultorio', 'Mall Privilegio, Armenia, Quindío'],
    ['Horario', '8:00 a. m. – 4:00 p. m. · solo con cita previa'],
  ],
};

export const visit = [
  ['Te escuchamos', 'Qué te molesta, qué esperas y qué no quieres cambiar.'],
  ['Valoración médica', 'Revisión de tu piel, tus antecedentes y tus medicamentos.'],
  ['Tu plan', 'Opciones, precios y cuidados explicados con calma.'],
  ['Tú decides', 'Puedes tratarte ese día o pensarlo con tranquilidad.'],
];

export const faq = [
  ['¿Duele la aplicación de bótox?', 'Se siente como pequeños pinchazos de pocos segundos. Se usan agujas muy finas y, si lo necesitas, anestesia tópica.'],
  ['¿Se va a notar que me hice algo?', 'La idea es que no. Se trabaja con dosis y técnicas que respetan tu expresión: que te veas descansada, no diferente.'],
  ['¿Cuándo veo los resultados?', 'Con el bótox empiezas a notar cambios entre el día 3 y el 7, y el resultado completo hacia las dos semanas. Los bioestimuladores son graduales.'],
  ['¿Puedo volver a mi rutina el mismo día?', 'En la mayoría de los procedimientos faciales sí. Recibirás indicaciones específicas para las primeras horas.'],
  ['¿Quién no debería hacerse estos tratamientos?', 'Hay casos en que se deben aplazar, por ejemplo durante el embarazo o la lactancia, o con ciertas condiciones médicas. Por eso la valoración siempre va primero.'],
  ['¿La consulta íntima es confidencial?', 'Sí. Es una consulta privada, con lenguaje respetuoso y sin juicios.'],
  ['¿Atienden sin cita?', 'No. La atención es solo con cita previa, de 8:00 a. m. a 4:00 p. m. Escríbenos por WhatsApp para agendar.'],
];

export const footer = {
  note: 'La información de este sitio es educativa y no reemplaza una consulta médica. Todo procedimiento requiere valoración previa y consentimiento informado; los resultados varían en cada paciente.',
  links: [
    {label: 'Tratamiento de datos', href: '#privacidad'},
    {label: 'Instagram', href: '#'},
  ],
};

/** Hero de bótox al estilo Colibrí: un vial flotando con la palabra gigante detrás. */
export const botox = {
  eyebrow: 'Tratamiento estrella',
  word: 'Bótox',
  line: 'Suaviza las líneas de expresión sin congelar tu rostro. Te ves descansada, no "operada".',
  cards: [
    {label: 'Se nota en', value: '3 a 7 días', note: 'Resultado completo hacia las 2 semanas'},
    {label: 'Dura', value: '4 a 6 meses', note: 'Varía en cada paciente'},
  ],
  cta: 'Preguntar por bótox',
};

/**
 * Antes y después. SOLO fotos reales de pacientes con consentimiento firmado.
 * Para agregar un caso: pon las dos fotos en public/media (misma encuadre y luz)
 * y añade aquí {title, before, after, note}. Mientras esté vacío, la página
 * #resultados muestra marcos vacíos y no aparece en el menú.
 */
export const beforeAfter: {title: string; before: string; after: string; note: string}[] = [];
