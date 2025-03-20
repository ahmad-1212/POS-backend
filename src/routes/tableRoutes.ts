import { Router } from 'express';
import {
  createTable,
  deleteTable,
  getTables,
} from '../controllers/tableController';
import { protect } from '../middlewares/protect';

const router = Router();

router.use(protect);
router.route('/').get(getTables).post(createTable);
router.delete('/:id', deleteTable);

export default router;
