package com.mycathering.api;

import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.google.cloud.firestore.QuerySnapshot;
import com.google.api.core.ApiFuture;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Service
public class BookingService {

    public List<Booking> findAll() {
        try {
            Firestore db = FirestoreClient.getFirestore();
            // Asynchronously retrieve all documents
            ApiFuture<QuerySnapshot> future = db.collection("bookings").get();
            // future.get() blocks on response
            List<QueryDocumentSnapshot> documents = future.get().getDocuments();

            return documents.stream()
                    .map(document -> document.toObject(Booking.class))
                    .collect(Collectors.toList());
        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
            return List.of();
        }
    }

    public Booking save(Booking booking) {
        try {
            Firestore db = FirestoreClient.getFirestore();

            if (booking.getId() == null) {
                // Generate a new ID if not present
                DocumentReference docRef = db.collection("bookings").document();
                booking.setId(docRef.getId());

                // Write to Firestore (blocking for safety)
                docRef.set(booking).get();
            } else {
                // Write to Firestore with existing ID
                db.collection("bookings").document(booking.getId()).set(booking).get();
            }

            System.out.println("Booking " + booking.getId() + " saved to Firestore.");
            return booking;
        } catch (InterruptedException | ExecutionException e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to save booking to Firestore", e);
        }
    }
}
