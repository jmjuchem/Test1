import { Router } from 'express';
import { InventoryController } from '../controllers/InventoryController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, InventoryController.getInventory);
router.post('/cards', authMiddleware, InventoryController.addCard);
router.post('/upgrade-card', authMiddleware, InventoryController.upgradeCard);
router.post('/currency', authMiddleware, InventoryController.addCurrency);

export default router;
