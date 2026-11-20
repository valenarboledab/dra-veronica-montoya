import {POLICY_VERSION, WA_SHOW} from '../content';


/**
 * Política de tratamiento de datos personales (Ley 1581 de 2012 y Decreto 1377 de 2013,
 * compilado en el Decreto 1074 de 2015). Borrador para que la doctora o su abogado lo revisen:
 * falta su número de documento y un correo de contacto.
 */
const updated = '19 de noviembre de 2026';
const ADDR = 'Carrera 14 No. 1A-118, Piso 3, Consultorio 5, Armenia, Quindío, Colombia';

const sections: [string, string[]][] = [
  [
    '1. Responsables del tratamiento',
    [
      'EXORA es la marca bajo la cual atienden la Dra. Verónica Montoya (médica general con enfoque en medicina regenerativa) y la Dra. Susana Zárate (ecografías), quienes actúan como responsables del tratamiento de los datos personales que se recogen en este sitio, por WhatsApp y en el consultorio (en adelante, "EXORA" o "las Responsables").',
      'Domicilio: ' + ADDR + '. Canal de atención de datos: WhatsApp ' + WA_SHOW + ' · Instagram @exora.regeneracion.',
    ],
  ],
  [
    '2. Marco legal',
    [
      'Esta política se expide en cumplimiento de la Constitución Política (artículo 15), la Ley Estatutaria 1581 de 2012, el Decreto 1377 de 2013 (compilado en el Decreto Único 1074 de 2015) y, para la historia clínica, la Ley 23 de 1981 y la Resolución 1995 de 1999 del Ministerio de Salud.',
    ],
  ],
  [
    '3. Definiciones',
    [
      'Dato personal: cualquier información que identifique o haga identificable a una persona. Dato sensible: el que afecta la intimidad, como los datos de salud o las fotografías clínicas. Titular: la persona dueña de los datos. Tratamiento: cualquier operación sobre los datos (recolección, almacenamiento, uso, circulación o supresión). Autorización: el consentimiento previo, expreso e informado del titular.',
    ],
  ],
  [
    '4. Qué datos recogemos',
    [
      'Al agendar una cita: nombre completo, número de celular, el tratamiento de interés y el horario preferido. Estos datos son necesarios para agendar; sin ellos y sin tu autorización no es posible gestionar la cita.',
      'Durante la conversación por WhatsApp: los mensajes, audios o imágenes que decidas enviarnos.',
      'Si eres paciente: datos de salud (antecedentes, medicamentos, alergias, resultados de ecografía, fotografías clínicas) y los demás datos de tu historia clínica. Son datos sensibles (artículo 5 de la Ley 1581 de 2012).',
    ],
  ],
  [
    '5. Para qué los usamos (finalidades)',
    [
      'a) Agendar, confirmar, reprogramar o cancelar citas y comunicarnos contigo por WhatsApp o llamada.',
      'b) Prestarte la atención médica: valoración, procedimientos, ecografías, seguimiento, indicaciones de cuidado y diligenciamiento de la historia clínica.',
      'c) Enviarte recordatorios de tus citas y controles.',
      'd) Atender tus peticiones, quejas y reclamos, y cumplir obligaciones legales, contables y ante autoridades.',
      'e) Solo si lo autorizas aparte (casilla opcional): enviarte información de tratamientos, novedades y promociones. Puedes pedir que dejemos de hacerlo en cualquier momento.',
      'f) Solo con una autorización escrita, expresa y separada: publicar fotografías de antes y después. Negarte no afecta tu atención y puedes retirarla cuando quieras.',
    ],
  ],
  [
    '6. Cómo nos das tu autorización',
    [
      'En el formulario de agenda de este sitio debes marcar la casilla de autorización; sin ella no es posible continuar. Al pulsar "Continuar en WhatsApp", el mensaje que envías incluye el texto de tu autorización y la versión de esta política, lo que queda como prueba de tu consentimiento con fecha y hora.',
      'En el consultorio, la autorización para los datos de salud y, si aplica, para fotografías, se firma por escrito antes de la atención. También se entiende otorgada por conductas inequívocas, como escribirnos para solicitar una cita, en los términos del Decreto 1377 de 2013.',
    ],
  ],
  [
    '7. Datos sensibles y de menores',
    [
      'No estás obligada a autorizar el tratamiento de datos sensibles ni a responder preguntas sobre ellos. Sin embargo, los datos de salud son indispensables para atenderte de forma segura; se tratan solo con tu autorización expresa, con acceso restringido al personal médico y bajo reserva profesional.',
      'Los datos de menores de 18 años solo se tratan con autorización de su representante legal y respetando su interés superior.',
    ],
  ],
  [
    '8. Con quién los compartimos',
    [
      'No vendemos, alquilamos ni cedemos tus datos. Solo los compartimos con autoridades cuando la ley lo exige, entre las Responsables para coordinar tu atención, y con proveedores que actúan como encargados: WhatsApp (Meta Platforms) para la comunicación y GitHub (proveedor del sitio web).',
      'Algunos de estos proveedores almacenan información fuera de Colombia. Al aceptar esta política autorizas esa transferencia o transmisión internacional, que se hace con proveedores que ofrecen niveles adecuados de protección (artículo 26 de la Ley 1581 de 2012).',
    ],
  ],
  [
    '9. Cookies y navegación',
    [
      'Este sitio no usa cookies propias, ni de publicidad, ni herramientas de analítica o seguimiento, por lo que no necesitas aceptar cookies para navegar. El formulario de agenda no guarda tus datos en el sitio: solo arma el mensaje que tú decides enviar por WhatsApp.',
      'Como cualquier servidor web, el proveedor de alojamiento (GitHub Pages) puede registrar datos técnicos de la conexión, como la dirección IP, por motivos de seguridad. Si en el futuro incorporamos cookies o analítica, actualizaremos esta política y te pediremos tu consentimiento antes.',
    ],
  ],
  [
    '10. Tus derechos',
    [
      'Como titular puedes: (i) conocer, actualizar y rectificar tus datos; (ii) pedir prueba de la autorización que nos diste; (iii) saber para qué se han usado; (iv) presentar quejas ante la Superintendencia de Industria y Comercio (SIC) por infracciones a la ley, después de agotar el trámite con nosotras; (v) revocar la autorización o pedir la supresión de tus datos cuando no exista un deber legal o contractual de conservarlos, y (vi) acceder gratis a tus datos.',
      'La historia clínica no puede suprimirse: la ley obliga a conservarla durante el tiempo que fija la Resolución 1995 de 1999 y sus modificaciones.',
    ],
  ],
  [
    '11. Cómo ejercer tus derechos',
    [
      'Escríbenos por WhatsApp al ' + WA_SHOW + ' o acércate al consultorio, indicando tu nombre completo, tu número de documento, la solicitud concreta y un medio de respuesta. Pueden hacerlo también tu representante o apoderado, acreditando esa calidad.',
      'Consultas: se responden en un máximo de diez (10) días hábiles, prorrogables cinco (5) días hábiles más. Reclamos: se responden en un máximo de quince (15) días hábiles, prorrogables ocho (8) días hábiles más; si el reclamo está incompleto te pediremos completarlo dentro de los cinco (5) días siguientes (artículos 14 y 15 de la Ley 1581 de 2012).',
    ],
  ],
  [
    '12. Seguridad y conservación',
    [
      'Aplicamos medidas técnicas, humanas y administrativas razonables para proteger tu información contra pérdida, consulta, uso o acceso no autorizado. Conservamos los datos de agenda mientras exista una relación contigo o hasta que pidas su supresión, y los de la historia clínica por los plazos legales.',
    ],
  ],
  [
    '13. Vigencia y cambios',
    [
      'Esta política (versión ' + POLICY_VERSION + ') rige desde el ' + updated + ' y las bases de datos estarán vigentes mientras se cumplan sus finalidades. Cualquier cambio sustancial se publicará en esta página y, si cambia las finalidades, te pediremos una nueva autorización.',
    ],
  ],
];

export function Privacy() {
  return (
    <article className="max-w-[46rem]">
      <p className="flex items-center gap-2 text-micro font-medium text-mute uppercase">
        <span className="size-1.5 rounded-full bg-coral" />
        Ley 1581 de 2012
      </p>
      <h1 className="mt-3 font-display text-title font-medium">
        Política de tratamiento <span className="accent">de datos</span>
      </h1>
      <p className="mt-4 text-small text-mute">Última actualización: {updated}</p>
      <div className="mt-10 grid gap-8">
        {sections.map(([title, paras]) => (
          <section key={title}>
            <h2 className="font-display text-[1.25rem] font-medium tracking-[-0.02em]">{title}</h2>
            {paras.map((t) => (
              <p key={t.slice(0, 40)} className="mt-2.5 text-copy text-ink/75">
                {t}
              </p>
            ))}
          </section>
        ))}
      </div>
    </article>
  );
}
