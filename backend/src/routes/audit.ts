import { Router } from 'express';
import { createAudit, getAuditHistory, getAuditReport, deleteAudit } from '../controllers/auditController';

const router = Router();

// SEO Audit Endpoints
router.post('/', createAudit);
router.get('/history', getAuditHistory);
router.get('/:id', getAuditReport);
router.delete('/:id', deleteAudit);

export default router;
