package com.inf5190.chat.messages.repository;

import com.google.api.core.ApiFuture;
import com.google.cloud.Timestamp;
import com.google.cloud.firestore.CollectionReference;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.Query;
import com.google.cloud.firestore.QuerySnapshot;
import com.google.cloud.firestore.WriteResult;
import com.google.cloud.storage.Bucket;
import com.google.cloud.storage.Storage;
import com.google.firebase.cloud.FirestoreClient;
import com.google.firebase.cloud.StorageClient;
import com.inf5190.chat.messages.model.Message;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

import com.inf5190.chat.messages.model.NewMessageRequest;
import java.util.concurrent.ExecutionException;
import java.util.logging.Logger;

import io.jsonwebtoken.io.Decoders;
import org.springframework.stereotype.Repository;

@Repository
public class MessageRepository {

    private static final String COLLECTION_NAME = "messages";
    private static final String BUCKET_NAME = "inf5190-chat-5b338.firebasestorage.app";
    private final Firestore firestore = FirestoreClient.getFirestore();
    private static final Logger logger = Logger.getLogger(
        MessageRepository.class.getName()
    );

    public Message createMessage(NewMessageRequest message)
        throws ExecutionException, InterruptedException {
        CollectionReference messagesCollection = firestore.collection(
            COLLECTION_NAME
        );

        DocumentReference docRef = messagesCollection.document();
        String imageUrl = null;

        if(message.imageData() != null){
            Bucket b = StorageClient.getInstance().bucket(BUCKET_NAME);
            String path = String.format("images/%s.%s", docRef.getId(),
                    message.imageData().type());
            b.create(path, Decoders.BASE64.decode(message.imageData().data()),
                    Bucket.BlobTargetOption.predefinedAcl(Storage.PredefinedAcl.PUBLIC_READ));
            imageUrl= String.format("https://storage.googleapis.com/%s/%s", BUCKET_NAME,
                    path);
        }

        FirestoreMessage firestoreMessage = new FirestoreMessage(
            docRef.getId(),
            message.username(),
            Timestamp.now(),
            message.text(),
            imageUrl
        );

        ApiFuture<WriteResult> future = docRef.set(firestoreMessage);
        future.get();

        return new Message(
            docRef.getId(),
            message.text(),
            message.username(),
            firestoreMessage.getTimestamp().toDate().getTime(),
            imageUrl
        );
    }

    public List<Message> getMessages(String fromId)
        throws ExecutionException, InterruptedException {
        CollectionReference messagesCollection = firestore.collection(
            COLLECTION_NAME
        );

        Query query;
        if (fromId != null) {
            DocumentReference docRef = messagesCollection.document(fromId);
            DocumentSnapshot snapshot = docRef.get().get();

            if (snapshot.contains("timestamp")) {
                query = messagesCollection
                    .orderBy("timestamp")
                    .startAfter(snapshot)
                    .limitToLast(20);
            } else {
                logger.warning(
                    "DocumentSnapshot sans timestamp pour l'ID: " + fromId
                );
                query = messagesCollection.orderBy("timestamp").limitToLast(20);
            }
        } else {
            query = messagesCollection.orderBy("timestamp").limitToLast(20);
        }

        ApiFuture<QuerySnapshot> querySnapshotFuture = query.get();
        List<FirestoreMessage> firestoreMessages = querySnapshotFuture
            .get()
            .toObjects(FirestoreMessage.class);

        return firestoreMessages
            .stream()
            .map(fm ->
                new Message(
                    fm.getId(),
                    fm.getText(),
                    fm.getUsername(),
                    fm.getTimestamp().toDate().getTime(),
                    fm.getImageUrl()
                )
            )
            .toList();
    }
}
