// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/");
const invValidate = require('../utilities/inventory-validation')

// Route to build inventory by classification view
router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
)
// Route to build specific vehicle detail view
router.get(
  "/detail/:invId",
  utilities.handleErrors(invController.buildByInvId)
)

// Route to build management view
router.get(
  "/",
  utilities.checkAccountType, 
  utilities.handleErrors(invController.buildManagement)
)

// Route to build add classification view
router.get(
  "/add-classification",
  utilities.checkAccountType, 
  utilities.handleErrors(invController.buildAddClassification)
)

// Route to process add classification
router.post(
  "/add-classification",
  utilities.checkAccountType, 
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
)

// Route to build add inventory view
router.get(
  "/add-inventory",
  utilities.checkAccountType, 
  utilities.handleErrors(invController.buildAddInventory)
)

// Route to process add inventory
router.post(
  "/add-inventory",
  utilities.checkAccountType, 
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
)

// Route to get inventory by classification as JSON
router.get(
  "/getInventory/:classification_id",
  utilities.checkAccountType, 
  utilities.handleErrors(invController.getInventoryJSON)
)

// Route to build edit inventory view
router.get(
  "/edit/:inv_id",
  utilities.checkAccountType,
  utilities.handleErrors(invController.buildEditInventory)
)

// Route to process update inventory
router.post(
  "/update/",
  utilities.checkAccountType,
  invValidate.inventoryRules(),  // validation rules
  invValidate.checkUpdateData,   // update-specific validation
  utilities.handleErrors(invController.updateInventory) // controller
)

// Route to build delete confirmation view
router.get(
  "/delete/:inv_id",
  utilities.checkAccountType,
  utilities.handleErrors(invController.buildDeleteConfirm)
)

// Route to process delete inventory
router.post(
  "/delete",
  utilities.checkAccountType,
  utilities.handleErrors(invController.deleteInventory)
)


module.exports = router;