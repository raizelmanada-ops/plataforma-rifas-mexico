const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
app.use(cors());
app.use(express.json());

const prisma = new PrismaClient();
const PORT = 3001; // Puerto para el API interno del bot

// Inicializa el cliente de WhatsApp
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    }
});

client.on('qr', (qr) => {
    console.log(' Escanea este código QR con tu WhatsApp:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ Cliente de WhatsApp listo y conectado (Dinámicas VIP México)!');
});

client.on('authenticated', () => {
    console.log('✅ Autenticado correctamente.');
});

client.on('auth_failure', (msg) => {
    console.error('❌ Error de autenticación:', msg);
});

// Respuestas dinámicas
client.on('message_create', async (msg) => {
    if (msg.fromMe) return;

    const texto = msg.body.toLowerCase();
    
    // Identificar el número de teléfono que nos escribe
    const remitente = msg.from.replace('@c.us', '');
    // El número suele venir con código de país, por ejemplo 521XXXXXXXXXX o 52XXXXXXXXXX.

    if (texto.includes('hola') || texto.includes('info') || texto === 'menu' || texto === 'menú') {
        await msg.reply('¡Hola! 👋 Bienvenido al *Club VIP Motores* de México.\n\n¿En qué te podemos ayudar?\n\nOpciones:\n1. Escribe *MIS BOLETOS* para ver los números que tienes apartados.\n2. Escribe *PAGO* para saber cómo pagar.\n3. Escribe *SORTEO* para ver detalles del premio.\n4. Escribe *CONTACTO* para hablar con soporte.');
    } 
    else if (texto.includes('pago')) {
        await msg.reply('💳 *Opciones de Pago:*\nNuestro sistema de pagos es 100% seguro a través de nuestra página web. Puedes usar SPEI (transferencia), depósito en OXXO o tarjeta. Si ya separaste tus boletos en la web, sigue el enlace que te dimos para finalizar el pago.');
    }
    else if (texto.includes('sorteo')) {
        try {
            const config = await prisma.config.findFirst();
            const premio = config ? config.prizes : 'GMC Sierra 2024 + $20,000 MXN';
            const loteria = config ? config.lotteryName : 'Lotería Nacional';
            await msg.reply(`🎟️ *Sobre nuestro Sorteo:*\nActualmente estamos participando por: *${premio}*\n\nEl ganador se elegirá con los resultados de la *${loteria}*. ¡Un sorteo transparente y entre amigos!`);
        } catch (e) {
            await msg.reply('🎟️ *Sobre nuestro Sorteo:*\nEl ganador se elige con la Lotería Nacional. Revisa la fecha exacta en nuestra web oficial.');
        }
    }
    else if (texto.includes('contacto') || texto.includes('asesor')) {
        await msg.reply('📞 *Soporte VIP:*\nEn breve alguien del equipo te responderá de forma personalizada. Déjanos tu duda detallada aquí abajo 👇');
    }
    else if (texto.includes('mis boletos') || texto.includes('mis numeros') || texto.includes('mis números')) {
        try {
            // Intentar buscar boletos asociados a este número
            // Prisma busca coincidencias en Customer.phone
            // Dado que el remitente puede tener 521 o 52 al inicio, busquemos usando contains o un match similar
            const phoneStr = remitente.length > 10 ? remitente.slice(-10) : remitente; // Extraemos los últimos 10 dígitos (número local)
            
            const customer = await prisma.customer.findFirst({
                where: {
                    phone: {
                        contains: phoneStr
                    }
                },
                include: {
                    tickets: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            if (customer && customer.tickets.length > 0) {
                let respuesta = `Hola *${customer.name}*, aquí están tus boletos apartados:\n\n`;
                customer.tickets.forEach(ticket => {
                    const statusEmoji = ticket.status === 'PAID' ? '✅ PAGADO' : '⚠️ PENDIENTE';
                    respuesta += `🎫 Boleto: *${ticket.number}* - Estado: ${statusEmoji}\n`;
                });
                
                respuesta += `\nRecuerda que si tienes boletos pendientes, tienes un tiempo límite antes de que el sistema los libere. ¡Mucha suerte! 🍀`;
                await msg.reply(respuesta);
            } else {
                await msg.reply('No encontré boletos registrados con tu número de teléfono. Asegúrate de haberlos apartado en la página web oficial. Si pusiste otro número al registrarte, dínoslo por favor.');
            }
        } catch (e) {
            console.error('Error buscando boletos:', e);
            await msg.reply('Ocurrió un error al buscar tus boletos. Por favor intenta más tarde o espera a un asesor.');
        }
    }
});

// Endpoint del API para enviar mensajes (Ej: Envío de Tickets desde Next.js)
app.post('/api/send-ticket', async (req, res) => {
    try {
        const { phone, message } = req.body;
        
        if (!phone || !message) {
            return res.status(400).json({ error: 'Número de teléfono y mensaje son requeridos.' });
        }

        let formattedPhone = phone.replace(/\D/g, '');
        if (formattedPhone.length === 10) {
            formattedPhone = '521' + formattedPhone; 
        } else if (formattedPhone.startsWith('52') && formattedPhone.length === 12) {
            // Ya tiene 52, en México algunos números requieren el 1 después del 52 (521) para WhatsApp
            // Se puede intentar enviarlo tal cual o probar agregando el 1 si falla. 
            // whatsapp-web.js normalmente maneja 521XXXXXXXXXX
            if (!formattedPhone.startsWith('521')) {
               formattedPhone = '521' + formattedPhone.substring(2);
            }
        }
        
        const chatId = `${formattedPhone}@c.us`;
        
        await client.sendMessage(chatId, message);
        console.log(`Mensaje enviado a ${phone}`);
        
        return res.status(200).json({ success: true, message: 'Mensaje enviado correctamente.' });
    } catch (error) {
        console.error('Error enviando mensaje:', error);
        return res.status(500).json({ error: 'Error interno al enviar el mensaje.' });
    }
});

app.listen(PORT, () => {
    console.log(`🤖 API del Bot escuchando en puerto ${PORT}`);
    console.log('Iniciando cliente de WhatsApp...');
    client.initialize();
});
