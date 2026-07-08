import { Router } from 'express';
import { createPart2Audit } from '../controllers/auditController';

const router = Router();

// Part 2 custom singular POST endpoint
router.post('/', createPart2Audit);

export default router;
