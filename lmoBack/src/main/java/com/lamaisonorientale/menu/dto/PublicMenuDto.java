package com.lamaisonorientale.menu.dto;

import java.math.BigDecimal;
import java.util.List;

public record PublicMenuDto(List<PublicCategoryDto> categories) {

    public record PublicCategoryDto(
            String id,
            String title,
            String image,
            String note,
            List<PublicItemDto> items,
            List<PublicSubsectionDto> subsections) {}

    public record PublicSubsectionDto(String title, List<PublicItemDto> items) {}

    public record PublicItemDto(
            Long id,
            String name,
            String description,
            BigDecimal price,
            Boolean featured,
            String imageUrl,
            Boolean disponibleEmporter,
            Boolean disponibleLivraison) {}
}
