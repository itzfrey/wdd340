const express = require("express")
const router = express.Router()
const utilities = require("../utilities/")
const adminController = require("../controllers/adminController")

// All routes require Admin access
router.use(utilities.checkAdminOnly)

// View pending approvals
router.get(
  "/approvals",
  utilities.handleErrors(adminController.buildApprovalView)
)

// Approve classification
router.post(
  "/approve-classification/:id",
  utilities.handleErrors(adminController.approveClassification)
)

// Approve inventory
router.post(
  "/approve-inventory/:id",
  utilities.handleErrors(adminController.approveInventory)
)

// Reject classification
router.post(
  "/reject-classification/:id",
  utilities.handleErrors(adminController.rejectClassification)
)

// Reject inventory
router.post(
  "/reject-inventory/:id",
  utilities.handleErrors(adminController.rejectInventory)
)

module.exports = router