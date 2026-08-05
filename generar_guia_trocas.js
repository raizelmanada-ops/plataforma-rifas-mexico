const PDFDocument = require('pdfkit');
const fs = require('fs');

const doc = new PDFDocument({ margin: 50 });
doc.pipe(fs.createWriteStream('Guia_Mantenimiento_Trocas_VIP.pdf'));

// Portada
doc.rect(0, 0, doc.page.width, doc.page.height).fill('#111111');
doc.fillColor('#FFD700').fontSize(24).text('COMUNIDAD VIP: AMANTES DE LOS MOTORES', { align: 'center', margin: 100 });
doc.moveDown(2);
doc.fillColor('#FFFFFF').fontSize(36).text('GUÍA DEFINITIVA', { align: 'center' });
doc.fontSize(20).text('MANTENIMIENTO Y POTENCIA PARA TU TROCA', { align: 'center' });
doc.moveDown(4);
doc.fontSize(14).text('Edición Exclusiva para Miembros', { align: 'center' });
doc.addPage();

// Página 2: Introducción y Motor
doc.rect(0, 0, doc.page.width, doc.page.height).fill('#FFFFFF');
doc.fillColor('#000000').fontSize(24).text('1. El Corazón de tu Vehículo: El Motor', { underline: true });
doc.moveDown();
doc.fontSize(12).text('Para mantener tu troca en óptimas condiciones, el motor debe ser tu prioridad número uno. Esta guía exclusiva te revelará los secretos que los mecánicos expertos utilizan para prolongar la vida útil de los motores de alto rendimiento.');
doc.moveDown();
doc.fontSize(16).text('Cambios de Aceite Estratégicos');
doc.fontSize(12).text('No esperes a los 10,000 km si usas tu troca para carga o en terrenos difíciles. Los expertos recomiendan revisar la viscosidad del aceite sintético cada 5,000 km. Un aceite limpio reduce la fricción térmica y aumenta los caballos de fuerza efectivos.');
doc.moveDown();
doc.fontSize(16).text('Filtros de Aire de Alto Flujo');
doc.fontSize(12).text('Reemplazar el filtro de aire de fábrica por uno de alto rendimiento lavable (como K&N) permite que el motor "respire" mejor, mejorando la respuesta del acelerador y la eficiencia del combustible en un 3% a 5%.');
doc.addPage();

// Página 3: Transmisión y Neumáticos
doc.fontSize(24).text('2. Transmisión y Neumáticos', { underline: true });
doc.moveDown();
doc.fontSize(16).text('Cuidado de la Transmisión Automática');
doc.fontSize(12).text('El peor enemigo de la transmisión es el calor. Si remolcas carga pesada, instala un enfriador de fluido de transmisión auxiliar. Además, realiza un "flush" completo del sistema cada 60,000 km, no solo un drenaje parcial.');
doc.moveDown();
doc.fontSize(16).text('Presión de Neumáticos (El Secreto Olvidado)');
doc.fontSize(12).text('Una presión incorrecta no solo gasta las llantas, sino que hace que tu motor trabaje el doble. Revisa la presión en frío. Para terrenos de asfalto, mantén la presión recomendada por el fabricante. Para arena o lodo, puedes reducir la presión un 20% para ganar tracción, pero no olvides inflarlas al volver a la carretera.');
doc.moveDown();
doc.fontSize(16).text('Alineación y Balanceo');
doc.fontSize(12).text('Realízalo cada 10,000 km o cada vez que sientas vibraciones en el volante a más de 80 km/h. Esto protege la suspensión y los bujes de tu troca.');
doc.addPage();

// Página 4: Conclusión VIP
doc.rect(0, 0, doc.page.width, doc.page.height).fill('#111111');
doc.fillColor('#FFD700').fontSize(24).text('GRACIAS POR UNIRTE A LA COMUNIDAD VIP', { align: 'center', margin: 100 });
doc.moveDown(2);
doc.fillColor('#FFFFFF').fontSize(14).text('Tu membresía incluye actualizaciones periódicas de esta guía y acceso a eventos y beneficios exclusivos.', { align: 'center' });
doc.moveDown(2);
doc.fontSize(12).text('Copyright 2026 - Comunidad VIP Amantes de los Motores. Todos los derechos reservados.', { align: 'center' });

doc.end();
console.log('PDF generado exitosamente');
