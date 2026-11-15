import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';
import { authenticate, authorize, isOwnerOrAdmin } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { uploadImage } from '../middlewares/upload.js';
import * as s from '../validators/schemas.js';
import * as auth from '../controllers/authController.js';
import * as users from '../controllers/userController.js';
import * as activities from '../controllers/activityController.js';
import * as publications from '../controllers/publicationController.js';
import * as images from '../controllers/imageController.js';
import * as quizzes from '../controllers/quizController.js';
import * as steps from '../controllers/stepController.js';
import * as reactions from '../controllers/reactionController.js';
import * as userRepo from '../repositories/userRepository.js';
import * as activityRepo from '../repositories/activityRepository.js';
import * as publicationRepo from '../repositories/publicationRepository.js';
import * as imageRepo from '../repositories/imageRepository.js';
import * as resultRepo from '../repositories/quizResultRepository.js';
import * as stepRepo from '../repositories/stepRepository.js';
import * as reactionRepo from '../repositories/reactionRepository.js';

// Ordre : authentification → rôle → validation des params → propriété (lue en base) → body → contrôleur.
const visitor = authenticate({ optional: true });
const signedIn = authenticate();
const admin = [signedIn, authorize('admin')];
const byId = validate({ params: s.idParam });
const owner = (repo) => isOwnerOrAdmin((req) => repo.findOwnership(req.valid.params.id));
const ownsAccount = isOwnerOrAdmin(async (req) => {
  const user = await userRepo.findById(req.valid.params.id);
  return user && { owner_id: user.id, visibility: 'public' };
});
const ownsImage = isOwnerOrAdmin((req) => imageRepo.findWithParent(req.valid.params.id));

const router = Router();

router.get('/health', (req, res) => res.json({ ok: true }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: env.authRateLimit,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Trop de tentatives, réessayez dans quelques minutes' },
});
router.post('/auth/register', authLimiter, validate({ body: s.registerBody }), auth.register);
router.post('/auth/login', authLimiter, validate({ body: s.loginBody }), auth.login);
router.post('/auth/google', authLimiter, validate({ body: s.googleBody }), auth.google);
router.get('/auth/me', signedIn, auth.me);

router.get('/users', admin, validate({ query: s.usersQuery }), users.list);
router.get('/users/:id', signedIn, byId, ownsAccount, users.get);
router.patch('/users/:id', signedIn, byId, ownsAccount, validate({ body: s.userUpdateBody }), users.update);
router.patch('/users/:id/role', admin, byId, validate({ body: s.roleBody }), users.setRole);
router.delete('/users/:id', signedIn, byId, ownsAccount, users.remove);

router.get('/activities', visitor, validate({ query: s.activitiesQuery }), activities.list);
router.get('/activities/:id', visitor, byId, activities.get);
router.post('/activities', signedIn, validate({ body: s.activityBody }), activities.create);
router.patch('/activities/:id', signedIn, byId, owner(activityRepo), validate({ body: s.activityPatch }), activities.update);
router.delete('/activities/:id', signedIn, byId, owner(activityRepo), activities.remove);
router.post('/activities/:id/images', signedIn, byId, owner(activityRepo), uploadImage,
  validate({ body: s.imageFields }), activities.addImage);

router.post('/activities/:id/steps', signedIn, byId, owner(activityRepo), validate({ body: s.stepBody }), steps.create);
router.put('/activities/:id/steps/order', signedIn, byId, owner(activityRepo), validate({ body: s.stepOrderBody }), steps.reorder);
router.patch('/steps/:id', signedIn, byId, owner(stepRepo), validate({ body: s.stepPatch }), steps.update);
router.delete('/steps/:id', signedIn, byId, owner(stepRepo), steps.remove);
router.post('/steps/:id/images', signedIn, byId, owner(stepRepo), uploadImage,
  validate({ body: s.imageFields }), steps.addImage);

router.get('/publications', visitor, validate({ query: s.publicationsQuery }), publications.list);
router.get('/publications/:id', visitor, byId, publications.get);
router.post('/publications', signedIn, validate({ body: s.publicationBody }), publications.create);
router.patch('/publications/:id', signedIn, byId, owner(publicationRepo), validate({ body: s.publicationPatch }), publications.update);
router.delete('/publications/:id', signedIn, byId, owner(publicationRepo), publications.remove);
router.post('/publications/:id/images', signedIn, byId, owner(publicationRepo), uploadImage,
  validate({ body: s.imageFields }), publications.addImage);

router.put('/publications/:id/like', signedIn, byId, reactions.like);
router.delete('/publications/:id/like', signedIn, byId, reactions.unlike);
router.get('/publications/:id/comments', visitor, byId, reactions.listComments);
router.post('/publications/:id/comments', signedIn, byId, validate({ body: s.commentBody }), reactions.createComment);
router.delete('/comments/:id', signedIn, byId, owner(reactionRepo), reactions.removeComment);

router.get('/images/:id', visitor, byId, images.get);
router.get('/images/:id/file', visitor, byId, images.file);
router.patch('/images/:id', signedIn, byId, ownsImage, validate({ body: s.imagePatch }), images.update);
router.delete('/images/:id', signedIn, byId, ownsImage, images.remove);

router.get('/quizzes', visitor, validate({ query: s.pageQuery }), quizzes.list);
router.get('/quizzes/:id', visitor, byId, quizzes.get);
router.post('/quizzes', admin, validate({ body: s.quizBody }), quizzes.create);
router.patch('/quizzes/:id', admin, byId, validate({ body: s.quizPatch }), quizzes.update);
router.delete('/quizzes/:id', admin, byId, quizzes.remove);
router.post('/quizzes/:id/questions', admin, byId, validate({ body: s.questionBody }), quizzes.createQuestion);
router.patch('/questions/:id', admin, byId, validate({ body: s.questionPatch }), quizzes.updateQuestion);
router.delete('/questions/:id', admin, byId, quizzes.removeQuestion);
router.post('/questions/:id/choices', admin, byId, validate({ body: s.choiceBody }), quizzes.createChoice);
router.patch('/choices/:id', admin, byId, validate({ body: s.choicePatch }), quizzes.updateChoice);
router.delete('/choices/:id', admin, byId, quizzes.removeChoice);

router.post('/quizzes/:id/results', signedIn, byId, validate({ body: s.answersBody }), quizzes.submitResult);
router.get('/quiz-results', signedIn, validate({ query: s.resultsQuery }), quizzes.listResults);
router.get('/quiz-results/:id', signedIn, byId, owner(resultRepo), quizzes.getResult);
router.delete('/quiz-results/:id', signedIn, byId, owner(resultRepo), quizzes.removeResult);

export default router;
