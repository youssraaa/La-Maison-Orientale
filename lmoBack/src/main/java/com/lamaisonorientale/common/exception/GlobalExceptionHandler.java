package com.lamaisonorientale.common.exception;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.lamaisonorientale.email.EmailDeliveryException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(error.getField(), error.getDefaultMessage());
        }

        ApiErrorResponse body = new ApiErrorResponse(
                Instant.now(),
                HttpStatus.BAD_REQUEST.value(),
                "Validation échouée",
                "Veuillez corriger les champs indiqués.",
                fieldErrors
        );
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiErrorResponse> handleIllegalArgument(IllegalArgumentException ex) {
        ApiErrorResponse body = new ApiErrorResponse(
                Instant.now(),
                HttpStatus.BAD_REQUEST.value(),
                "Requête invalide",
                ex.getMessage(),
                Map.of("_form", ex.getMessage())
        );
        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(EmailDeliveryException.class)
    public ResponseEntity<ApiErrorResponse> handleMailFailure(EmailDeliveryException ex) {
        ApiErrorResponse body = new ApiErrorResponse(
                Instant.now(),
                HttpStatus.SERVICE_UNAVAILABLE.value(),
                "Envoi e-mail impossible",
                "Votre message a été enregistré mais la notification au restaurant a échoué. "
                        + "Merci de nous contacter par téléphone si besoin urgent.",
                Map.of("_form", ex.getMessage())
        );
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleUnexpected(Exception ex) {
        ApiErrorResponse body = new ApiErrorResponse(
                Instant.now(),
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Erreur serveur",
                "Une erreur inattendue est survenue. Veuillez réessayer plus tard.",
                Map.of()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}
