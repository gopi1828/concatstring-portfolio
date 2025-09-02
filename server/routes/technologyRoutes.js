const express = require('express');
const { listTechnologies, createTechnology, updateTechnology, deleteTechnology } = require('../controller/technologyController');

const router = express.Router();

router.get('/', listTechnologies);
router.post('/', createTechnology);
router.patch('/:id', updateTechnology);
router.delete('/:id', deleteTechnology);

module.exports = router;


