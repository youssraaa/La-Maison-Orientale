package com.lamaisonorientale.horaire.application;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lamaisonorientale.horaire.domain.FermetureExceptionnelle;
import com.lamaisonorientale.horaire.domain.HoraireOuverture;
import com.lamaisonorientale.horaire.dto.FermetureDto;
import com.lamaisonorientale.horaire.dto.HoraireDto;
import com.lamaisonorientale.horaire.dto.PublicHoursDto;
import com.lamaisonorientale.horaire.dto.UpsertFermetureRequest;
import com.lamaisonorientale.horaire.dto.UpsertHoraireRequest;
import com.lamaisonorientale.horaire.infrastructure.FermetureExceptionnelleRepository;
import com.lamaisonorientale.horaire.infrastructure.HoraireOuvertureRepository;

@Service
public class HoraireService {

    private static final String[] JOUR_LABELS = {
        "", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"
    };

    private final HoraireOuvertureRepository horaireRepository;
    private final FermetureExceptionnelleRepository fermetureRepository;

    public HoraireService(
            HoraireOuvertureRepository horaireRepository,
            FermetureExceptionnelleRepository fermetureRepository) {
        this.horaireRepository = horaireRepository;
        this.fermetureRepository = fermetureRepository;
    }

    @Transactional(readOnly = true)
    public List<HoraireDto> listHoraires() {
        return horaireRepository.findAllByOrderByJourSemaineAsc().stream().map(this::toHoraireDto).toList();
    }

    @Transactional
    public HoraireDto upsertHoraire(UpsertHoraireRequest request) {
        if (request.jourSemaine() < 1 || request.jourSemaine() > 7) {
            throw new IllegalArgumentException("Jour de semaine invalide (1–7).");
        }
        if (request.heureOuverture().compareTo(request.heureFermeture()) >= 0) {
            throw new IllegalArgumentException("L'heure d'ouverture doit précéder la fermeture.");
        }

        HoraireOuverture row = horaireRepository.findAllByOrderByJourSemaineAsc().stream()
                .filter(h -> h.getJourSemaine() == request.jourSemaine())
                .findFirst()
                .orElseGet(HoraireOuverture::new);

        row.setJourSemaine(request.jourSemaine());
        row.setHeureOuverture(request.heureOuverture());
        row.setHeureFermeture(request.heureFermeture());
        row.setActif(request.actif() == null || request.actif());

        HoraireDto saved = toHoraireDto(horaireRepository.save(row));
        return saved;
    }

    @Transactional(readOnly = true)
    public List<FermetureDto> listFermetures() {
        return fermetureRepository.findAllByOrderByDateFermetureAsc().stream()
                .map(this::toFermetureDto)
                .toList();
    }

    @Transactional
    public FermetureDto createFermeture(UpsertFermetureRequest request) {
        if (request.dateFermeture() == null) {
            throw new IllegalArgumentException("Date requise.");
        }
        if (fermetureRepository.findByDateFermeture(request.dateFermeture()).isPresent()) {
            throw new IllegalArgumentException("Une fermeture existe déjà à cette date.");
        }
        FermetureExceptionnelle row = new FermetureExceptionnelle();
        row.setDateFermeture(request.dateFermeture());
        row.setMotif(trimMotif(request.motif()));
        FermetureDto saved = toFermetureDto(fermetureRepository.save(row));
        return saved;
    }

    @Transactional
    public FermetureDto updateFermeture(Long id, UpsertFermetureRequest request) {
        FermetureExceptionnelle row = fermetureRepository
                .findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Fermeture introuvable."));
        if (fermetureRepository.existsByDateFermetureAndIdNot(request.dateFermeture(), id)) {
            throw new IllegalArgumentException("Une fermeture existe déjà à cette date.");
        }
        row.setDateFermeture(request.dateFermeture());
        row.setMotif(trimMotif(request.motif()));
        return toFermetureDto(fermetureRepository.save(row));
    }

