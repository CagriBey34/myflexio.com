import express from 'express';
import {
    getDashboardStats,
    getUzmanApplications,
    getUzmanApplicationDetail,
    updateUzmanApplicationStatus,
    getUsers,
    updateUserStatus,
    deleteUser,
    getRandevular,
    updateRandevuDurum,
    getYorumlar,
    deleteYorum,
    getSorular,
    createSoru,
    updateSoru,
    deleteSoru,
    getHastalar,
    getHastaDetail,
    getUzmanlar,
    getUzmanDetail,
    getTedaviPlanlariAdmin,
    aktiveTedaviPlaniAdmin,
    getSistemIban,
    setSistemIban,
    getAktifEslesmeler,
    getAdminEslesmeSeanslari
} from '../controllers/adminController.js';
import { authenticate } from '../../../core/auth/middleware/auth.js';
import { requireAdmin } from '../middleware/adminAuth.js';

const router = express.Router();

router.use(authenticate, requireAdmin);

router.get('/stats', getDashboardStats);
router.get('/uzman-basvurular', getUzmanApplications);
router.get('/uzman-basvurular/:id', getUzmanApplicationDetail);
router.patch('/uzman-basvurular/:id', updateUzmanApplicationStatus);
router.get('/randevular', getRandevular);
router.patch('/randevular/:id', updateRandevuDurum);
router.get('/users', getUsers);
router.patch('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);
router.get('/yorumlar', getYorumlar);
router.delete('/yorumlar/:id', deleteYorum);
router.get('/sorular', getSorular);
router.post('/sorular', createSoru);
router.put('/sorular/:id', updateSoru);
router.delete('/sorular/:id', deleteSoru);
router.get('/hastalar', getHastalar);
router.get('/hastalar/:id', getHastaDetail);
router.get('/uzmanlar-list', getUzmanlar);
router.get('/uzmanlar-list/:id', getUzmanDetail);
router.get('/tedavi-planlari', getTedaviPlanlariAdmin);
router.patch('/tedavi-plani/:id/aktifet', aktiveTedaviPlaniAdmin);
router.get('/sistem-iban', getSistemIban);
router.put('/sistem-iban', setSistemIban);
router.get('/aktif-eslesmeler', getAktifEslesmeler);
router.get('/eslesmeler/:planId/seanslar', getAdminEslesmeSeanslari);

export default router;