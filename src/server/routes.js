const tf = require('@tensorflow/tfjs-node');
const { nanoid } = require('nanoid');

module.exports = [
    {
        method: 'POST',
        path: '/predict',
        options: {
            payload: {
                maxBytes: 1000000, // 1MB
                parse: true,
                output: 'stream',
                multipart: true
            },
            handler: async (request, h) => {
                try {
                    const data = request.payload;

                    if (data.image) {
                        try {
                            // Handle the image stream
                            const chunks = [];
                            for await (const chunk of data.image) {
                                chunks.push(chunk);
                            }
                            const buffer = Buffer.concat(chunks);
                            const model = await tf.loadLayersModel('./model/model.json');

                            let tensor = tf.node.decodeImage(buffer, 3);
                            tensor = tensor.expandDims(0);
                            tensor = tensor.toFloat().div(tf.scalar(255));
                            const prediction = model.predict(tensor);

                            let predictedClass;
                            if (Array.isArray(prediction)) {
                                predictedClass = tf.argMax(prediction[0], 1).dataSync()[0];
                            } else {
                                predictedClass = tf.argMax(prediction, 1).dataSync()[0];
                            }
                            let result;
                            let suggestion;


                            if (predictedClass > 0.5) {
                                result = 'Cancer';
                                suggestion = 'Segera periksa ke dokter!';
                            } else {
                                result = 'Non-Cancer';
                                suggestion = 'Keep monitoring your health regularly.';
                            }

                            return h.response({
                                status: 'success',
                                message: 'Model is predicted successfully',
                                data: {
                                    id: nanoid(16),
                                    result: result,
                                    suggestion: suggestion,
                                    createdAt: new Date().toISOString()
                                }
                            }).code(200);
                        } catch (error) {
                            console.error('Error processing the image:', error);
                            return h.response({ status: 'fail', message: 'Terjadi kesalahan dalam melakukan prediksi' }).code(500);
                        }
                    }
                } catch (error) {
                    console.error('Error handling image upload:', error);
                    return h.response({ status: 'fail', message: 'Terjadi kesalahan dalam melakukan prediksi' }).code(500);
                }
            }
        }
    }
];
