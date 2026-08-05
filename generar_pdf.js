const PDFDocument = require('pdfkit');
const fs = require('fs');

const doc = new PDFDocument({ margin: 50 });

doc.pipe(fs.createWriteStream('Guia_Mentalidad_Millonaria.pdf'));

// Título
doc.fontSize(24).fillColor('#003366').text('GUÍA PRÁCTICA:', { align: 'center' });
doc.fontSize(30).fillColor('#b38728').text('MENTALIDAD MILLONARIA', { align: 'center' });
doc.moveDown(2);

// Introducción
doc.fontSize(14).fillColor('#333333').text('Introducción', { underline: true });
doc.moveDown(0.5);
doc.fontSize(12).fillColor('#555555').text(
  'El camino hacia la abundancia comienza en la mente. Esta guía rápida ha sido diseñada para ' +
  'darte los fundamentos esenciales de la inteligencia financiera. Aplicar estos principios a tu vida diaria ' +
  'no solo mejorará tu manejo del dinero, sino que te preparará para recibir y multiplicar la riqueza.'
);
doc.moveDown(2);

// Capítulo 1
doc.fontSize(14).fillColor('#333333').text('Capítulo 1: El Principio del Ahorro Estratégico', { underline: true });
doc.moveDown(0.5);
doc.fontSize(12).fillColor('#555555').text(
  'La regla de oro de la riqueza es pagarte a ti mismo primero. Cada vez que recibas un ingreso, ' +
  'separa un mínimo del 10% para invertirlo, no para gastarlo. Este fondo es la semilla de tu árbol ' +
  'de abundancia. Nunca toques esta semilla para caprichos temporales.'
);
doc.moveDown(2);

// Capítulo 2
doc.fontSize(14).fillColor('#333333').text('Capítulo 2: Eliminar las Deudas Tóxicas', { underline: true });
doc.moveDown(0.5);
doc.fontSize(12).fillColor('#555555').text(
  'Las deudas de consumo (tarjetas de crédito, préstamos para lujos) son el mayor enemigo del ' +
  'crecimiento financiero. Antes de buscar grandes inversiones, concéntrate en limpiar tu historial ' +
  'crediticio. Utiliza el método de la "Bola de Nieve": paga tus deudas más pequeñas primero para ganar ' +
  'impulso psicológico.'
);
doc.moveDown(2);

// Capítulo 3
doc.fontSize(14).fillColor('#333333').text('Capítulo 3: Múltiples Fuentes de Ingresos', { underline: true });
doc.moveDown(0.5);
doc.fontSize(12).fillColor('#555555').text(
  'El millonario promedio tiene al menos 7 fuentes diferentes de ingresos. Empieza hoy buscando una ' +
  'forma adicional de monetizar tus habilidades, ya sea vendiendo productos, invirtiendo en negocios o ' +
  'educándote en nuevas tecnologías.'
);
doc.moveDown(3);

doc.fontSize(10).fillColor('#999999').text('© 2026 Pathway Hub Foundation. Todos los derechos reservados.', { align: 'center' });

doc.end();
console.log('PDF generado exitosamente.');
