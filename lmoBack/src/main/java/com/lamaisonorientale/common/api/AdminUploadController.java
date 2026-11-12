package com.lamaisonorientale.common.api;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.lamaisonorientale.common.application.ImageUploadService;
import com.lamaisonorientale.common.dto.ImageUploadResponseDto;

@RestController
@RequestMapping("/api/admin/upload")
public class AdminUploadController {

    private final ImageUploadService imageUploadService;

    public AdminUploadController(ImageUploadService imageUploadService) {
        this.imageUploadService = imageUploadService;
    }

    @PostMapping(value = "/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ImageUploadResponseDto uploadImage(@RequestPart("file") MultipartFile file) {
        return new ImageUploadResponseDto(imageUploadService.store(file));
    }
}
