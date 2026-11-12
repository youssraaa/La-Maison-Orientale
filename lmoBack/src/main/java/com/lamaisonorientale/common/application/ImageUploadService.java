package com.lamaisonorientale.common.application;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ImageUploadService {

    private static final Set<String> ALLOWED = Set.of("image/jpeg", "image/png", "image/webp", "image/gif");
    private static final long MAX_BYTES = 5L * 1024 * 1024;

    private final Path uploadRoot;

    public ImageUploadService(@Value("${lmo.upload.dir:uploads}") String uploadDir) {
        this.uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Fichier requis.");
        }
        if (file.getSize() > MAX_BYTES) {
            throw new IllegalArgumentException("Image trop volumineuse (max 5 Mo).");
        }
        String contentType = file.getContentType();
        if (!StringUtils.hasText(contentType) || !ALLOWED.contains(contentType.toLowerCase(Locale.ROOT))) {
            throw new IllegalArgumentException("Format non supporté (JPEG, PNG, WebP, GIF).");
        }

        try {
            Files.createDirectories(uploadRoot);
            String extension = extensionFor(contentType);
            String filename = UUID.randomUUID() + extension;
            Path target = uploadRoot.resolve(filename).normalize();
            if (!target.startsWith(uploadRoot)) {
                throw new IllegalArgumentException("Nom de fichier invalide.");
            }
            file.transferTo(target);
            return "/uploads/" + filename;
        } catch (IOException ex) {
            throw new IllegalStateException("Impossible d'enregistrer l'image.", ex);
        }
    }

    private String extensionFor(String contentType) {
        return switch (contentType.toLowerCase(Locale.ROOT)) {
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            default -> ".jpg";
        };
    }
}