    @Transactional
    public void deleteFermeture(Long id) {
        FermetureExceptionnelle row = fermetureRepository
                .findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Fermeture introuvable."));
        fermetureRepository.delete(row);
    }

    @Transactional(readOnly = true)
    public boolean isClosed(LocalDate date) {
        if (fermetureRepository.findByDateFermeture(date).isPresent()) {
            return true;
        }
        short dow = (short) date.getDayOfWeek().getValue();
        Optional<HoraireOuverture> horaire = horaireRepository.findAllByOrderByJourSemaineAsc().stream()
                .filter(h -> h.getJourSemaine() == dow)
                .findFirst();
        return horaire.isEmpty() || !Boolean.TRUE.equals(horaire.get().getActif());
    }

    @Transactional(readOnly = true)
    public Optional<OpeningWindow> openingFor(LocalDate date) {
        if (isClosed(date)) {
            return Optional.empty();
        }
        short dow = (short) date.getDayOfWeek().getValue();
        return horaireRepository.findAllByOrderByJourSemaineAsc().stream()
                .filter(h -> h.getJourSemaine() == dow && Boolean.TRUE.equals(h.getActif()))
                .findFirst()
                .map(h -> new OpeningWindow(h.getHeureOuverture(), h.getHeureFermeture()));
    }

    public record OpeningWindow(LocalTime open, LocalTime close) {}

    @Transactional(readOnly = true)
    public PublicHoursDto getPublicHours() {
        List<PublicHoursDto.DaySchedule> schedule = listHoraires().stream()
                .map(h -> new PublicHoursDto.DaySchedule(
                        h.jourLabel(),
                        h.actif()
                                ? formatHour(h.heureOuverture()) + " – " + formatHour(h.heureFermeture())
                                : "Fermé"))
                .toList();
        return new PublicHoursDto(schedule, buildHoursSummary(schedule));
    }

    private String formatHour(LocalTime time) {
        if (time.getMinute() == 0) {
            return String.format("%d:%02d", time.getHour(), time.getMinute());
        }
        return time.toString().substring(0, 5);
    }

    private String buildHoursSummary(List<PublicHoursDto.DaySchedule> schedule) {
        List<String> openDays = schedule.stream()
                .filter(row -> !"Fermé".equalsIgnoreCase(row.time()))
                .map(PublicHoursDto.DaySchedule::day)
                .toList();
        if (openDays.isEmpty()) {
            return "Fermé";
        }
        String range = openDays.size() >= 2
                ? abbrev(openDays.get(0)) + "–" + abbrev(openDays.get(openDays.size() - 1))
                : abbrev(openDays.get(0));
        String sampleTime = schedule.stream()
                .filter(row -> !"Fermé".equalsIgnoreCase(row.time()))
                .map(PublicHoursDto.DaySchedule::time)
                .findFirst()
                .orElse("");
        List<String> closed = schedule.stream()
                .filter(row -> "Fermé".equalsIgnoreCase(row.time()))
                .map(row -> abbrev(row.day()))
                .toList();
        String base = range + " " + sampleTime;
        if (closed.isEmpty()) {
            return base;
        }
        return base + " · " + String.join(", ", closed) + " fermé";
    }

    private String abbrev(String day) {
        return day.length() >= 3 ? day.substring(0, 3) : day;
    }

    private HoraireDto toHoraireDto(HoraireOuverture h) {
        short jour = h.getJourSemaine();
        String label = jour >= 1 && jour <= 7 ? JOUR_LABELS[jour] : "Jour " + jour;
        return new HoraireDto(
                h.getId(),
                jour,
                label,
                h.getHeureOuverture(),
                h.getHeureFermeture(),
                Boolean.TRUE.equals(h.getActif()));
    }

    private FermetureDto toFermetureDto(FermetureExceptionnelle f) {
        return new FermetureDto(f.getId(), f.getDateFermeture(), f.getMotif());
    }

    private static String trimMotif(String motif) {
        if (motif == null || motif.isBlank()) {
            return null;
        }
        return motif.trim();
    }
}
