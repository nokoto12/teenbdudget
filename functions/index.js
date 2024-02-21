import functions, { logger } from 'firebase-functions';
import vision from '@google-cloud/vision';
import admin from 'firebase-admin';

export const RECEIPT_COLLECTION = 'receipts';

admin.initializeApp();
export const readReceiptDetails = functions.storage.object().onFinalize(async (object) => {
  const imageBucket = `gs://${object.bucket}/${object.name}`;
  const client = new vision.ImageAnnotatorClient();

  const [textDetections] = await client.textDetection(imageBucket);
  const [annotation] = textDetections.textAnnotations;
  const text = annotation ? annotation.description : '';
  logger.log(text);
  
  const re = /(.*)\//;
  const uid = re.exec(object.name)[1];

  const receipt = { 
    amount: '23.45',
    date: new Date(),
    imageBucket,
    items: 'best appetizer, best main dish, best dessert',
    uid
  };

  admin.firestore().collection(RECEIPT_COLLECTION).add(receipt);
});