const axios = require('axios');

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const reqData = JSON.parse(event.body);

    const messages = reqData.messages.map(msg => ({ content: msg.content, role: msg.role }));

    const newData = {
        model_name: reqData.model,
        messages: messages
    };

    const newHeaders = {
        'Content-Type': 'application/json',
        'Token': event.headers.authorization.split(' ')[1],  // Assuming 'Bearer {API_KEY}' format
    };

    try {
        const response = await axios.post('https://www.seaart.ai/api/v1/chat-completion/completion', newData, { headers: newHeaders });

        console.log('Status Code:', response.status);
        console.log('Response Content:', response.data);

        const formattedResponse = {
            choices: [
                {
                    message: {
                        role: 'assistant',
                        content: response.data
                    },
                    index: 0,
                    finish_reason: 'stop'
                }
            ]
        };

        return { statusCode: 200, body: JSON.stringify(formattedResponse) };
    } catch (error) {
        console.error(error);
        return { statusCode: 500, body: 'An error occurred while forwarding the request.' };
    }
};
