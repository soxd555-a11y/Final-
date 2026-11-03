const router = require('express').Router();
const ctrl = require('../controllers/bookController');
const { uploadCover } = require('../middleware/upload');

router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);
router.post('/', uploadCover, ctrl.create);
router.put('/:id', uploadCover, ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
