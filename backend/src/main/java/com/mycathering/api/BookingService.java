package com.mycathering.api;

import com.google.cloud.firestore.Firestore;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    public List<Booking> findAll() {
        return bookingRepository.findAll();
    }

    public Booking save(Booking booking) {
        // 1. Save to H2 (Relational DB)
        Booking savedBooking = bookingRepository.save(booking);

        // 2. Save to Firestore (NoSQL DB)
        saveToFirestore(savedBooking);

        return savedBooking;
    }

    private void saveToFirestore(Booking booking) {
        try {
            Firestore dbFirestore = FirestoreClient.getFirestore();

            Map<String, Object> docData = new HashMap<>();
            docData.put("id", booking.getId());
            docData.put("clientName", booking.getClientName());
            docData.put("email", booking.getEmail());
            docData.put("eventDate", booking.getEventDate().toString());
            docData.put("eventTime", booking.getEventTime().toString());
            docData.put("guestCount", booking.getGuestCount());
            docData.put("eventType", booking.getEventType());
            docData.put("message", booking.getMessage());
            docData.put("createdAt", System.currentTimeMillis());

            dbFirestore.collection("bookings").document(String.valueOf(booking.getId())).set(docData);
            System.out.println("Booking " + booking.getId() + " sent to Firestore async.");
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Error saving to Firestore: " + e.getMessage());
        }
    }
}
