const tf = require('@tensorflow/tfjs-node');
 
async function predictClassification(model, image) {
  const tensor = tf.node
    .decodeJpeg(image)
    .resizeNearestNeighbor([224, 224])
    .expandDims()
    .toFloat()
 
  const prediction = model.predict(tensor);
  const score = await prediction.data();
  const confidenceScore = Math.max(...score) * 100;
 
  const classes = ['Cancer', 'Non-cancer'];
 
  const classResult = tf.argMax(prediction, 1).dataSync()[0];
  const label = classes[classResult];
 
  let explanation, suggestion;
 
  if (label === 'Cancer') {
    explanation = ""
    suggestion = "Segera periksa ke dokter!"
  }
 
  if (label === 'Non-cancer') {
    explanation = ""
    suggestion = "Anda Sehat"
  }
 
  return { confidenceScore, label, explanation, suggestion };
}
 
module.exports = predictClassification;