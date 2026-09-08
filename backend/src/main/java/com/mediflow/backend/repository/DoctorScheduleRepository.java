package com.mediflow.backend.repository;

import com.mediflow.backend.entity.DoctorSchedule;
import com.mediflow.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DoctorScheduleRepository
        extends JpaRepository<DoctorSchedule, Long> {

    List<DoctorSchedule> findByDoctor(User doctor);
}