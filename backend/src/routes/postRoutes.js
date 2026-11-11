import { Router } from 'express';
import * as postController from '../controllers/postController.js';

const router = Router();
router.get('/', postController.list);

export default router;
