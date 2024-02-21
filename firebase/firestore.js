import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, setDoc, where } from 'firebase/firestore'; 
import { db } from './firebase';
import { getDownloadURL } from './storage';

const RECEIPT_COLLECTION = 'receipts';

export function addReceipt(uid, date, items, amount, imageBucket) {
  addDoc(collection(db, RECEIPT_COLLECTION), { uid, date, items, amount, imageBucket });
}

 export async function getReceiptsMvp(uid) {
  const receipts = query(collection(db, RECEIPT_COLLECTION), where("uid", "==", uid), orderBy("date", "desc"));
  return await processReceipts(receipts);
}

export async function getReceiptsOcr(uid, isConfirmed) {
  let receipts;
  if (isConfirmed) {
    receipts = query(collection(db, RECEIPT_COLLECTION), where("uid", "==", uid), orderBy("date", "desc"));    

    const snapshot = await getDocs(receipts);

    let allReceipts = [];
    for (const documentSnapshot of snapshot.docs) {
      const receipt = documentSnapshot.data();
      if (receipt['isConfirmed'] == null || receipt['isConfirmed']) {
        allReceipts.push({
          ...receipt, 
          date: receipt['date'].toDate(), 
          id: documentSnapshot.id,
          imageUrl: await getDownloadURL(receipt['imageBucket']),
          imageBucket: receipt['imageBucket'],
        });
      }
    }
    return allReceipts; 
  } else {
    receipts = query(collection(db, RECEIPT_COLLECTION), where("uid", "==", uid), where("isConfirmed", "==", isConfirmed), orderBy("date", "desc"));
  }

  return processReceipts(receipts);
}

async function processReceipts(receipts) {
  const snapshot = await getDocs(receipts);

  let allReceipts = [];
  for (const documentSnapshot of snapshot.docs) {
    const receipt = documentSnapshot.data();
    allReceipts.push({
      ...receipt, 
      date: receipt['date'].toDate(), 
      id: documentSnapshot.id,
      imageUrl: await getDownloadURL(receipt['imageBucket']),
      imageBucket: receipt['imageBucket'],
    });
  }
  return allReceipts;
}

export function updateReceipt(docId, uid, date, items, amount, imageBucket, isConfirmed) {
  setDoc(doc(db, RECEIPT_COLLECTION, docId), { uid, date, items, amount, imageBucket, isConfirmed });
}

export function deleteReceipt(id) {
  deleteDoc(doc(db, RECEIPT_COLLECTION, id));
}