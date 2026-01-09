const express = require("express");
const router = express.Router();
const walletCtrl = require("../../controllers/walletTransactionController/walletTransactionController");

router.post("/create", walletCtrl.createWallet);
router.get("/history/:userId", walletCtrl.getWalletTransactions);
router.put("/update/:id", walletCtrl.updateWalletTransaction);
router.delete("/delete/:id", walletCtrl.deleteWalletTransaction);

module.exports = router;
