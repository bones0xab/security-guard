package org.example.orderservice.service;


import lombok.extern.slf4j.Slf4j;
import org.example.orderservice.entities.Refund;
import org.example.orderservice.repo.RefundRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Slf4j
@Transactional
public class RefundService {

    private final RefundRepository refundRepository;

    public RefundService(RefundRepository refundRepository) {
        this.refundRepository = refundRepository;
    }

    public Refund createRefund(Refund refund) {
        log.info("Saving refund for order ID: {}", refund.getOrderId());
        return refundRepository.save(refund);
    }


    public List<Refund> getAll() {
        return refundRepository.findAll();
    }

    public Refund update(Long id, Refund refund)
    {
        log.info("Updating refund for order ID: {}", id);
        Refund existingRefund = refundRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Refund not found with id: " + id));
        existingRefund.setStatus(refund.getStatus());
        return refundRepository.save(existingRefund);
    }


    public void delete(Long id) {
        log.info("Deleting refund for order ID: {}", id);
        refundRepository.deleteById(id);
    }




}
