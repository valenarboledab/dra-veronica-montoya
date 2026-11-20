import {WA_SHOW} from '../content';

/**
 * Política de tratamiento de datos personales (Ley 1581 de 2012 y Decreto 1377 de 2013,
 * compilado en el Decreto 1074 de 2015). Borrador para que la doctora o su abogado lo revisen:
 * falta su número de documento y un correo de contacto.
 */
const updated = '19 de noviembre de 2026';

const sections: [string, string[]][] = [
  [
    '1. Responsable del tratamiento',
    [
      'Verónica Montoya, médica general con enfoque en medicina estética (en adelante, "la Responsable"). Consultorio: Calle 25N #13-41, Consultorio 9, Mall Privilegio, Armenia, Quindío, Colombia. Contacto: WhatsApp ' +
        WA_SHOW +
        '.',
    ],
  ],
  [
    '2. Qué datos recogemos',
    [
      'Datos de identificación y contacto: nombre, número de celular y la información que nos escribas por WhatsApp o en el formulario de agenda (tratamiento de interés y horario preferido).',
      'Datos de salud, cuando eres paciente: antecedentes, medicamentos, alergias, fotografías clínicas y la información de tu historia clínica. Son datos sensibles según el artículo 5 de la Ley 1581 de 2012.',
      'Este sitio web no usa cookies de publicidad ni herramientas de seguimiento. Si en el futuro se incorporan, esta política se actualizará antes de hacerlo.',
    ],
  ],
  [
    '3. Para qué los usamos',
    [
      'Responder tus preguntas, agendar, confirmar o reprogramar tus citas.',
      'Prestarte la atención médica: valoración, tratamiento, seguimiento y diligenciamiento de tu historia clínica, que se conserva conforme a la Resolución 1995 de 1999 del Ministerio de Salud.',
      'Enviarte indicaciones de cuidado y recordatorios relacionados con tus tratamientos.',
      'Publicar fotografías de antes y después solo si firmas una autorización expresa y separada para ese fin. Puedes negarte sin que eso afecte tu atención, y retirarla cuando quieras.',
    ],
  ],
  [
    '4. Datos sensibles',
    [
      'No estás obligada a autorizar el tratamiento de datos sensibles. Sin embargo, los datos de salud son necesarios para prestarte la atención médica de forma segura. Solo se tratan con tu autorización expresa y con acceso restringido al personal que los necesita.',
    ],
  ],
  [
    '5. Con quién los compartimos',
    [
      'No vendemos ni cedemos tus datos. Solo se comparten cuando la ley lo exige, con autoridades competentes, o con proveedores que nos ayudan a operar (por ejemplo, WhatsApp de Meta Platforms para la comunicación y el proveedor del sitio web), quienes pueden almacenar información fuera de Colombia bajo sus propias políticas de seguridad.',
    ],
  ],
  [
    '6. Tus derechos',
    [
      'Como titular puedes: conocer, actualizar y rectificar tus datos; pedir prueba de la autorización que nos diste; ser informada del uso que les damos; revocar la autorización o pedir que se eliminen cuando no exista un deber legal de conservarlos (la historia clínica debe conservarse por el tiempo que fija la ley); acceder gratuitamente a tus datos, y presentar quejas ante la Superintendencia de Industria y Comercio.',
    ],
  ],
  [
    '7. Cómo ejercerlos',
    [
      'Escríbenos por WhatsApp al ' + WA_SHOW + ' indicando tu nombre, tu solicitud y un medio de respuesta.',
      'Las consultas se responden en un máximo de diez (10) días hábiles y los reclamos en un máximo de quince (15) días hábiles, prorrogables en los términos de los artículos 14 y 15 de la Ley 1581 de 2012.',
    ],
  ],
  [
    '8. Seguridad y conservación',
    [
      'Aplicamos medidas razonables para proteger tu información contra pérdida, acceso no autorizado o uso indebido. Conservamos los datos mientras sean necesarios para las finalidades descritas y por los plazos que exige la ley.',
    ],
  ],
  [
    '9. Vigencia y cambios',
    [
      'Esta política rige desde el ' + updated + '. Cualquier cambio importante se publicará en esta página.',
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
