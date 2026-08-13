const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001; // Puerto para el API interno del bot

// Inicializa el cliente de WhatsApp
// Utilizamos LocalAuth para guardar la sesión y no tener que escanear el QR cada vez
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    }
});

// Evento: Generar y mostrar código QR
client.on('qr', (qr) => {
    console.log(' Escanea este código QR con tu WhatsApp:');
    qrcode.generate(qr, { small: true });
});

// Evento: Cliente listo y conectado
client.on('ready', () => {
    console.log('✅ Cliente de WhatsApp listo y conectado!');
});

// Evento: Autenticación exitosa
client.on('authenticated', () => {
    console.log('✅ Autenticado correctamente.');
});

// Evento: Falla de autenticación
client.on('auth_failure', (msg) => {
    console.error('❌ Error de autenticación:', msg);
});

// Evento: Mensajes entrantes (Chatbot básico para dudas)
client.on('message_create', async (msg) => {
    // Evitar que el bot se responda a sí mismo
    if (msg.fromMe) return;

    const texto = msg.body.toLowerCase();

    // Lógica básica de respuestas
    if (texto.includes('hola') || texto.includes('info')) {
        await msg.reply('¡Hola! 👋 Bienvenido a Rifas México. ¿En qué te podemos ayudar?\n\nOpciones:\n1. Escribe *PAGO* para saber cómo pagar tus boletos.\n2. Escribe *SORTEO* para saber cuándo es el sorteo.\n3. Escribe *CONTACTO* para hablar con un asesor.');
    } 
    else if (texto.includes('pago')) {
        await msg.reply('💳 *Métodos de Pago:*\nPuedes pagar mediante transferencia interbancaria (SPEI), depósito en OXXO o tarjeta de débito/crédito. Una vez que apartes tus boletos en la página web, te mostraremos los datos bancarios.');
    }
    else if (texto.includes('sorteo')) {
        await msg.reply('🎟️ *Próximo Sorteo:*\nLa fecha de nuestro sorteo principal se anuncia en nuestra página web y redes sociales. Está sujeto a la venta del 80% de los boletos. ¡Mucha suerte!');
    }
    else if (texto.includes('contacto')) {
        await msg.reply('📞 *Atención al Cliente:*\nEn breve un asesor humano se comunicará contigo. Por favor, deja tu duda específica en este chat.');
    }
});

// Endpoint del API para enviar mensajes (Ej: Envío de Tickets desde Next.js)
app.post('/api/send-ticket', async (req, res) => {
    try {
        const { phone, message } = req.body;
        
        if (!phone || !message) {
            return res.status(400).json({ error: 'Número de teléfono y mensaje son requeridos.' });
        }

        // Formatear el número (agregar código de país si no lo tiene y sufijo @c.us)
        // Asumimos código +52 para México si no viene con +
        let formattedPhone = phone.replace(/\D/g, '');
        if (formattedPhone.length === 10) {
            formattedPhone = '521' + formattedPhone; // 521 es común en MX para móviles en WhatsApp, o solo 52
        } else if (formattedPhone.startsWith('52') && formattedPhone.length === 12) {
            // Ya tiene 52
            // Algunos números en México requieren el 1 después del 52 (521)
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

// Iniciar el servidor API y el cliente de WhatsApp
app.listen(PORT, () => {
    console.log(`🤖 API del Bot escuchando en puerto ${PORT}`);
    console.log('Iniciando cliente de WhatsApp...');
    client.initialize();
});
